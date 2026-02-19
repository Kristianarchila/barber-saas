/**
 * MongoDB Subscription Repository
 * 
 * Implementation of ISubscriptionRepository for MongoDB.
 * Handles subscription data persistence and retrieval.
 */

const SubscriptionModel = require('../models/Subscription');
const Subscription = require('../../../../domain/entities/Subscription');
const ISubscriptionRepository = require('../../../../domain/repositories/ISubscriptionRepository');

class MongoSubscriptionRepository extends ISubscriptionRepository {
    /**
     * Save a subscription (create or update)
     * @param {Subscription} subscription 
     * @returns {Promise<Subscription>}
     */
    async save(subscription) {
        const data = subscription.toObject();

        if (data.id) {
            // Update existing
            const updated = await SubscriptionModel.findByIdAndUpdate(
                data.id,
                data,
                { new: true, runValidators: true }
            );
            return Subscription.fromObject(updated.toObject());
        } else {
            // Create new
            const created = await SubscriptionModel.create(data);
            return Subscription.fromObject(created.toObject());
        }
    }

    /**
     * Find subscription by ID
     * @param {string} id 
     * @returns {Promise<Subscription|null>}
     */
    async findById(id) {
        const doc = await SubscriptionModel.findById(id);
        return doc ? Subscription.fromObject(doc.toObject()) : null;
    }

    /**
     * Find subscription by barberia ID
     * @param {string} barberiaId 
     * @returns {Promise<Subscription|null>}
     */
    async findByBarberiaId(barberiaId) {
        const mongoose = require('mongoose');

        // Convert string to ObjectId if needed for Mongo query
        const objectId = typeof barberiaId === 'string'
            ? new mongoose.Types.ObjectId(barberiaId)
            : barberiaId;

        const doc = await SubscriptionModel.findOne({ barberiaId: objectId });

        return doc ? Subscription.fromObject(doc.toObject()) : null;
    }

    /**
     * Find subscription by Stripe customer ID
     * @param {string} stripeCustomerId 
     * @returns {Promise<Subscription|null>}
     */
    async findByStripeCustomerId(stripeCustomerId) {
        const doc = await SubscriptionModel.findOne({ stripeCustomerId });
        return doc ? Subscription.fromObject(doc.toObject()) : null;
    }

    /**
     * Find subscription by Stripe subscription ID
     * @param {string} stripeSubscriptionId 
     * @returns {Promise<Subscription|null>}
     */
    async findByStripeSubscriptionId(stripeSubscriptionId) {
        const doc = await SubscriptionModel.findOne({ stripeSubscriptionId });
        return doc ? Subscription.fromObject(doc.toObject()) : null;
    }

    /**
     * Find all subscriptions by status
     * @param {string} status 
     * @returns {Promise<Subscription[]>}
     */
    async findByStatus(status) {
        const docs = await SubscriptionModel.find({ status });
        return docs.map(doc => Subscription.fromObject(doc.toObject()));
    }

    /**
     * Find all subscriptions by plan
     * @param {string} plan 
     * @returns {Promise<Subscription[]>}
     */
    async findByPlan(plan) {
        const docs = await SubscriptionModel.find({ plan });
        return docs.map(doc => Subscription.fromObject(doc.toObject()));
    }

    /**
     * Find subscriptions with trial ending soon
     * @param {number} daysThreshold - Number of days before trial ends
     * @returns {Promise<Subscription[]>}
     */
    async findTrialsEndingSoon(daysThreshold) {
        const now = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

        const docs = await SubscriptionModel.find({
            status: 'TRIALING',
            trialEndsAt: {
                $gte: now,
                $lte: thresholdDate
            }
        });

        return docs.map(doc => Subscription.fromObject(doc.toObject()));
    }

    /**
     * Find subscriptions scheduled for cancellation
     * @returns {Promise<Subscription[]>}
     */
    async findScheduledForCancellation() {
        const docs = await SubscriptionModel.find({
            cancelAtPeriodEnd: true,
            status: { $in: ['ACTIVE', 'TRIALING'] }
        });

        return docs.map(doc => Subscription.fromObject(doc.toObject()));
    }

    /**
     * Delete subscription by ID
     * @param {string} id 
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const result = await SubscriptionModel.findByIdAndDelete(id);
        return !!result;
    }

    /**
     * Count subscriptions by plan
     * @returns {Promise<Object>} Object with plan counts
     */
    async countByPlan() {
        const result = await SubscriptionModel.aggregate([
            {
                $group: {
                    _id: '$plan',
                    count: { $sum: 1 }
                }
            }
        ]);

        return result.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
    }

    /**
     * Count subscriptions by status
     * @returns {Promise<Object>} Object with status counts
     */
    async countByStatus() {
        const result = await SubscriptionModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        return result.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
    }
}

module.exports = MongoSubscriptionRepository;
