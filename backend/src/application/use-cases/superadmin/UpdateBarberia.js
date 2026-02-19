const Slug = require('../../../domain/value-objects/Slug');

/**
 * UpdateBarberia Use Case
 * Updates barberia data with validation
 */
class UpdateBarberia {
    constructor(barberiaRepository) {
        this.barberiaRepository = barberiaRepository;
    }

    async execute(barberiaId, updates, currentUserId) {
        // Get existing barberia
        const barberia = await this.barberiaRepository.findById(barberiaId);
        if (!barberia) {
            throw new Error('Barbería no encontrada');
        }

        // Remove protected fields
        delete updates._id;
        delete updates.historial;
        delete updates.createdAt;
        delete updates.updatedAt;

        // Validate and normalize slug if changed
        if (updates.slug && updates.slug !== barberia.slug) {
            const slugNuevo = Slug.normalize(updates.slug);
            if (!slugNuevo) {
                throw new Error('Slug inválido');
            }

            // Check uniqueness
            const slugExists = await this.barberiaRepository.exists({
                slug: slugNuevo,
                _id: { $ne: barberiaId }
            });
            if (slugExists) {
                throw new Error('El slug ya está en uso');
            }

            updates.slug = slugNuevo;
        }

        // Normalize email if changed
        if (updates.email) {
            updates.email = updates.email.toLowerCase().trim();
        }

        // Update barberia
        const barberiaObj = barberia.toObject();
        const updatedData = {
            ...barberiaObj,
            ...updates,
            updatedAt: new Date()
        };

        // Add history entry
        if (!updatedData.historial) {
            updatedData.historial = [];
        }
        updatedData.historial.push({
            fecha: new Date(),
            accion: 'actualizada',
            realizadoPor: currentUserId,
            notas: 'Datos de barbería actualizados'
        });

        // Save updates
        const updated = await this.barberiaRepository.update(barberiaId, updatedData);

        return updated;
    }
}

module.exports = UpdateBarberia;
