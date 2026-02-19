import { IBarberoRepository } from '../../domain/repositories/IBarberoRepository';
import { BarberoMapper } from '../mappers/BarberoMapper';
import { httpClient } from '../http/HttpClient';
import { NotFoundError } from '../../shared/errors';

/**
 * HttpBarberoRepository
 * 
 * Implementación del repositorio de barberos usando HTTP/REST API.
 */
export class HttpBarberoRepository extends IBarberoRepository {
    constructor(client = httpClient) {
        super();
        this.client = client;
        this.baseUrl = '/barberos';
    }

    /**
     * Obtener todos los barberos con filtros
     */
    async getAll(filters = {}) {
        try {
            const data = await this.client.get(this.baseUrl, { params: filters });

            const barberos = data.barberos || data;

            return BarberoMapper.toDomainList(barberos);
        } catch (error) {
            console.error('Error al obtener barberos:', error);
            throw error;
        }
    }

    /**
     * Obtener un barbero por ID
     */
    async getById(id) {
        try {
            const data = await this.client.get(`${this.baseUrl}/${id}`);

            if (!data) {
                throw new NotFoundError('Barbero', id);
            }

            return BarberoMapper.toDomain(data.barbero || data);
        } catch (error) {
            console.error(`Error al obtener barbero ${id}:`, error);
            throw error;
        }
    }

    /**
     * Obtener disponibilidad de un barbero
     */
    async getDisponibilidad(id, fecha) {
        try {
            const data = await this.client.get(`${this.baseUrl}/${id}/disponibilidad`, {
                params: { fecha }
            });

            return data.disponibilidad || data;
        } catch (error) {
            console.error(`Error al obtener disponibilidad del barbero ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crear un nuevo barbero
     */
    async create(barberoData) {
        try {
            const dto = barberoData instanceof Object && barberoData.constructor.name === 'Barbero'
                ? BarberoMapper.toDTO(barberoData)
                : barberoData;

            const data = await this.client.post(this.baseUrl, dto);

            return BarberoMapper.toDomain(data.barbero || data);
        } catch (error) {
            console.error('Error al crear barbero:', error);
            throw error;
        }
    }

    /**
     * Actualizar un barbero
     */
    async update(id, updateData) {
        try {
            const data = await this.client.put(`${this.baseUrl}/${id}`, updateData);

            return BarberoMapper.toDomain(data.barbero || data);
        } catch (error) {
            console.error(`Error al actualizar barbero ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar un barbero
     */
    async delete(id) {
        try {
            await this.client.delete(`${this.baseUrl}/${id}`);
        } catch (error) {
            console.error(`Error al eliminar barbero ${id}:`, error);
            throw error;
        }
    }

    /**
     * Activar/Desactivar un barbero
     */
    async toggleStatus(id, activo) {
        try {
            const data = await this.client.patch(`${this.baseUrl}/${id}/status`, { activo });

            return BarberoMapper.toDomain(data.barbero || data);
        } catch (error) {
            console.error(`Error al cambiar estado del barbero ${id}:`, error);
            throw error;
        }
    }
}

// Instancia singleton del repositorio
export const httpBarberoRepository = new HttpBarberoRepository();
