/**
 * MongoDB RevenueConfig Repository Implementation
 */
const RevenueConfig = require('../models/RevenueConfig');
const IRevenueConfigRepository = require('../../../../domain/repositories/IRevenueConfigRepository');

class MongoRevenueConfigRepository extends IRevenueConfigRepository {
    async findByBarberiaId(barberiaId) {
        const config = await RevenueConfig.findOne({ barberiaId });
        return config;
    }

    async save(revenueConfigData) {
        const config = new RevenueConfig(revenueConfigData);
        await config.save();
        return config;
    }

    async update(barberiaId, updates) {
        const config = await RevenueConfig.findOneAndUpdate(
            { barberiaId },
            updates,
            { new: true, upsert: true }
        );
        return config;
    }
}

module.exports = MongoRevenueConfigRepository;
