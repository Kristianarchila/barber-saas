const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

/**
 * TimeSlot Value Object
 * Represents a time slot with date, start time, and duration
 */
class TimeSlot {
    constructor(date, startTime, durationMinutes) {
        this.validate(date, startTime, durationMinutes);

        this._date = dayjs(date);
        this._startTime = startTime; // "HH:MM"
        this._durationMinutes = durationMinutes;
    }

    validate(date, startTime, durationMinutes) {
        if (!dayjs(date).isValid()) {
            throw new Error('Invalid date');
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime)) {
            throw new Error('Invalid time format. Expected HH:MM');
        }

        if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
            throw new Error('Duration must be a positive number');
        }
    }

    get date() {
        return this._date.format('YYYY-MM-DD');
    }

    get startTime() {
        return this._startTime;
    }

    get durationMinutes() {
        return this._durationMinutes;
    }

    get endTime() {
        const [hours, minutes] = this._startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + this._durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    }

    /**
     * Check if this time slot overlaps with another
     */
    overlaps(other) {
        if (!(other instanceof TimeSlot)) {
            throw new Error('Can only check overlap with another TimeSlot');
        }

        // Different dates don't overlap
        if (this.date !== other.date) {
            return false;
        }

        const thisStart = this.toMinutes(this._startTime);
        const thisEnd = this.toMinutes(this.endTime);
        const otherStart = this.toMinutes(other.startTime);
        const otherEnd = this.toMinutes(other.endTime);

        // Check if ranges overlap
        return thisStart < otherEnd && otherStart < thisEnd;
    }

    /**
     * Check if this time slot is in the past
     */
    isPast() {
        const slotDateTime = dayjs(`${this.date} ${this._startTime}`, 'YYYY-MM-DD HH:mm');
        return slotDateTime.isBefore(dayjs());
    }

    /**
     * Check if this time slot is in the future
     */
    isFuture() {
        const slotDateTime = dayjs(`${this.date} ${this._startTime}`, 'YYYY-MM-DD HH:mm');
        return slotDateTime.isAfter(dayjs());
    }

    /**
     * Convert time string to minutes since midnight
     */
    toMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    equals(other) {
        if (!(other instanceof TimeSlot)) {
            return false;
        }
        return (
            this.date === other.date &&
            this._startTime === other.startTime &&
            this._durationMinutes === other.durationMinutes
        );
    }

    toString() {
        return `${this.date} ${this._startTime} - ${this.endTime} (${this._durationMinutes}min)`;
    }

    toJSON() {
        return {
            date: this.date,
            startTime: this._startTime,
            endTime: this.endTime,
            durationMinutes: this._durationMinutes
        };
    }
}

module.exports = TimeSlot;
