const Venta = require('../../../domain/entities/Venta');
const RevenueConfig = require('../../../infrastructure/database/mongodb/models/RevenueConfig');

/**
 * RegistrarVentaRapida Use Case
 * Handles mixed sales of services and products.
 * Server-side price validation and IVA calculation to prevent manipulation.
 */
class RegistrarVentaRapida {
    constructor(
        ventaRepository,
        inventarioRepository,
        cajaRepository,
        transactionRepository,
        barberoRepository,
        servicioRepository,
        productoRepository
    ) {
        this.ventaRepository = ventaRepository;
        this.inventarioRepository = inventarioRepository;
        this.cajaRepository = cajaRepository;
        this.transactionRepository = transactionRepository;
        this.barberoRepository = barberoRepository;
        this.servicioRepository = servicioRepository;
        this.productoRepository = productoRepository;
    }

    async execute(barberiaId, ventaData) {
        const {
            barberoId,
            items,
            descuento = 0,
            metodoPago
        } = ventaData;

        if (!items || items.length === 0) {
            throw new Error('La venta debe tener al menos un item');
        }

        // Ensure each item has an itemId (fallback to id if sent by frontend incorrectly)
        const rawItems = items.map(item => ({
            ...item,
            itemId: item.itemId || item.id
        }));

        // ── Server-side price validation ──────────────────────────────
        // Look up real prices from DB; never trust frontend amounts
        const validatedItems = [];
        for (const item of rawItems) {
            const cantidad = item.cantidad || 1;

            if (item.type === 'servicio') {
                const servicio = await this.servicioRepository.findById(item.itemId, barberiaId);
                const precioReal = servicio.precio.amount;

                if (item.precio && item.precio !== precioReal) {
                    console.warn(
                        `[PRICE MISMATCH] Servicio "${servicio.nombre}" (${item.itemId}): ` +
                        `frontend=${item.precio}, real=${precioReal}. Using real price.`
                    );
                }

                validatedItems.push({
                    ...item,
                    nombre: servicio.nombre,
                    precio: precioReal,
                    cantidad,
                    subtotal: precioReal * cantidad
                });

            } else if (item.type === 'producto') {
                const producto = await this.productoRepository.findById(item.itemId, barberiaId);
                const precioReal = producto.precioEfectivo;

                if (item.precio && item.precio !== precioReal) {
                    console.warn(
                        `[PRICE MISMATCH] Producto "${producto.nombre}" (${item.itemId}): ` +
                        `frontend=${item.precio}, real=${precioReal}. Using real price.`
                    );
                }

                validatedItems.push({
                    ...item,
                    nombre: producto.nombre,
                    precio: precioReal,
                    cantidad,
                    subtotal: precioReal * cantidad
                });

            } else {
                throw new Error(`Tipo de item no válido: ${item.type}`);
            }
        }

        // ── Server-side IVA & totals calculation ─────────────────────
        // Look up barberia's IVA config from RevenueConfig
        let tasaIva = 0;
        try {
            const config = await RevenueConfig.findOne({ barberiaId });
            if (config && config.impuestos && config.impuestos.aplicarIVA) {
                tasaIva = config.impuestos.iva || 0;
            }
        } catch (err) {
            console.warn('[RegistrarVentaRapida] Could not load RevenueConfig, defaulting to 0% IVA:', err.message);
        }

        const subtotalCalculado = validatedItems.reduce((sum, i) => sum + i.subtotal, 0);
        const descuentoAplicado = Math.min(descuento, subtotalCalculado); // Can't discount more than subtotal
        const baseImponible = subtotalCalculado - descuentoAplicado;
        const ivaCalculado = Math.round(baseImponible * (tasaIva / 100));
        const totalCalculado = baseImponible + ivaCalculado;

        // 1. Create Venta entity and save
        const venta = new Venta({
            barberiaId,
            barberoId,
            items: validatedItems,
            subtotal: subtotalCalculado,
            descuento: descuentoAplicado,
            iva: ivaCalculado,
            total: totalCalculado,
            metodoPago
        });

        const savedVenta = await this.ventaRepository.save(venta);

        // 2. Handle Stock Reduction for Products
        for (const item of validatedItems) {
            if (item.type === 'producto') {
                try {
                    await this.inventarioRepository.registrarMovimientoStock({
                        barberiaId,
                        productoId: item.itemId,
                        tipo: 'SALIDA',
                        cantidad: item.cantidad || 1,
                        motivo: 'VENTA_POS',
                        referenciaId: savedVenta.id
                    });
                } catch (error) {
                    console.error(`Error reduciendo stock para ${item.nombre}:`, error.message);
                    // Continue with other items even if stock reduction fails
                }
            }
        }

        // 3. Register Income in Caja for Cash Transactions
        if (metodoPago === 'EFECTIVO') {
            const openCaja = await this.cajaRepository.findOpenByBarberia(barberiaId);
            if (openCaja) {
                openCaja.addIngreso({
                    monto: totalCalculado,
                    concepto: `Venta POS #${savedVenta.id.slice(-6)}`,
                    tipo: 'VENTA'
                });
                await this.cajaRepository.save(openCaja);
            }
        }

        // 4. Generate Transactions for Barbero Commissions (Services only)
        if (barberoId) {
            const barbero = await this.barberoRepository.findById(barberoId, barberiaId);
            if (barbero) {
                for (const item of validatedItems) {
                    if (item.type === 'servicio') {
                        // Service was already validated above, use stored data
                        const montoTotal = item.subtotal;
                        const comisionPorcentaje = barbero.comision || 0;
                        const montoBarbero = (montoTotal * comisionPorcentaje) / 100;
                        const montoBarberia = montoTotal - montoBarbero;

                        await this.transactionRepository.save({
                            barberiaId,
                            barberoId,
                            servicioId: item.itemId,
                            reservaId: null, // No reservation for POS
                            montosAutomaticos: {
                                montoTotal,
                                montoBarbero,
                                montoBarberia,
                                metodoCalculo: 'porcentaje',
                                porcentajeAplicado: {
                                    barbero: comisionPorcentaje,
                                    barberia: 100 - comisionPorcentaje,
                                    origen: 'barbero'
                                }
                            },
                            montosFinales: {
                                montoTotal,
                                montoBarbero,
                                montoBarberia
                            },
                            estado: 'pendiente',
                            metodoPago: metodoPago.toLowerCase(),
                            fecha: new Date(),
                            notas: `Venta POS #${savedVenta.id.slice(-6)} - ${item.nombre}`
                        });
                    }
                }
            }
        }

        return savedVenta;
    }
}

module.exports = RegistrarVentaRapida;
