/**
 * ListTransactions Use Case
 */
class ListTransactions {
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    async execute(barberiaId, { barberoId, estado, desde, hasta, page = 1, limit = 50 }) {
        const query = { barberiaId };
        if (barberoId) query.barberoId = barberoId;
        if (estado) query.estado = estado;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filtros = {
            ...query,
            fechaInicio: desde ? new Date(desde) : null,
            fechaFin: hasta ? new Date(hasta) : null,
            skip,
            limite: parseInt(limit)
        };

        const transactions = await this.transactionRepository.findAll(filtros);

        // Fix: count() expects (query, barberiaId) not just query with barberiaId inside
        const countQuery = {};
        if (barberoId) countQuery.barberoId = barberoId;
        if (estado) countQuery.estado = estado;
        const total = await this.transactionRepository.count(countQuery, barberiaId);

        return {
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        };
    }
}

module.exports = ListTransactions;
