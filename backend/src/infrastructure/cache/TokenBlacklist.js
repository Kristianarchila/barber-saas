/**
 * Token Blacklist — MongoDB-backed for Production
 * 
 * Stores blacklisted JWT tokens in MongoDB with TTL auto-expiration.
 * This is safe for multi-instance deployments (horizontal scaling).
 * 
 * Falls back to in-memory Set if MongoDB is not available (dev/test).
 */
const mongoose = require('mongoose');
const logger = require('../../config/logger');

// ─── MongoDB Schema for blacklisted tokens ──────────────────
const blacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reason: {
        type: String,
        default: 'logout'
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // MongoDB TTL: auto-delete when expiresAt is reached
    }
}, {
    timestamps: true
});

// Avoid model recompilation in hot-reload
const BlacklistedToken = mongoose.models.BlacklistedToken
    || mongoose.model('BlacklistedToken', blacklistedTokenSchema);

// ─── In-memory fallback ─────────────────────────────────────
const memoryBlacklist = new Set();
const memoryTimers = new Map();

/**
 * Check if MongoDB is connected and ready
 */
function isMongoReady() {
    return mongoose.connection.readyState === 1;
}

class TokenBlacklist {
    /**
     * Add a token to the blacklist
     * @param {string} token - JWT token to blacklist
     * @param {number} expiresInMs - Time until token naturally expires (ms)
     * @param {object} metadata - Optional metadata (userId, reason)
     */
    async add(token, expiresInMs, metadata = {}) {
        if (!token) return;

        const expiresAt = new Date(Date.now() + expiresInMs);

        // Try MongoDB first
        if (isMongoReady()) {
            try {
                await BlacklistedToken.findOneAndUpdate(
                    { token },
                    {
                        token,
                        expiresAt,
                        userId: metadata.userId,
                        reason: metadata.reason || 'logout'
                    },
                    { upsert: true, new: true }
                );
                return;
            } catch (error) {
                logger.warn('Token blacklist MongoDB write failed, using memory fallback', {
                    error: error.message
                });
            }
        }

        // Fallback: in-memory
        memoryBlacklist.add(token);
        const timer = setTimeout(() => {
            memoryBlacklist.delete(token);
            memoryTimers.delete(token);
        }, expiresInMs);
        memoryTimers.set(token, timer);
    }

    /**
     * Check if a token is blacklisted
     * @param {string} token - JWT token to check
     * @returns {boolean}
     */
    async has(token) {
        if (!token) return false;

        // Check memory first (fastest)
        if (memoryBlacklist.has(token)) return true;

        // Check MongoDB
        if (isMongoReady()) {
            try {
                const found = await BlacklistedToken.exists({ token });
                return !!found;
            } catch (error) {
                logger.warn('Token blacklist MongoDB read failed', {
                    error: error.message
                });
            }
        }

        return false;
    }

    /**
     * Get current blacklist size (for monitoring)
     * @returns {number}
     */
    async size() {
        if (isMongoReady()) {
            try {
                return await BlacklistedToken.countDocuments();
            } catch {
                return memoryBlacklist.size;
            }
        }
        return memoryBlacklist.size;
    }

    /**
     * Clear all blacklisted tokens (use with caution — testing only)
     */
    async clear() {
        for (const timer of memoryTimers.values()) {
            clearTimeout(timer);
        }
        memoryBlacklist.clear();
        memoryTimers.clear();

        if (isMongoReady()) {
            try {
                await BlacklistedToken.deleteMany({});
            } catch (error) {
                logger.warn('Token blacklist clear failed', { error: error.message });
            }
        }
    }
}

// Export singleton instance
module.exports = new TokenBlacklist();
