const CalendarSync = require('../models/CalendarSync');

class MongoCalendarSyncRepository {
    async findByBarberoId(barberoId) {
        return await CalendarSync.findOne({ barberoId, isActive: true });
    }

    async save(calendarSync) {
        if (calendarSync._id) {
            return await calendarSync.save();
        }
        return await CalendarSync.create(calendarSync);
    }

    async deleteByBarberoId(barberoId, provider) {
        return await CalendarSync.deleteOne({ barberoId, provider });
    }
}

module.exports = MongoCalendarSyncRepository;
