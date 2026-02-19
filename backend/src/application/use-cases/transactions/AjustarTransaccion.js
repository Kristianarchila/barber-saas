/**
 * AjustarTransaccion Use Case
 */
class AjustarTransaccion {
    constructor(transactionRepository, revenueConfigRepository) {
        this.transactionRepository = transactionRepository;
        this.revenueConfigRepository = revenueConfigRepository;
    }

    async execute(transactionId, ajuste, adminId) {
        const transaction = await this.transactionRepository.findById(transactionId);

        if (!transaction) {
            throw new Error('Transacción no encontrada');
        }

        // Verificar permisos
        const config = await this.revenueConfigRepository.findByBarberiaId(transaction.barberiaId);
        if (!config?.ajustesPermitidos?.adminPuedeEditarMontos) {
            throw new Error('Ajustes manuales no permitidos en esta barbería');
        }

        // Validar estado
        if (transaction.estado === 'pagado') {
            throw new Error('No se puede ajustar una transacción ya pagada');
        }

        // Validar que los montos sumen el total
        const suma = ajuste.montoBarbero + ajuste.montoBarberia;
        if (Math.abs(suma - transaction.montosFinales.montoTotal) > 1) {
            throw new Error('La suma de los montos debe ser igual al total');
        }

        // Aplicar ajuste
        transaction.ajustar(ajuste, adminId);

        return await this.transactionRepository.save(transaction);
    }
}

module.exports = AjustarTransaccion;
