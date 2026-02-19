/**
 * GetAdmins Use Case
 * Retrieves all administrators (users with BARBERIA_ADMIN role)
 * 
 * ✅ FIXED: Now uses repository instead of directly importing Mongoose Model
 */

class GetAdmins {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute() {
        try {
            // Use repository method instead of direct Model access
            const admins = await this.userRepository.findByRole('BARBERIA_ADMIN', {
                populateBarberia: true,
                populateBarberias: true
            });

            // Map to return structure expected by frontend
            return admins.map(admin => ({
                _id: admin.id,
                id: admin.id,
                nombre: admin.nombre,
                email: admin.email,
                telefono: admin.telefono,
                rol: admin.rol,
                barberiaId: admin.barberiaId,
                // Frontend expects barberiaIds as an array
                barberiaIds: admin.populatedBarberiaIds ||
                    (admin.barberiaIds && admin.barberiaIds.length > 0
                        ? admin.barberiaIds.map(id => ({ _id: id }))
                        : admin.barberia ? [{
                            _id: admin.barberiaId,
                            nombre: admin.barberia.nombre,
                            slug: admin.barberia.slug,
                            direccion: admin.barberia.direccion
                        }] : []),
                barberia: admin.barberia,
                activo: admin.activo,
                createdAt: admin.createdAt
            }));
        } catch (error) {
            throw new Error(`Error al obtener administradores: ${error.message}`);
        }
    }
}

module.exports = GetAdmins;
