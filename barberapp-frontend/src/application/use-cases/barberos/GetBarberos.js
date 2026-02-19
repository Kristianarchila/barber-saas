/**
 * Use Case: GetBarberos
 * 
 * Caso de uso para obtener barberos con filtros opcionales.
 */
export class GetBarberos {
    constructor(barberoRepository) {
        this.barberoRepository = barberoRepository;
    }

    /**
     * Ejecutar el caso de uso
     * @param {Object} filters - Filtros opcionales (activo, especialidad, etc.)
     * @returns {Promise<Barbero[]>}
     */
    async execute(filters = {}) {
        try {
            const barberos = await this.barberoRepository.getAll(filters);

            // Ordenar: activos primero, luego por calificación
            return this.sortBarberos(barberos);
        } catch (error) {
            console.error('Error en GetBarberos:', error);
            throw error;
        }
    }

    /**
     * Ordenar barberos (activos primero, luego por calificación)
     */
    sortBarberos(barberos) {
        return barberos.sort((a, b) => {
            // Primero: activos antes que inactivos
            if (a.activo !== b.activo) {
                return a.activo ? -1 : 1;
            }

            // Segundo: por calificación (mayor a menor)
            return b.calificacionPromedio - a.calificacionPromedio;
        });
    }
}
