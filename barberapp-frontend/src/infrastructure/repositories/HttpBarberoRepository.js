import { IBarberoRepository } from '../../domain/repositories/IBarberoRepository';
import { BarberoMapper } from '../mappers/BarberoMapper';
import { httpClient } from '../http/HttpClient';
import { NotFoundError } from '../../shared/errors';
import { getSlug } from '../../utils/slugUtils';

/**
 * HttpBarberoRepository
 *
 * Implementación del repositorio de barberos usando HTTP/REST API.
 * ⚠️  All routes are tenant-scoped: /barberias/:slug/barbero/*
 */
export class HttpBarberoRepository extends IBarberoRepository {
    constructor(client = httpClient) {
        super();
        this.client = client;
    }

    /** Compute the correct tenant-scoped base URL */
    _baseUrl() {
        const slug = getSlug();
        return `/barberias/${slug}/barbero`;
    }

    /**
     * Obtener todos los barberos con filtros
     */
    async getAll(filters = {}) {
        try {
            const data = await this.client.get(this._baseUrl(), { params: filters });
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
            const data = await this.client.get(`${this._baseUrl()}/${id}`);
            if (!data) throw new NotFoundError('Barbero', id);
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
            const data = await this.client.get(`${this._baseUrl()}/${id}/disponibilidad`, {
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
            const data = await this.client.post(this._baseUrl(), dto);
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
            const data = await this.client.put(`${this._baseUrl()}/${id}`, updateData);
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
            await this.client.delete(`${this._baseUrl()}/${id}`);
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
            const data = await this.client.patch(`${this._baseUrl()}/${id}/toggle`, { activo });
            return BarberoMapper.toDomain(data.barbero || data);
        } catch (error) {
            console.error(`Error al cambiar estado del barbero ${id}:`, error);
            throw error;
        }
    }
}

// Instancia singleton del repositorio
export const httpBarberoRepository = new HttpBarberoRepository();
