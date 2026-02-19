const RevenueConfig = require('../models/RevenueConfig');

/**
 * Obtener configuración de revenue split de la barbería
 */
exports.getConfig = async (req, res) => {
    try {
        const { barberiaId } = req;
        console.log('🔍 GET CONFIG - barberiaId:', barberiaId);

        if (!barberiaId) {
            return res.status(400).json({ message: 'No se identificó la barbería' });
        }

        let config = await RevenueConfig.findOne({ barberiaId });
        console.log('🔍 GET CONFIG - Result:', config ? 'Found' : 'Not Found');

        // Si no existe, crear configuración por defecto
        if (!config) {
            console.log('🔍 GET CONFIG - Creating default config for:', barberiaId);
            try {
                config = await RevenueConfig.create({
                    barberiaId,
                    configuracionGeneral: {
                        metodoPorcentaje: 'porcentaje',
                        porcentajeDefaultBarbero: 50,
                        porcentajeDefaultBarberia: 50
                    }
                });
                console.log('🔍 GET CONFIG - Created successfully');
            } catch (createError) {
                // Si otro proceso la creó justo en este momento (race condition)
                if (createError.code === 11000) {
                    config = await RevenueConfig.findOne({ barberiaId });
                } else {
                    throw createError;
                }
            }
        }

        res.json(config);
    } catch (error) {
        console.error('❌ Error obteniendo config revenue:', error);
        res.status(500).json({
            message: 'Error al obtener configuración',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Actualizar configuración general
 */
exports.updateConfig = async (req, res) => {
    try {
        const { barberiaId } = req;
        const updates = req.body;

        // Validar que los porcentajes sumen 100
        if (updates.configuracionGeneral) {
            const { porcentajeDefaultBarbero, porcentajeDefaultBarberia } = updates.configuracionGeneral;
            if (porcentajeDefaultBarbero + porcentajeDefaultBarberia !== 100) {
                return res.status(400).json({ message: 'Los porcentajes deben sumar 100%' });
            }
        }

        let config = await RevenueConfig.findOne({ barberiaId });

        if (!config) {
            config = await RevenueConfig.create({
                barberiaId,
                ...updates
            });
        } else {
            // Actualizar campos permitidos
            if (updates.configuracionGeneral) {
                config.configuracionGeneral = {
                    ...config.configuracionGeneral,
                    ...updates.configuracionGeneral
                };
            }
            if (updates.ajustesPermitidos) {
                config.ajustesPermitidos = {
                    ...config.ajustesPermitidos,
                    ...updates.ajustesPermitidos
                };
            }
            if (updates.impuestos) {
                config.impuestos = {
                    ...config.impuestos,
                    ...updates.impuestos
                };
            }

            await config.save();
        }

        res.json(config);
    } catch (error) {
        console.error('❌ Error actualizando config revenue:', error);
        res.status(500).json({ message: error.message || 'Error al actualizar configuración' });
    }
};

/**
 * Configurar override por barbero
 */
exports.setOverrideBarbero = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { barberoId } = req.params;
        const { porcentajeBarbero, porcentajeBarberia, notas } = req.body;

        // Validar porcentajes
        if (porcentajeBarbero + porcentajeBarberia !== 100) {
            return res.status(400).json({ message: 'Los porcentajes deben sumar 100%' });
        }

        let config = await RevenueConfig.findOne({ barberiaId });

        if (!config) {
            config = await RevenueConfig.create({ barberiaId });
        }

        // Buscar si ya existe override para este barbero
        const existingIndex = config.overridesPorBarbero.findIndex(
            o => o.barberoId.toString() === barberoId
        );

        if (existingIndex >= 0) {
            // Actualizar existente
            config.overridesPorBarbero[existingIndex] = {
                ...config.overridesPorBarbero[existingIndex],
                porcentajeBarbero,
                porcentajeBarberia,
                notas,
                activo: true
            };
        } else {
            // Crear nuevo
            config.overridesPorBarbero.push({
                barberoId,
                metodo: 'porcentaje',
                porcentajeBarbero,
                porcentajeBarberia,
                notas,
                activo: true
            });
        }

        await config.save();

        res.json(config);
    } catch (error) {
        console.error('❌ Error configurando override barbero:', error);
        res.status(500).json({ message: 'Error al configurar override' });
    }
};

/**
 * Configurar override por servicio
 */
exports.setOverrideServicio = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { servicioId } = req.params;
        const { porcentajeBarbero, porcentajeBarberia, notas } = req.body;

        // Validar porcentajes
        if (porcentajeBarbero + porcentajeBarberia !== 100) {
            return res.status(400).json({ message: 'Los porcentajes deben sumar 100%' });
        }

        let config = await RevenueConfig.findOne({ barberiaId });

        if (!config) {
            config = await RevenueConfig.create({ barberiaId });
        }

        // Buscar si ya existe override para este servicio
        const existingIndex = config.overridesPorServicio.findIndex(
            o => o.servicioId.toString() === servicioId
        );

        if (existingIndex >= 0) {
            // Actualizar existente
            config.overridesPorServicio[existingIndex] = {
                ...config.overridesPorServicio[existingIndex],
                porcentajeBarbero,
                porcentajeBarberia,
                notas,
                activo: true
            };
        } else {
            // Crear nuevo
            config.overridesPorServicio.push({
                servicioId,
                metodo: 'porcentaje',
                porcentajeBarbero,
                porcentajeBarberia,
                notas,
                activo: true
            });
        }

        await config.save();

        res.json(config);
    } catch (error) {
        console.error('❌ Error configurando override servicio:', error);
        res.status(500).json({ message: 'Error al configurar override' });
    }
};

/**
 * Eliminar override (desactivar)
 */
exports.deleteOverride = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { tipo, id } = req.params; // tipo: 'barbero' | 'servicio', id: barberoId o servicioId

        const config = await RevenueConfig.findOne({ barberiaId });

        if (!config) {
            return res.status(404).json({ message: 'Configuración no encontrada' });
        }

        if (tipo === 'barbero') {
            const override = config.overridesPorBarbero.find(
                o => o.barberoId.toString() === id
            );
            if (override) {
                override.activo = false;
            }
        } else if (tipo === 'servicio') {
            const override = config.overridesPorServicio.find(
                o => o.servicioId.toString() === id
            );
            if (override) {
                override.activo = false;
            }
        }

        await config.save();

        res.json({ message: 'Override eliminado', config });
    } catch (error) {
        console.error('❌ Error eliminando override:', error);
        res.status(500).json({ message: 'Error al eliminar override' });
    }
};

/**
 * Obtener override específico de un barbero
 */
exports.getOverrideBarbero = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { barberoId } = req.params;

        const config = await RevenueConfig.findOne({ barberiaId });

        if (!config) {
            return res.json(null);
        }

        const override = config.overridesPorBarbero.find(
            o => o.barberoId.toString() === barberoId && o.activo
        );

        res.json(override || null);
    } catch (error) {
        console.error('❌ Error obteniendo override barbero:', error);
        res.status(500).json({ message: 'Error al obtener override' });
    }
};
