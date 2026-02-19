const express = require('express');
const router = express.Router({ mergeParams: true });
const transactionController = require('../controllers/transaction.controller');
const { protect, authorize } = require('../config/middleware/auth.middleware');
const { extractBarberiaId } = require('../config/middleware/extractBarberiaId');

// Rutas para BARBERIA_ADMIN
router.use(protect);

// Rutas de admin
const adminRoutes = express.Router({ mergeParams: true });
adminRoutes.use(authorize('BARBERIA_ADMIN'));
adminRoutes.use(extractBarberiaId);

adminRoutes.get('/', transactionController.getTransactions);
adminRoutes.get('/reporte', transactionController.getReporte);
adminRoutes.get('/:id', transactionController.getTransactionById);
adminRoutes.patch('/:id/ajustar', transactionController.ajustarTransaccion);
adminRoutes.patch('/:id/pagar', transactionController.marcarComoPagado);
adminRoutes.get('/barbero/:barberoId/balance', transactionController.getBalanceBarbero);

router.use('/admin', adminRoutes);

// Rutas para BARBERO
const barberoRoutes = express.Router({ mergeParams: true });
barberoRoutes.use(authorize('BARBERO'));
barberoRoutes.use(extractBarberiaId); // Add this middleware for barberiaId

barberoRoutes.get('/', transactionController.getMisTransacciones);
barberoRoutes.get('/balance', transactionController.getMiBalance);

router.use('/barbero', barberoRoutes);

module.exports = router;
