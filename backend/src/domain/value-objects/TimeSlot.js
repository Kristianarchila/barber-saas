'use strict';

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// Extend once at module level — idempotent in dayjs
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

/** Maximum duration allowed per slot (8 hours). Prevents absurd data in reservations. */
const MAX_DURATION_MINUTES = 480;
const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm';
const DEFAULT_TIMEZONE = 'America/Santiago';

/**
 * TimeSlot — Immutable Value Object
 *
 * Represents a specific time interval on a date, always evaluated
 * within the barbería's own IANA timezone. This is critical for
 * correct multitenant behaviour when barberías span different cities.
 *
 * @example
 * const slot = new TimeSlot('2024-06-15', '10:00', 30, 'America/Santiago');
 */
class TimeSlot {
    // ES2022 private class fields — real encapsulation, not convention
    #date;            // string 'YYYY-MM-DD'
    #startTime;       // string 'HH:MM' (strict two digits)
    #durationMinutes; // positive integer, max MAX_DURATION_MINUTES
    #timezone;        // IANA timezone string

    /**
     * @param {string} date            - Date in 'YYYY-MM-DD' format
     * @param {string} startTime       - Time in strict 'HH:MM' format (e.g. '09:30')
     * @param {number} durationMinutes - Duration > 0 and <= 480 minutes
     * @param {string} [tzName]        - IANA timezone of the barbería (e.g. 'America/Santiago')
     */
    constructor(date, startTime, durationMinutes, tzName = DEFAULT_TIMEZONE) {
        this.#validate(date, startTime, durationMinutes, tzName);

        // Store normalised date within the barbería's timezone to avoid offset drift
        this.#date = dayjs.tz(date, DATE_FORMAT, tzName).format(DATE_FORMAT);
        this.#startTime = startTime;
        this.#durationMinutes = Math.trunc(durationMinutes); // reject floats silently
        this.#timezone = tzName;

        // Prevent any external mutation — Value Objects are immutable by contract
        Object.freeze(this);
    }

    // ─── Private validation ───────────────────────────────────────────────────

    #validate(date, startTime, durationMinutes, tzName) {
        // Type guard: reject numeric timestamps (e.g. 20240101) and nulls
        if (typeof date !== 'string' || date.trim() === '') {
            throw new TypeError(
                `TimeSlot: "date" must be a non-empty string in ${DATE_FORMAT} format. Received: ${JSON.stringify(date)}`
            );
        }

        // Strict parsing using customParseFormat: dayjs(str, format, strict=true)
        // This correctly rejects non-existent dates like 2024-02-30 and wrong format.
        // NOTE: dayjs.tz() does NOT support a strict parameter — must use dayjs() for that.
        const strictParsed = dayjs(date, DATE_FORMAT, true);
        if (!strictParsed.isValid()) {
            throw new RangeError(
                `TimeSlot: "${date}" is not a valid or existing date (strict YYYY-MM-DD expected).`
            );
        }

        // Strict HH:MM — two digits mandatory on both sides
        // Rejects '9:00', '24:00', '12:60', etc.
        const strictTimeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        if (typeof startTime !== 'string' || !strictTimeRegex.test(startTime)) {
            throw new TypeError(
                `TimeSlot: "startTime" must be in strict HH:MM format (e.g. "09:30"). Received: ${JSON.stringify(startTime)}`
            );
        }

        if (
            typeof durationMinutes !== 'number' ||
            !Number.isFinite(durationMinutes) ||
            durationMinutes <= 0 ||
            durationMinutes > MAX_DURATION_MINUTES
        ) {
            throw new RangeError(
                `TimeSlot: "durationMinutes" must be a finite number between 1 and ${MAX_DURATION_MINUTES}. Received: ${durationMinutes}`
            );
        }

        if (typeof tzName !== 'string' || tzName.trim() === '') {
            throw new TypeError(
                `TimeSlot: "timezone" must be a non-empty IANA string (e.g. "America/Santiago"). Received: ${JSON.stringify(tzName)}`
            );
        }
    }

    // ─── Public getters ───────────────────────────────────────────────────────

    get date() { return this.#date; }
    get startTime() { return this.#startTime; }
    get durationMinutes() { return this.#durationMinutes; }
    get timezone() { return this.#timezone; }

    /**
     * Calculates the end time of this slot.
     * Throws RangeError if the slot crosses midnight — cross-midnight slots
     * are not supported and would corrupt overlap detection.
     *
     * @returns {string} End time in 'HH:MM' format
     */
    get endTime() {
        const startMinutes = this.#toMinutes(this.#startTime);
        const endMinutes = startMinutes + this.#durationMinutes;

        // 1440 min = exactly 00:00 (midnight) — valid as an end boundary.
        // Anything beyond 1440 crosses into the next day and is not supported.
        if (endMinutes > 1440) {
            throw new RangeError(
                `TimeSlot: slot starting at ${this.#startTime} with ${this.#durationMinutes} min duration ` +
                `crosses midnight (end = ${endMinutes} min). Cross-midnight slots are not supported.`
            );
        }

        // endMinutes === 1440 yields hh=24, mm=0 without modulo — use modulo to get 00:00
        const hh = Math.floor(endMinutes % 1440 / 60);
        const mm = endMinutes % 60;
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }

    // ─── Domain logic ─────────────────────────────────────────────────────────

    /**
     * Returns true if this slot temporally overlaps with `other`.
     * Both slots MUST share the same date for overlap to be possible.
     * Uses the standard interval intersection algorithm: [s1,e1) ∩ [s2,e2) ≠ ∅
     *
     * @param {TimeSlot} other
     * @returns {boolean}
     */
    overlaps(other) {
        if (!(other instanceof TimeSlot)) {
            throw new TypeError('TimeSlot.overlaps(): argument must be a TimeSlot instance');
        }

        // Slots on different dates cannot overlap
        if (this.#date !== other.date) return false;

        const thisStart = this.#toMinutes(this.#startTime);
        const thisEnd = this.#toMinutes(this.endTime);
        const otherStart = this.#toMinutes(other.startTime);
        const otherEnd = this.#toMinutes(other.endTime);

        // Half-open intervals: [start, end)
        // Adjacent slots (thisEnd === otherStart) do NOT overlap — correct for booking systems
        return thisStart < otherEnd && otherStart < thisEnd;
    }

    /**
     * Whether the slot start time is in the past, evaluated in the barbería's own timezone.
     * This is the correct multitenant implementation — server TZ is irrelevant.
     *
     * @returns {boolean}
     */
    isPast() {
        const now = dayjs().tz(this.#timezone);
        const slotStart = dayjs.tz(
            `${this.#date} ${this.#startTime}`,
            `${DATE_FORMAT} ${TIME_FORMAT}`,
            this.#timezone
        );
        return slotStart.isBefore(now);
    }

    /** @returns {boolean} */
    isFuture() {
        return !this.isPast();
    }

    /**
     * Value equality — two TimeSlots are equal if they represent the exact
     * same interval in the same timezone.
     *
     * @param {TimeSlot} other
     * @returns {boolean}
     */
    equals(other) {
        if (!(other instanceof TimeSlot)) return false;
        return (
            this.#date === other.date &&
            this.#startTime === other.startTime &&
            this.#durationMinutes === other.durationMinutes &&
            this.#timezone === other.timezone
        );
    }

    toString() {
        return `[${this.#timezone}] ${this.#date} ${this.#startTime}–${this.endTime} (${this.#durationMinutes}min)`;
    }

    toJSON() {
        return {
            date: this.#date,
            startTime: this.#startTime,
            endTime: this.endTime,
            durationMinutes: this.#durationMinutes,
            timezone: this.#timezone,
        };
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Converts 'HH:MM' to minutes since midnight.
     * Only used internally — not part of the public API.
     *
     * @param {string} timeStr
     * @returns {number}
     */
    #toMinutes(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }
}

module.exports = TimeSlot;
