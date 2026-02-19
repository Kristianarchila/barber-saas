import { Barbero } from '../../domain/entities/Barbero';

/**
 * Mapper: BarberoMapper
 * 
 * Transforma datos entre diferentes capas para Barberos
 */
export class BarberoMapper {
    /**
     * Convertir DTO del backend a entidad de dominio
     */
    static toDomain(dto) {
        if (!dto) return null;

        return new Barbero({
            id: dto._id || dto.id,
            nombre: dto.nombre,
            email: dto.email,
            telefono: dto.telefono || null,
            especialidad: dto.especialidad || null,
            descripcion: dto.descripcion || null,
            imagen: dto.imagen || null,
            activo: dto.activo !== undefined ? dto.activo : true,
            horarios: dto.horarios || [],
            servicios: dto.servicios || [],
            calificacionPromedio: dto.calificacionPromedio || 0,
            totalResenas: dto.totalResenas || 0,
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
            nombre: domain.nombre,
            email: domain.email,
            telefono: domain.telefono,
            especialidad: domain.especialidad,
            descripcion: domain.descripcion,
            imagen: domain.imagen,
            activo: domain.activo,
            horarios: domain.horarios,
            servicios: domain.servicios
        };
    }

    /**
     * Convertir entidad de dominio a ViewModel para UI
     */
    static toViewModel(domain) {
        if (!domain) return null;

        const calificacionBadge = domain.getCalificacionBadge();

        return {
            id: domain.id,
            nombre: domain.nombre,
            email: domain.email,
            telefono: domain.telefono,
            especialidad: domain.especialidad,
            descripcion: domain.descripcion,
            imagen: domain.imagen,
            activo: domain.activo,
            horarios: domain.horarios,
            servicios: domain.servicios,
            calificacionPromedio: domain.calificacionPromedio,
            totalResenas: domain.totalResenas,

            // Propiedades calculadas
            estaActivo: domain.estaActivo(),
            tieneBuenaCalificacion: domain.tieneBuenaCalificacion(),
            tieneResenas: domain.tieneResenas(),
            diasDisponibles: domain.getDiasDisponibles(),
            iniciales: domain.getIniciales(),
            calificacionBadge: calificacionBadge,

            createdAt: domain.createdAt
        };
    }

    /**
     * Convertir lista de entidades a ViewModels
     */
    static toViewModelList(domains) {
        if (!Array.isArray(domains)) return [];
        return domains.map(domain => this.toViewModel(domain));
    }
}
