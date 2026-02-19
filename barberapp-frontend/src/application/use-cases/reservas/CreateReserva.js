import { ValidationError, BusinessRuleError } from '../../../shared/errors';
import { Email } from '../../../domain/value-objects';

/**
 * Use Case: CreateReserva
 * 
 * Caso de uso para crear una nueva reserva.
 * Contiene toda la lógica de negocio para la creación.
 */
export class CreateReserva {
    constructor(reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    /**
     * Ejecutar el caso de uso
     * @param {Object} data - Datos de la reserva
     * @returns {Promise<Reserva>}
     */
    async execute(data) {
        // 1. Validaciones de datos obligatorios
        this.validateRequiredFields(data);

        // 2. Validar email
        try {
            new Email(data.emailCliente);
        } catch (error) {
            throw new ValidationError('Email inválido', 'emailCliente');
        }

        // 3. Validar que la fecha no sea del pasado
        this.validateFecha(data.fecha, data.hora);

        // 4. Crear la reserva
        try {
            const reserva = await this.reservaRepository.create({
                barberoId: data.barberoId,
                servicioId: data.servicioId,
                nombreCliente: data.nombreCliente,
                emailCliente: data.emailCliente,
                telefonoCliente: data.telefonoCliente || null,
                fecha: data.fecha,
                hora: data.hora,
                estado: 'RESERVADA'
            });

            return reserva;
        } catch (error) {
            console.error('Error en CreateReserva:', error);
            throw error;
        }
    }

    /**
     * Validar campos obligatorios
     */
    validateRequiredFields(data) {
        const requiredFields = [
            'barberoId',
            'servicioId',
            'nombreCliente',
            'emailCliente',
            'fecha',
            'hora'
        ];

        for (const field of requiredFields) {
            if (!data[field]) {
                throw new ValidationError(
                    `El campo ${field} es obligatorio`,
                    field
                );
            }
        }
    }

    /**
     * Validar que la fecha/hora no sea del pasado
     */
    validateFecha(fecha, hora) {
        const ahora = new Date();
        const fechaReserva = new Date(`${fecha}T${hora}`);

        if (fechaReserva < ahora) {
            throw new BusinessRuleError(
                'No se puede crear una reserva en el pasado',
                'FECHA_PASADA'
            );
        }
    }
}
