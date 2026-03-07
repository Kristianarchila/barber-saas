const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../config/middleware/auth.middleware');
const { extractBarberiaId, validateTenantAccess } = require('../middleware/tenantValidation.middleware');
const container = require('../shared/Container');
const validateJoi = require('../middleware/joiValidation.middleware');
const { joinWaitingListSchema } = require('../validators/common.joi');

/**
 * @route   POST /api/waiting-list/join
 * @desc    Join the waiting list
 * @access  Public
 */
router.post('/join', validateJoi(joinWaitingListSchema), async (req, res, next) => {
    try {
        const joinWaitingListUseCase = container.joinWaitingListUseCase;
        const result = await joinWaitingListUseCase.execute(req.body);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/waiting-list/convert/:token
 * @desc    Convert waiting list entry to reservation
 * @access  Public
 */
router.post('/convert/:token', async (req, res, next) => {
    try {
        const { token } = req.params;
        const convertUseCase = container.convertWaitingListToReservaUseCase;
        const result = await convertUseCase.execute(token);

        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/waiting-list/:slug
 * @desc    Get waiting list for a barberia (by slug)
 * @access  Private (Admin)
 */
router.get(
    '/:slug',
    protect,
    authorize('BARBERIA_ADMIN', 'SUPER_ADMIN'),
    extractBarberiaId,
    validateTenantAccess,
    async (req, res, next) => {
        try {
            // req.barberiaId is set by extractBarberiaId middleware
            const { estado, barberoId, servicioId } = req.query;

            const getWaitingListUseCase = container.getWaitingListByBarberiaUseCase;
            const result = await getWaitingListUseCase.execute(req.barberiaId, {
                estado,
                barberoId,
                servicioId
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   DELETE /api/waiting-list/:slug/:entryId
 * @desc    Cancel a waiting list entry
 * @access  Private (Admin or Owner)
 */
router.delete(
    '/:slug/:entryId',
    protect,
    authorize('BARBERIA_ADMIN', 'SUPER_ADMIN', 'CLIENTE'),
    extractBarberiaId,
    validateTenantAccess,
    async (req, res, next) => {
        try {
            const { entryId } = req.params;
            const cancelledBy = (req.user && req.user.rol === 'CLIENTE') ? 'CLIENT' : 'ADMIN';

            const cancelUseCase = container.cancelWaitingListEntryUseCase;
            const result = await cancelUseCase.execute(entryId, cancelledBy);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /api/waiting-list/:slug/:entryId/notify
 * @desc    Manually notify a waiting list entry (admin only)
 * @access  Private (Admin)
 */
router.post(
    '/:slug/:entryId/notify',
    protect,
    authorize('BARBERIA_ADMIN', 'SUPER_ADMIN'),
    extractBarberiaId,
    validateTenantAccess,
    async (req, res, next) => {
        try {
            const { entryId } = req.params;

            // Get the entry
            const waitingListRepository = container.waitingListRepository;
            const entry = await waitingListRepository.findById(entryId);

            if (!entry) {
                return res.status(404).json({ error: 'Entrada no encontrada' });
            }

            // Create a fake cancelled reservation to trigger notification
            const fakeReserva = {
                barberiaId: entry.barberiaId,
                barberoId: entry.barberoId,
                servicioId: entry.servicioId,
                fecha: entry.fechaPreferida,
                hora: entry.rangoHorario.inicio
            };

            const notifyUseCase = container.notifyWaitingListUseCase;
            const result = await notifyUseCase.execute(fakeReserva);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
