import { Reserva } from '../../domain/entities/Reserva';

/**
 * Mapper: ReservaMapper
 * 
 * Transforma datos entre diferentes capas:
 * - DTO (del backend) → Domain Entity
 * - Domain Entity → DTO (para el backend)
 */
export class ReservaMapper {
    /**
     * Convertir DTO del backend a entidad de dominio
     */
    static toDomain(dto) {
        if (!dto) return null;

        return new Reserva({
            id: dto._id,
            barberoId: dto.barberoId?._id || dto.barberoId,
            servicioId: dto.servicioId?._id || dto.servicioId,
            clienteNombre: dto.nombreCliente || dto.clienteNombre,
            clienteEmail: dto.emailCliente || dto.clienteEmail,
            clienteTelefono: dto.telefonoCliente || dto.clienteTelefono || null,
            fecha: dto.fecha,
            hora: dto.hora,
            horaFin: dto.horaFin || null,
            estado: dto.estado,
            precio: dto.precioSnapshot?.precioFinal || dto.precio || null,
            cancelToken: dto.cancelToken || null,
            createdAt: dto.createdAt || null
        });
    }

    /**
     * Convertir array de DTOs a entidades de dominio
     */
    static toDomainList(dtos) {
        if (!Array.isArray(dtos)) return [];
        return dtos.map(dto => this.toDomain(dto));
    }

    /**
     * Convertir entidad de dominio a DTO para el backend
     */
    static toDTO(domain) {
        if (!domain) return null;

        return {
            barberoId: domain.barberoId,
            servicioId: domain.servicioId,
            nombreCliente: domain.clienteNombre,
            emailCliente: domain.clienteEmail,
            telefonoCliente: domain.clienteTelefono,
            fecha: domain.fecha,
            hora: domain.hora,
            estado: domain.estado
        };
    }

    /**
     * Convertir entidad de dominio a objeto para UI
     * (incluye datos calculados y formateados)
     */
    static toViewModel(domain) {
        if (!domain) return null;

        return {
            id: domain.id,
            barberoId: domain.barberoId,
            servicioId: domain.servicioId,
            clienteNombre: domain.clienteNombre,
            clienteEmail: domain.clienteEmail,
            clienteTelefono: domain.clienteTelefono,
            fecha: domain.fecha,
            hora: domain.hora,
            horaFin: domain.horaFin,
            estado: domain.estado,
            estadoLabel: domain.getEstadoLabel(),
            estadoColor: domain.getEstadoColor(),
            precio: domain.precio,
            puedeSerCancelada: domain.puedeSerCancelada(),
            puedeSerCompletada: domain.puedeSerCompletada(),
            estaVigente: domain.estaVigente(),
            esDeHoy: domain.esDeHoy(),
            cancelToken: domain.cancelToken,
            createdAt: domain.createdAt
        };
    }
}
