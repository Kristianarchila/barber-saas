import { IReservaRepository } from '../../domain/repositories/IReservaRepository';
import { ReservaMapper } from '../mappers/ReservaMapper';
import { httpClient } from '../http/HttpClient';
import { NotFoundError } from '../../shared/errors';

/**
 * HttpReservaRepository
 * 
 * Implementación del repositorio de reservas usando HTTP/REST API.
 * Esta clase pertenece a la capa de infraestructura y depende de HttpClient.
 */
export class HttpReservaRepository extends IReservaRepository {
    constructor(client = httpClient) {
        super();
        this.client = client;
        this.baseUrl = '/reservas';
    }

    /**
     * Obtener todas las reservas con filtros
     */
    async getAll(filters = {}) {
        try {
            const data = await this.client.get(this.baseUrl, { params: filters });

            // El backend puede retornar { reservas: [...] } o directamente [...]
            const reservas = data.reservas || data;

            return ReservaMapper.toDomainList(reservas);
        } catch (error) {
            console.error('Error al obtener reservas:', error);
            throw error;
        }
    }

    /**
     * Obtener una reserva por ID
     */
    async getById(id) {
        try {
            const data = await this.client.get(`${this.baseUrl}/${id}`);

            if (!data) {
                throw new NotFoundError('Reserva', id);
            }

            return ReservaMapper.toDomain(data.reserva || data);
        } catch (error) {
            console.error(`Error al obtener reserva ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crear una nueva reserva
     */
    async create(reservaData) {
        try {
            // Convertir a DTO si es una entidad de dominio
            const dto = reservaData instanceof Object && reservaData.constructor.name === 'Reserva'
                ? ReservaMapper.toDTO(reservaData)
                : reservaData;

            const data = await this.client.post(this.baseUrl, dto);

            return ReservaMapper.toDomain(data.reserva || data);
        } catch (error) {
            console.error('Error al crear reserva:', error);
            throw error;
        }
    }

    /**
     * Actualizar una reserva
     */
    async update(id, updateData) {
        try {
            const data = await this.client.put(`${this.baseUrl}/${id}`, updateData);

            return ReservaMapper.toDomain(data.reserva || data);
        } catch (error) {
            console.error(`Error al actualizar reserva ${id}:`, error);
            throw error;
        }
    }

    /**
     * Cancelar una reserva
     */
    async cancel(id) {
        try {
            const data = await this.client.put(`${this.baseUrl}/${id}/cancelar`);

            return ReservaMapper.toDomain(data.reserva || data);
        } catch (error) {
            console.error(`Error al cancelar reserva ${id}:`, error);
            throw error;
        }
    }

    /**
     * Completar una reserva
     */
    async complete(id) {
        try {
            const data = await this.client.put(`${this.baseUrl}/${id}/completar`);

            return ReservaMapper.toDomain(data.reserva || data);
        } catch (error) {
            console.error(`Error al completar reserva ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar una reserva
     */
    async delete(id) {
        try {
            await this.client.delete(`${this.baseUrl}/${id}`);
        } catch (error) {
            console.error(`Error al eliminar reserva ${id}:`, error);
            throw error;
        }
    }
}

// Instancia singleton del repositorio
export const httpReservaRepository = new HttpReservaRepository();
