/**
 * GetTransactionById Use Case
 */
class GetTransactionById {
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    async execute(id, barberiaId) {
        const transaction = await this.transactionRepository.findById(id);

        if (!transaction || transaction.barberiaId !== barberiaId) {
            throw new Error('Transacción no encontrada');
        }

        return transaction;
    }
}

module.exports = GetTransactionById;
