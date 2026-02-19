/**
 * UpdateBarberiaConfig Use Case
 */
const AuditHelper = require('../../../utils/AuditHelper');

class UpdateBarberiaConfig {
    constructor(barberiaRepository) {
        this.barberiaRepository = barberiaRepository;
    }

    async execute(id, data, userId = null, request = null) {
        const barberia = await this.barberiaRepository.findById(id);
        if (!barberia) throw new Error('Barbería no encontrada');

        // Guardar configuración anterior para auditoría
        const configBefore = {
            nombre: barberia.nombre,
            direccion: barberia.direccion,
            telefono: barberia.telefono,
            configuracion: barberia.configuracion
        };

        // Prepare update data
        // We use dot notation for nested fields to avoid overwriting the whole configuracion object in Mongo
        const updateData = {};

        // 1. Basic Info
        if (data.nombre) updateData.nombre = data.nombre;
        if (data.direccion) updateData.direccion = data.direccion;
        if (data.telefono) updateData.telefono = data.telefono;

        // 2. Configuration Fields mapping
        const configFields = [
            'colorPrincipal', 'colorAccent', 'logoUrl', 'bannerUrl',
            'mensajeBienvenida', 'heroTitle', 'badge', 'ctaPrimary',
            'ctaSecondary', 'galeria', 'instagram', 'facebook',
            'googleMapsUrl', 'seoTitle', 'seoDescription', 'faviconUrl',
            'analyticsId', 'pixelId', 'emailNotificaciones',
            'nombreParaEmails', 'emailProvider', 'smtpConfig'
        ];

        configFields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[`configuracion.${field}`] = data[field];
            }
        });

        // 3. Special handling for password encryption
        if (data.emailPassword) {
            const { encrypt } = require('../../../utils/encryption');
            updateData['configuracion.emailPassword'] = encrypt(data.emailPassword);
        }

        // 4. Persistence
        const updated = await this.barberiaRepository.update(id, { $set: updateData });

        // 5. 📝 AUDITAR - Registrar cambio de configuración
        if (userId) {
            // Determinar tipo de configuración cambiada
            let configType = 'general';
            if (data.emailProvider || data.smtpConfig || data.emailPassword) {
                configType = 'email';
            } else if (data.colorPrincipal || data.colorAccent || data.logoUrl) {
                configType = 'visual';
            } else if (data.seoTitle || data.seoDescription) {
                configType = 'seo';
            }

            await AuditHelper.logConfigUpdate({
                userId,
                barberiaId: id,
                configType,
                changes: {
                    before: configBefore,
                    after: data
                },
                request: request ? AuditHelper.extractRequestInfo(request) : {}
            });
        }

        return updated;
    }
}

module.exports = UpdateBarberiaConfig;
