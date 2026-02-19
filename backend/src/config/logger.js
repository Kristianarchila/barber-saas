const winston = require("winston");
const path = require("path");

/**
 * Production-ready logger with:
 * - Console transport (always)
 * - File transport with daily rotation (production)
 * - Structured JSON format with timestamps
 * - Separate error log file
 */

// ─── Log directory ──────────────────────────────────────────
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../../logs');

// ─── Custom format ──────────────────────────────────────────
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level}: ${message}${metaStr}`;
    })
);

// ─── Transports ─────────────────────────────────────────────
const transports = [
    // Console: always active
    new winston.transports.Console({
        format: consoleFormat,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    })
];

// File transports: only in production (or when LOG_TO_FILE=true)
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
    // All logs (info and above)
    transports.push(
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'app.log'),
            format: logFormat,
            level: 'info',
            maxsize: 10 * 1024 * 1024,  // 10MB per file
            maxFiles: 14,                // Keep 14 rotated files (~2 weeks)
            tailable: true               // Most recent log is always app.log
        })
    );

    // Error logs only (separate file for quick access)
    transports.push(
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'error.log'),
            format: logFormat,
            level: 'error',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 30,                // Keep 30 error files (~1 month)
            tailable: true
        })
    );
}

// ─── Logger Instance ────────────────────────────────────────
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: {
        service: 'barber-saas',
        env: process.env.NODE_ENV || 'development'
    },
    transports,
    // Don't exit on uncaught exceptions (let the process handler deal with it)
    exitOnError: false
});

// Log startup info
if (process.env.NODE_ENV !== 'test') {
    logger.info('Logger initialized', {
        level: logger.level,
        transports: transports.map(t => t.constructor.name),
        logDir: process.env.NODE_ENV === 'production' ? LOG_DIR : 'console-only'
    });
}

module.exports = logger;
