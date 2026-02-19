const IBarberiaRepository = require('../../../../domain/repositories/IBarberiaRepository');
const BarberiaModel = require('../models/Barberia');
const Barberia = require('../../../../domain/entities/Barberia');

/**
 * MongoDB Implementation of IBarberiaRepository
 */
class MongoBarberiaRepository extends IBarberiaRepository {
    async save(barberia, session = null) {
        const barberiaData = this.toMongoDocument(barberia);

        // When using session, create() requires array syntax
        const savedBarberia = session
            ? (await BarberiaModel.create([barberiaData], { session }))[0]
            : await BarberiaModel.create(barberiaData);

        return this.toDomain(savedBarberia);
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        // Note: Barberia access is typically SuperAdmin only
        // barberiaId parameter for consistency, but usually bypassed

        const barberia = await BarberiaModel.findOne(query);
        if (!barberia) {
            throw new Error('Barbería no encontrada');
        }
        return this.toDomain(barberia);
    }

    async findBySlug(slug) {
        const barberia = await BarberiaModel.findOne({ slug });
        return barberia ? this.toDomain(barberia) : null;
    }

    async findByEmail(email) {
        const barberia = await BarberiaModel.findOne({ email: email.toLowerCase() });
        return barberia ? this.toDomain(barberia) : null;
    }

    async findAll(filters = {}, pagination = {}) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        let query = {};

        // Apply filters
        if (filters.estado) {
            query.estado = filters.estado;
        }

        if (filters.busqueda) {
            query.$or = [
                { nombre: { $regex: filters.busqueda, $options: 'i' } },
                { email: { $regex: filters.busqueda, $options: 'i' } },
                { slug: { $regex: filters.busqueda, $options: 'i' } }
            ];
        }

        const barberias = await BarberiaModel.find(query)
            .select('-historial')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return barberias.map(b => this.toDomain(b));
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };
        // Note: Barberia updates are typically SuperAdmin only

        const updated = await BarberiaModel.findOneAndUpdate(query, data, { new: true, runValidators: true });
        if (!updated) {
            throw new Error('Barbería no encontrada');
        }
        return this.toDomain(updated);
    }

    async exists(query) {
        return await BarberiaModel.exists(query);
    }

    /**
     * Convert MongoDB document to Domain entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        return new Barberia({
            id: doc._id.toString(),
            nombre: doc.nombre,
            slug: doc.slug,
            email: doc.email,
            direccion: doc.direccion,
            telefono: doc.telefono,
            rut: doc.rut,
            plan: doc.plan,
            estado: doc.estado,
            activa: doc.activo,
            esMatriz: doc.esMatriz,
            configuracion: doc.configuracion || {},
            configuracionMatriz: doc.configuracionMatriz || {},
            sucursales: doc.sucursales || [],
            fechaFinTrial: doc.fechaFinTrial,
            proximoPago: doc.proximoPago,
            stripeCustomerId: doc.stripeCustomerId,
            stripeSubscriptionId: doc.stripeSubscriptionId,
            historial: doc.historial || [],
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    /**
     * Convert Domain entity to MongoDB document
     */
    toMongoDocument(barberia) {
        const obj = barberia.toObject ? barberia.toObject() : barberia;
        return {
            nombre: obj.nombre,
            slug: obj.slug,
            email: obj.email,
            direccion: obj.direccion,
            telefono: obj.telefono,
            rut: obj.rut,
            plan: obj.plan,
            estado: obj.estado,
            activo: obj.activa,
            esMatriz: obj.esMatriz,
            configuracion: obj.configuracion,
            configuracionMatriz: obj.configuracionMatriz,
            sucursales: obj.sucursales,
            fechaFinTrial: obj.fechaFinTrial,
            proximoPago: obj.proximoPago,
            stripeCustomerId: obj.stripeCustomerId,
            stripeSubscriptionId: obj.stripeSubscriptionId,
            historial: obj.historial
        };
    }

    /**
     * Count barberias with filters
     */
    async count(filters = {}) {
        let query = {};

        if (filters.estado) {
            query.estado = filters.estado;
        }

        if (filters.busqueda) {
            query.$or = [
                { nombre: { $regex: filters.busqueda, $options: 'i' } },
                { email: { $regex: filters.busqueda, $options: 'i' } },
                { slug: { $regex: filters.busqueda, $options: 'i' } }
            ];
        }

        return await BarberiaModel.countDocuments(query);
    }

    /**
     * Get global statistics
     */
    async getGlobalStats() {
        const [
            totalBarberias,
            activas,
            trial,
            suspendidas,
            nuevasEsteMes
        ] = await Promise.all([
            BarberiaModel.countDocuments(),
            BarberiaModel.countDocuments({ estado: 'activa' }),
            BarberiaModel.countDocuments({ estado: 'trial' }),
            BarberiaModel.countDocuments({ estado: 'suspendida' }),
            this._countNewThisMonth()
        ]);

        return {
            totalBarberias,
            activas,
            trial,
            suspendidas,
            nuevasEsteMes
        };
    }

    /**
     * Get historical statistics from N months ago
     */
    async getHistoricalStats(monthsAgo = 1) {
        const dayjs = require('dayjs');
        const targetDate = dayjs().subtract(monthsAgo, 'month');
        const startOfMonth = targetDate.startOf('month').toDate();
        const endOfMonth = targetDate.endOf('month').toDate();

        const [
            totalBarberias,
            activas,
            trial,
            suspendidas
        ] = await Promise.all([
            BarberiaModel.countDocuments({
                createdAt: { $lte: endOfMonth }
            }),
            BarberiaModel.countDocuments({
                estado: 'activa',
                createdAt: { $lte: endOfMonth }
            }),
            BarberiaModel.countDocuments({
                estado: 'trial',
                createdAt: { $lte: endOfMonth }
            }),
            BarberiaModel.countDocuments({
                estado: 'suspendida',
                createdAt: { $lte: endOfMonth }
            })
        ]);

        return {
            totalBarberias,
            activas,
            trial,
            suspendidas
        };
    }

    /**
     * Calculate MRR (Monthly Recurring Revenue) by plan
     */
    async getMRRByPlan() {
        const PLAN_PRICES = {
            trial: 0,
            basico: 29,
            premium: 79,
            pro: 149
        };

        const activeBarberias = await BarberiaModel.find({
            estado: 'activa'
        }).select('plan');

        const mrrByPlan = {
            trial: { count: 0, mrr: 0 },
            basico: { count: 0, mrr: 0 },
            premium: { count: 0, mrr: 0 },
            pro: { count: 0, mrr: 0 }
        };

        let totalMRR = 0;

        activeBarberias.forEach(barberia => {
            const plan = barberia.plan || 'trial';
            const price = PLAN_PRICES[plan] || 0;

            mrrByPlan[plan].count++;
            mrrByPlan[plan].mrr += price;
            totalMRR += price;
        });

        return {
            total: totalMRR,
            byPlan: mrrByPlan,
            arr: totalMRR * 12 // Annual Recurring Revenue
        };
    }

    /**
     * Get barberías that were suspended/churned this month
     */
    async getChurnedThisMonth() {
        const dayjs = require('dayjs');
        const startOfMonth = dayjs().startOf('month').toDate();

        // Count barberías that have a suspension event in their history this month
        const churned = await BarberiaModel.countDocuments({
            estado: 'suspendida',
            'historial.fecha': { $gte: startOfMonth },
            'historial.accion': { $in: ['estado_cambiado', 'barberia_suspendida'] }
        });

        return churned;
    }

    /**
     * Get barberias expiring soon
     */
    async getExpiringSoon(days = 5) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const docs = await BarberiaModel.find({
            estado: { $in: ['activa', 'trial'] },
            proximoPago: { $lte: futureDate, $gte: today }
        })
            .select('nombre proximoPago email estado')
            .sort({ proximoPago: 1 });

        return docs.map(doc => this.toDomain(doc));
    }

    /**
     * Helper: Count new barberias this month
     */
    async _countNewThisMonth() {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        return await BarberiaModel.countDocuments({
            createdAt: { $gte: startOfMonth }
        });
    }

    /**
     * Update subscription data for a barberia
     * @param {string} barberiaId 
     * @param {Object} subscriptionData 
     * @returns {Promise<void>}
     */
    async updateSubscription(barberiaId, subscriptionData) {
        await BarberiaModel.findByIdAndUpdate(
            barberiaId,
            { $set: { subscription: subscriptionData } },
            { runValidators: true }
        );
    }

    /**
     * Increment monthly reservations counter
     * @param {string} barberiaId 
     * @returns {Promise<void>}
     */
    async incrementReservasCount(barberiaId) {
        const barberia = await BarberiaModel.findById(barberiaId);

        if (!barberia) {
            throw new Error('Barbería no encontrada');
        }

        // Check if we need to reset the monthly counter
        const now = new Date();
        const lastReset = barberia.usage?.lastResetDate || new Date(0);
        const shouldReset = now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear();

        if (shouldReset) {
            // Reset counter for new month
            await BarberiaModel.findByIdAndUpdate(
                barberiaId,
                {
                    $set: {
                        'usage.reservasThisMonth': 1,
                        'usage.lastResetDate': now
                    }
                }
            );
        } else {
            // Increment counter
            await BarberiaModel.findByIdAndUpdate(
                barberiaId,
                { $inc: { 'usage.reservasThisMonth': 1 } }
            );
        }
    }

    /**
     * Delete barberia (soft delete)
     */
    async delete(id, session = null) {
        await BarberiaModel.findByIdAndUpdate(
            id,
            { $set: { estado: 'suspendida', activo: false } },
            { session }
        );
    }
}

module.exports = MongoBarberiaRepository;
