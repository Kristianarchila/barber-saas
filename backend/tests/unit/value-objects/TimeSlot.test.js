'use strict';

const TimeSlot = require('../../../src/domain/value-objects/TimeSlot');

const TZ = 'America/Santiago';
const FUTURE_DATE = '2099-12-31'; // Guaranteed to always be in the future

describe('TimeSlot — Value Object', () => {

    // ─── Construction ────────────────────────────────────────────────────────

    describe('Construction', () => {
        it('creates a valid slot with all required fields', () => {
            const slot = new TimeSlot('2099-06-15', '09:30', 30, TZ);
            expect(slot.date).toBe('2099-06-15');
            expect(slot.startTime).toBe('09:30');
            expect(slot.durationMinutes).toBe(30);
            expect(slot.timezone).toBe(TZ);
        });

        it('uses America/Santiago as default timezone if omitted', () => {
            const slot = new TimeSlot(FUTURE_DATE, '10:00', 30);
            expect(slot.timezone).toBe('America/Santiago');
        });

        it('truncates float durations to integer via Math.trunc', () => {
            const slot = new TimeSlot(FUTURE_DATE, '10:00', 30.9);
            expect(slot.durationMinutes).toBe(30);
        });
    });

    // ─── Immutability ─────────────────────────────────────────────────────────

    describe('Immutability', () => {
        it('is frozen — cannot mutate fields after construction', () => {
            const slot = new TimeSlot(FUTURE_DATE, '10:00', 30, TZ);
            expect(() => { slot.startTime = '11:00'; }).toThrow(TypeError);
        });

        it('does not expose private state through prototype tricks', () => {
            const slot = new TimeSlot(FUTURE_DATE, '10:00', 30, TZ);
            // Private fields (#) are not accessible externally
            expect(slot['#startTime']).toBeUndefined();
            expect(slot['_startTime']).toBeUndefined();
        });
    });

    // ─── Validation — Date ───────────────────────────────────────────────────

    describe('Validation — date', () => {
        it('rejects a numeric timestamp as date', () => {
            expect(() => new TimeSlot(20240101, '10:00', 30, TZ)).toThrow(TypeError);
        });

        it('rejects null as date', () => {
            expect(() => new TimeSlot(null, '10:00', 30, TZ)).toThrow(TypeError);
        });

        it('rejects an empty string as date', () => {
            expect(() => new TimeSlot('', '10:00', 30, TZ)).toThrow(TypeError);
        });

        it('rejects non-existent date 2024-02-30 (strict mode)', () => {
            expect(() => new TimeSlot('2024-02-30', '10:00', 30, TZ)).toThrow(RangeError);
        });

        it('accepts a valid date like 2024-02-29 in a leap year', () => {
            expect(() => new TimeSlot('2024-02-29', '10:00', 30, TZ)).not.toThrow();
        });

        it('rejects 2023-02-29 (not a leap year)', () => {
            expect(() => new TimeSlot('2023-02-29', '10:00', 30, TZ)).toThrow(RangeError);
        });
    });

    // ─── Validation — startTime ──────────────────────────────────────────────

    describe('Validation — startTime', () => {
        it('rejects single-digit hour "9:00"', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '9:00', 30, TZ)).toThrow(TypeError);
        });

        it('rejects "24:00" — out of range hour', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '24:00', 30, TZ)).toThrow(TypeError);
        });

        it('rejects "12:60" — out of range minutes', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '12:60', 30, TZ)).toThrow(TypeError);
        });

        it('rejects null startTime', () => {
            expect(() => new TimeSlot(FUTURE_DATE, null, 30, TZ)).toThrow(TypeError);
        });

        it('accepts "00:00"', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '00:00', 30, TZ)).not.toThrow();
        });

        it('accepts "23:59"', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '23:59', 1, TZ)).not.toThrow();
        });

        it('accepts "09:30"', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '09:30', 30, TZ)).not.toThrow();
        });
    });

    // ─── Validation — durationMinutes ────────────────────────────────────────

    describe('Validation — durationMinutes', () => {
        it('rejects 0', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '10:00', 0, TZ)).toThrow(RangeError);
        });

        it('rejects negative duration', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '10:00', -30, TZ)).toThrow(RangeError);
        });

        it('rejects Infinity', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '10:00', Infinity, TZ)).toThrow(RangeError);
        });

        it('rejects NaN', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '10:00', NaN, TZ)).toThrow(RangeError);
        });

        it('rejects duration > 480 min (8 hours)', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '10:00', 481, TZ)).toThrow(RangeError);
        });

        it('accepts exactly 480', () => {
            expect(() => new TimeSlot(FUTURE_DATE, '00:00', 480, TZ)).not.toThrow();
        });
    });

    // ─── endTime ─────────────────────────────────────────────────────────────

    describe('endTime getter', () => {
        it('calculates end time correctly within the same day', () => {
            const slot = new TimeSlot(FUTURE_DATE, '10:00', 30, TZ);
            expect(slot.endTime).toBe('10:30');
        });

        it('handles hour-boundary correctly: 10:45 + 30min = 11:15', () => {
            const slot = new TimeSlot(FUTURE_DATE, '10:45', 30, TZ);
            expect(slot.endTime).toBe('11:15');
        });

        it('allows exactly midnight: 23:30 + 30min = 00:00', () => {
            const slot = new TimeSlot(FUTURE_DATE, '23:30', 30, TZ);
            expect(slot.endTime).toBe('00:00');
        });

        it('throws RangeError when slot crosses midnight: 23:00 + 90min', () => {
            const slot = new TimeSlot(FUTURE_DATE, '23:00', 90, TZ);
            expect(() => slot.endTime).toThrow(RangeError);
        });

        it('throws RangeError for 23:59 + 2min', () => {
            const slot = new TimeSlot(FUTURE_DATE, '23:59', 2, TZ);
            expect(() => slot.endTime).toThrow(RangeError);
        });
    });

    // ─── overlaps ────────────────────────────────────────────────────────────

    describe('overlaps()', () => {
        const date = FUTURE_DATE;

        it('returns false for slots on different dates', () => {
            const a = new TimeSlot('2099-06-15', '10:00', 30, TZ);
            const b = new TimeSlot('2099-06-16', '10:00', 30, TZ);
            expect(a.overlaps(b)).toBe(false);
        });

        it('returns true for identical slots', () => {
            const a = new TimeSlot(date, '10:00', 30, TZ);
            const b = new TimeSlot(date, '10:00', 30, TZ);
            expect(a.overlaps(b)).toBe(true);
        });

        it('returns true for partial overlap: [10:00-10:30] ∩ [10:15-10:45]', () => {
            const a = new TimeSlot(date, '10:00', 30, TZ);
            const b = new TimeSlot(date, '10:15', 30, TZ);
            expect(a.overlaps(b)).toBe(true);
        });

        it('returns false for adjacent slots: [10:00-10:30] and [10:30-11:00]', () => {
            const a = new TimeSlot(date, '10:00', 30, TZ);
            const b = new TimeSlot(date, '10:30', 30, TZ);
            expect(a.overlaps(b)).toBe(false);
        });

        it('returns false when b is entirely before a', () => {
            const a = new TimeSlot(date, '11:00', 30, TZ);
            const b = new TimeSlot(date, '09:00', 60, TZ);
            expect(a.overlaps(b)).toBe(false);
        });

        it('returns true when a contains b entirely', () => {
            const a = new TimeSlot(date, '10:00', 60, TZ); // 10:00-11:00
            const b = new TimeSlot(date, '10:15', 15, TZ); // 10:15-10:30
            expect(a.overlaps(b)).toBe(true);
        });

        it('throws TypeError if argument is not a TimeSlot', () => {
            const a = new TimeSlot(date, '10:00', 30, TZ);
            expect(() => a.overlaps({ startTime: '10:00' })).toThrow(TypeError);
        });
    });

    // ─── equals ──────────────────────────────────────────────────────────────

    describe('equals()', () => {
        it('returns true for identical slots', () => {
            const a = new TimeSlot(FUTURE_DATE, '10:00', 30, TZ);
            const b = new TimeSlot(FUTURE_DATE, '10:00', 30, TZ);
            expect(a.equals(b)).toBe(true);
        });

        it('returns false if timezone differs', () => {
            const a = new TimeSlot(FUTURE_DATE, '10:00', 30, 'America/Santiago');
            const b = new TimeSlot(FUTURE_DATE, '10:00', 30, 'America/Bogota');
            expect(a.equals(b)).toBe(false);
        });

        it('returns false for non-TimeSlot argument', () => {
            const a = new TimeSlot(FUTURE_DATE, '10:00', 30, TZ);
            expect(a.equals(null)).toBe(false);
            expect(a.equals({})).toBe(false);
        });
    });

    // ─── isPast / isFuture ───────────────────────────────────────────────────

    describe('isPast() / isFuture()', () => {
        it('returns false for isPast() on a far-future date', () => {
            const slot = new TimeSlot(FUTURE_DATE, '10:00', 30, TZ);
            expect(slot.isPast()).toBe(false);
            expect(slot.isFuture()).toBe(true);
        });

        it('returns true for isPast() on a past date', () => {
            const slot = new TimeSlot('2000-01-01', '10:00', 30, TZ);
            expect(slot.isPast()).toBe(true);
            expect(slot.isFuture()).toBe(false);
        });
    });

    // ─── toJSON ──────────────────────────────────────────────────────────────

    describe('toJSON()', () => {
        it('returns all expected fields including timezone and endTime', () => {
            const slot = new TimeSlot(FUTURE_DATE, '10:00', 30, TZ);
            const json = slot.toJSON();
            expect(json).toEqual({
                date: FUTURE_DATE,
                startTime: '10:00',
                endTime: '10:30',
                durationMinutes: 30,
                timezone: TZ,
            });
        });
    });
});
