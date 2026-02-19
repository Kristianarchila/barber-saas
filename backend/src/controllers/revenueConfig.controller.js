/**
 * RevenueConfig Controller (Hexagonal Architecture Version)
 * Uses existing RevenueConfig model directly for simplicity
 */
const container = require('../shared/Container');
const RevenueConfig = require('../models/RevenueConfig');

exports.getConfig = async (req, res) => {
    try {
        const { barberiaId } = req;

        if (!barberiaId) {
            return res.status(400).json({ message: 'No se identificó la barbería' });
        }

        let config = await RevenueConfig.findOne({ barberiaId });

        // Create default config if doesn't exist
        if (!config) {
            try {
                config = await RevenueConfig.create({
                    barberiaId,
                    configuracionGeneral: {
                        metodoPorcentaje: 'porcentaje',
                        porcentajeDefaultBarbero: 50,
                        porcentajeDefaultBarberia: 50
                    }
                });
            } catch (createError) {
                if (createError.code === 11000) {
                    config = await RevenueConfig.findOne({ barberiaId });
                } else {
                    throw createError;
                }
            }
        }

        res.json(config);
    } catch (error) {
        console.error('Error obteniendo config revenue:', error);
        res.status(500).json({ message: 'Error al obtener configuración' });
    }
};

exports.updateConfig = async (req, res) => {
    try {
        const { barberiaId } = req;
        const updates = req.body;

        // Validate percentages sum to 100
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
        console.error('Error actualizando config revenue:', error);
        res.status(500).json({ message: error.message || 'Error al actualizar configuración' });
    }
};

exports.setOverrideBarbero = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { barberoId } = req.params;
        const { porcentajeBarbero, porcentajeBarberia } = req.body;

        if (porcentajeBarbero + porcentajeBarberia !== 100) {
            return res.status(400).json({ message: 'Los porcentajes deben sumar 100%' });
        }

        let config = await RevenueConfig.findOne({ barberiaId });
        if (!config) {
            config = await RevenueConfig.create({ barberiaId });
        }

        const existingIndex = config.overridesPorBarbero.findIndex(
            ov => ov.barberoId && ov.barberoId.toString() === barberoId
        );

        if (existingIndex >= 0) {
            config.overridesPorBarbero[existingIndex] = {
                barberoId,
                porcentajeBarbero,
                porcentajeBarberia,
                activo: true
            };
        } else {
            config.overridesPorBarbero.push({
                barberoId,
                porcentajeBarbero,
                porcentajeBarberia,
                activo: true
            });
        }

        await config.save();
        res.json(config);
    } catch (error) {
        console.error('Error configurando override barbero:', error);
        res.status(500).json({ message: 'Error al configurar override' });
    }
};

exports.setOverrideServicio = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { servicioId } = req.params;
        const { porcentajeBarbero, porcentajeBarberia } = req.body;

        if (porcentajeBarbero + porcentajeBarberia !== 100) {
            return res.status(400).json({ message: 'Los porcentajes deben sumar 100%' });
        }

        let config = await RevenueConfig.findOne({ barberiaId });
        if (!config) {
            config = await RevenueConfig.create({ barberiaId });
        }

        const existingIndex = config.overridesPorServicio.findIndex(
            ov => ov.servicioId && ov.servicioId.toString() === servicioId
        );

        if (existingIndex >= 0) {
            config.overridesPorServicio[existingIndex] = {
                servicioId,
                porcentajeBarbero,
                porcentajeBarberia,
                activo: true
            };
        } else {
            config.overridesPorServicio.push({
                servicioId,
                porcentajeBarbero,
                porcentajeBarberia,
                activo: true
            });
        }

        await config.save();
        res.json(config);
    } catch (error) {
        console.error('Error configurando override servicio:', error);
        res.status(500).json({ message: 'Error al configurar override' });
    }
};

exports.deleteOverride = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { tipo, id } = req.params;

        const config = await RevenueConfig.findOne({ barberiaId });
        if (!config) {
            return res.status(404).json({ message: 'Configuración no encontrada' });
        }

        if (tipo === 'barbero') {
            const override = config.overridesPorBarbero.find(
                ov => ov.barberoId && ov.barberoId.toString() === id
            );
            if (override) override.activo = false;
        } else if (tipo === 'servicio') {
            const override = config.overridesPorServicio.find(
                ov => ov.servicioId && ov.servicioId.toString() === id
            );
            if (override) override.activo = false;
        }

        await config.save();
        res.json(config);
    } catch (error) {
        console.error('Error eliminando override:', error);
        res.status(500).json({ message: 'Error al eliminar override' });
    }
};

exports.getOverrideBarbero = async (req, res) => {
    try {
        const { barberiaId } = req;
        const { barberoId } = req.params;

        const config = await RevenueConfig.findOne({ barberiaId });
        if (!config) {
            return res.json(null);
        }

        const override = config.overridesPorBarbero.find(
            ov => ov.barberoId && ov.barberoId.toString() === barberoId && ov.activo
        );

        res.json(override || null);
    } catch (error) {
        console.error('Error obteniendo override barbero:', error);
        res.status(500).json({ message: 'Error al obtener override' });
    }
};
