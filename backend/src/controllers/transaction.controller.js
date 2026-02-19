/**
 * Transaction Controller (Hexagonal Architecture Version)
 * Acts as an adapter in the interfaces layer
 */
const container = require('../shared/Container');

// ==========================================
// 1) GET TRANSACTIONS
// ==========================================
exports.getTransactions = async (req, res, next) => {
    try {
        const { barberiaId } = req;
        const useCase = container.listTransactionsUseCase;
        const result = await useCase.execute(barberiaId.toString(), req.query);

        res.json({
            transactions: result.transactions.map(t => t.toObject()),
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2) GET TRANSACTION BY ID
// ==========================================
exports.getTransactionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { barberiaId } = req;

        const useCase = container.getTransactionByIdUseCase;
        const transaction = await useCase.execute(id, barberiaId.toString());

        res.json(transaction.toObject());
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3) AJUSTAR TRANSACCION
// ==========================================
exports.ajustarTransaccion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { montoBarbero, montoBarberia, razon, extras } = req.body;
        const adminId = req.user._id.toString();

        if (!razon) {
            return res.status(400).json({ message: 'Debe proporcionar una razón para el ajuste' });
        }

        const useCase = container.ajustarTransaccionUseCase;
        const transaction = await useCase.execute(id, { montoBarbero, montoBarberia, razon, extras }, adminId);

        res.json(transaction.toObject());
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4) MARCAR COMO PAGADO
// ==========================================
exports.marcarComoPagado = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { barberiaId } = req;
        const adminId = req.user._id.toString();
        const { metodoPago, notas } = req.body;

        const useCase = container.marcarComoPagadoUseCase;
        const transaction = await useCase.execute(id, barberiaId.toString(), adminId, { metodoPago, notas });

        res.json(transaction.toObject());
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5) GET BALANCE BARBERO
// ==========================================
exports.getBalanceBarbero = async (req, res, next) => {
    try {
        const { barberoId } = req.params;
        const { barberiaId } = req;

        const useCase = container.getBalanceBarberoUseCase;
        const balance = await useCase.execute(barberoId, barberiaId.toString());

        res.json(balance);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6) GET REPORTE
// ==========================================
exports.getReporte = async (req, res, next) => {
    try {
        const { barberiaId } = req;
        const useCase = container.getReporteFinancieroUseCase;
        const reporte = await useCase.execute(barberiaId.toString(), req.query);

        res.json(reporte);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 7) GET MIS TRANSACCIONES (Barbero)
// ==========================================
exports.getMisTransacciones = async (req, res, next) => {
    try {
        const barberoId = req.user._id.toString();
        const { barberiaId } = req;
        const useCase = container.listTransactionsUseCase;

        const result = await useCase.execute(barberiaId.toString(), {
            ...req.query,
            barberoId
        });

        res.json({
            transactions: result.transactions.map(t => t.toObject()),
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 8) GET MI BALANCE (Barbero)
// ==========================================
exports.getMiBalance = async (req, res, next) => {
    try {
        const barberoId = req.user._id.toString();
        const { barberiaId } = req;
        const useCase = container.getBalanceBarberoUseCase;
        const balance = await useCase.execute(barberoId, barberiaId.toString());

        res.json({
            total: balance.total,
            pendiente: balance.pendiente,
            pagado: balance.pagado
        });
    } catch (error) {
        next(error);
    }
};
