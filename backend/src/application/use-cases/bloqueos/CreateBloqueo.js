/**
 * @file CreateBloqueo.js
 * @description Use case for creating a new date/time blocking
 */

const Bloqueo = require('../../../domain/entities/Bloqueo');

class CreateBloqueo {
    constructor(bloqueoRepository, barberiaRepository) {
        this.bloqueoRepository = bloqueoRepository;
        this.barberiaRepository = barberiaRepository;
    }

    /**
     * Executes the use case
     * @param {Object} data
     * @param {string} data.barberiaId
     * @param {string} data.barberoId - Optional
     * @param {string} data.tipo - VACACIONES, FERIADO, EMERGENCIA, OTRO
     * @param {Date} data.fechaInicio
     * @param {Date} data.fechaFin
     * @param {string} data.horaInicio - Optional, for partial blocking
     * @param {string} data.horaFin - Optional, for partial blocking
     * @param {string} data.motivo
     * @param {boolean} data.todoElDia - Default true
     * @param {string} data.creadoPor - User ID
     * @returns {Promise<Bloqueo>}
     */
    async execute(data) {
        // Validate barberia exists
        const barberia = await this.barberiaRepository.findById(data.barberiaId);
        if (!barberia) {
            throw new Error('Barbería no encontrada');
        }

        // Create domain entity
        const bloqueo = new Bloqueo({
            barberiaId: data.barberiaId,
            barberoId: data.barberoId || null,
            tipo: data.tipo,
            fechaInicio: new Date(data.fechaInicio),
            fechaFin: new Date(data.fechaFin),
            horaInicio: data.horaInicio || null,
            horaFin: data.horaFin || null,
            motivo: data.motivo,
            todoElDia: data.todoElDia !== false, // Default true
            activo: true,
            creadoPor: data.creadoPor
        });

        // Validate
        if (!bloqueo.isValid()) {
            throw new Error('Datos de bloqueo inválidos');
        }

        // Save
        const savedBloqueo = await this.bloqueoRepository.save(bloqueo);

        return savedBloqueo;
    }
}

module.exports = CreateBloqueo;
