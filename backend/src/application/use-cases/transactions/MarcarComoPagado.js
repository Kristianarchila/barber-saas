/**
 * MarcarComoPagado Use Case
 */
class MarcarComoPagado {
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    async execute(id, barberiaId, adminId, data = {}) {
        const transaction = await this.transactionRepository.findOne({ _id: id, barberiaId });

        if (!transaction) {
            throw new Error('Transacción no encontrada');
        }

        if (transaction.estado === 'pagado') {
            throw new Error('La transacción ya está marcada como pagada');
        }

        transaction.marcarPagado(adminId, data);

        return await this.transactionRepository.save(transaction);
    }
}

module.exports = MarcarComoPagado;
