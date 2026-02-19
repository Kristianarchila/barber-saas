/**
 * UpdateAdminSedes Use Case
 * Updates the barberia locations (sedes) assigned to an administrator
 * 
 * ✅ FIXED: Now uses repository instead of directly importing Mongoose Model
 */

class UpdateAdminSedes {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(adminId, barberiaIds) {
        try {
            // Validate input
            if (!adminId) {
                throw new Error('Admin ID is required');
            }

            if (!Array.isArray(barberiaIds)) {
                throw new Error('barberiaIds must be an array');
            }

            // Find the admin user using repository
            const admin = await this.userRepository.findById(adminId);

            if (!admin) {
                throw new Error('Administrator not found');
            }

            if (admin.rol !== 'BARBERIA_ADMIN') {
                throw new Error('User is not a barberia administrator');
            }

            // Prepare update data
            const updateData = {
                barberiaIds: barberiaIds,
                // If there are assigned locations, set the first one as the primary barberiaId
                barberiaId: barberiaIds.length > 0 ? barberiaIds[0] : null
            };

            // Update using repository
            const updatedAdmin = await this.userRepository.update(adminId, updateData);

            // Fetch updated admin with populated data
            const adminWithDetails = await this.userRepository.findByRole('BARBERIA_ADMIN', {
                populateBarberia: true,
                populateBarberias: true
            });

            // Find the specific admin we just updated
            const result = adminWithDetails.find(a => a.id === adminId);

            return {
                success: true,
                message: 'Sedes actualizadas correctamente',
                admin: {
                    id: result.id,
                    nombre: result.nombre,
                    email: result.email,
                    barberiaIds: result.populatedBarberiaIds || result.barberiaIds.map(id => ({ _id: id }))
                }
            };
        } catch (error) {
            throw new Error(`Error al actualizar sedes: ${error.message}`);
        }
    }
}

module.exports = UpdateAdminSedes;
