'use strict';

/**
 * Shared Redis client + rate-limit store.
 *
 * Problem this solves:
 *   - redis.connect() is async. Using the store before the connection is
 *     established causes silent failures on the first requests.
 *   - Having two separate rate-limit files each initializing their own
 *     Redis meant publicRateLimiter.js always fell back to MemoryStore.
 *
 * Usage:
 *   const { getRedisStore } = require('../config/redisClient');
 *   // call once at startup:
 *   const store = await getRedisStore();
 *   // pass store to rateLimit({ store })
 */

const Logger = require('../shared/Logger');

let _store = null;       // cached RedisStore (or undefined = MemoryStore)
let _initialized = false;
let _initPromise = null; // prevents parallel double-init

/**
 * Initialize and return the Redis store for express-rate-limit.
 * Safe to call multiple times — only connects once.
 *
 * Returns:
 *   - RedisStore instance   → if REDIS_URL is set and connection succeeds
 *   - undefined             → falls back to in-process MemoryStore
 */
async function getRedisStore() {
    if (_initialized) return _store;

    // Prevent parallel callers from initializing twice
    if (_initPromise) return _initPromise;

    _initPromise = _init();
    _store = await _initPromise;
    _initialized = true;
    return _store;
}

async function _init() {
    if (!process.env.REDIS_URL) {
        Logger.warn('Redis', 'REDIS_URL not set — rate limiters using MemoryStore (single-instance only)');
        return undefined;
    }

    try {
        const { RedisStore } = require('rate-limit-redis');
        const { createClient } = require('redis');

        const client = createClient({ url: process.env.REDIS_URL });

        // Attach error listener BEFORE connecting so we catch early errors
        client.on('error', (err) =>
            Logger.error('Redis', 'Client error', { error: err.message })
        );

        // Await the connection — fixes the "store used before connected" race condition
        await client.connect();
        Logger.info('Redis', 'Connected — rate limiters using Redis store (multi-instance safe)');

        return new RedisStore({
            sendCommand: (...args) => client.sendCommand(args),
        });

    } catch (err) {
        // Graceful degradation: log clearly and fall back to MemoryStore
        Logger.error('Redis', 'Failed to initialize — falling back to MemoryStore', {
            error: err.message,
            hint: 'Check REDIS_URL and that rate-limit-redis is installed',
        });
        return undefined;
    }
}

module.exports = { getRedisStore };
