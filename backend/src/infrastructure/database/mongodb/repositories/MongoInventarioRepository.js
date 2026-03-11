const IInventarioRepository = require('../../../../domain/repositories/IInventarioRepository');
const InventarioModel = require('../models/Inventario');
const ProductoModel = require('../models/Producto');
const MovimientoStockModel = require('../models/MovimientoStock');
const Inventario = require('../../../../domain/entities/Inventario');

/**
 * MongoDB Implementation of IInventarioRepository
 */
class MongoInventarioRepository extends IInventarioRepository {
    async findByBarberiaId(barberiaId, filtros = {}) {
        const query = { barberia: barberiaId };
        if (filtros.activo !== undefined) query.activo = filtros.activo;

        const results = await InventarioModel.find(query)
            .populate("producto", "nombre descripcion precio imagenes categoria")
            .sort({ "producto.nombre": 1 });

        return results.map(r => this.toDomain(r));
    }

    async findById(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const item = await InventarioModel.findOne(query).populate("producto");
        if (!item) {
            throw new Error('Inventario no encontrado o sin permisos de acceso');
        }
        return this.toDomain(item);
    }

    async findByProductoId(productoId, barberiaId) {
        const item = await InventarioModel.findOne({
            producto: productoId,
            barberia: barberiaId
        }).populate("producto");
        return item ? this.toDomain(item) : null;
    }

    async save(inventario) {
        const data = {
            producto: inventario.productoId,
            barberia: inventario.barberiaId,
            cantidadActual: inventario.cantidadActual,
            stockMinimo: inventario.stockMinimo,
            stockMaximo: inventario.stockMaximo,
            ubicacion: inventario.ubicacion,
            unidadMedida: inventario.unidadMedida,
            activo: inventario.activo
        };
        const saved = await InventarioModel.create(data);
        return this.toDomain(saved);
    }

    async update(id, data, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const updated = await InventarioModel.findOneAndUpdate(query, data, { new: true });
        if (!updated) {
            throw new Error('Inventario no encontrado o sin permisos de acceso');
        }
        return this.toDomain(updated);
    }

    async delete(id, barberiaId = null) {
        const query = { _id: id };
        if (barberiaId) query.barberia = barberiaId;

        const deleted = await InventarioModel.findOneAndDelete(query);
        if (!deleted) {
            throw new Error('Inventario no encontrado o sin permisos de acceso');
        }
    }

    async registrarMovimientoStock({ barberiaId, productoId, tipo, cantidad, motivo, referenciaId, usuarioId }) {
        const session = await InventarioModel.startSession();
        session.startTransaction();

        try {
            // 1. Buscar el inventario
            let inventarioDoc = await InventarioModel.findOne({ 
                producto: productoId, 
                barberia: barberiaId 
            }).session(session);

            // Si no existe, crear uno inicial (opcional, dependiendo de si queremos que sea automático)
            if (!inventarioDoc) {
                inventarioDoc = new InventarioModel({
                    producto: productoId,
                    barberia: barberiaId,
                    cantidadActual: 0
                });
            }

            const cantidadAnterior = inventarioDoc.cantidadActual;
            let cantidadNueva;

            // 2. Calcular nueva cantidad
            const tipoLower = tipo.toLowerCase();
            if (tipoLower === 'entrada' || tipoLower === 'devolucion') {
                cantidadNueva = cantidadAnterior + cantidad;
            } else if (tipoLower === 'salida' || tipoLower === 'venta') {
                cantidadNueva = cantidadAnterior - cantidad;
            } else if (tipoLower === 'ajuste') {
                cantidadNueva = cantidad; // Ajuste directo (SET)
            } else {
                cantidadNueva = cantidadAnterior + cantidad; 
            }

            if (cantidadNueva < 0) {
                throw new Error('Stock insuficiente en inventario');
            }

            // 3. Actualizar Inventario
            inventarioDoc.cantidadActual = cantidadNueva;
            await inventarioDoc.save({ session });

            // 4. Sincronizar Modelo Producto (Marketplace)
            await ProductoModel.findByIdAndUpdate(
                productoId, 
                { stock: cantidadNueva },
                { session }
            );

            // 5. Registrar Movimiento de Stock
            await MovimientoStockModel.create([{
                producto: productoId,
                inventario: inventarioDoc._id,
                barberia: barberiaId,
                tipo: tipoLower,
                cantidad: Math.abs(cantidad),
                cantidadAnterior,
                cantidadNueva,
                motivo,
                pedido: referenciaId && tipoLower === 'venta' ? referenciaId : null,
                usuario: usuarioId || null,
                observaciones: `Sincronización automática de stock (${motivo})`
            }], { session });

            await session.commitTransaction();
            return this.toDomain(inventarioDoc);

        } catch (error) {
            await session.abortTransaction();
            console.error('❌ [MongoInventarioRepository] Error en registrarMovimientoStock:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Convert MongoDB document to Domain Entity
     */
    toDomain(mongoDoc) {
        if (!mongoDoc) return null;

        const doc = mongoDoc.toObject ? mongoDoc.toObject() : mongoDoc;

        const inventario = new Inventario({
            id: doc._id.toString(),
            productoId: doc.producto?._id?.toString() || doc.producto?.toString(),
            barberiaId: doc.barberia?._id?.toString() || doc.barberia?.toString(),
            cantidadActual: doc.cantidadActual,
            stockMinimo: doc.stockMinimo,
            stockMaximo: doc.stockMaximo,
            ubicacion: doc.ubicacion,
            unidadMedida: doc.unidadMedida,
            activo: doc.activo,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });

        if (doc.producto && doc.producto.nombre) {
            inventario.producto = doc.producto;
        }

        return inventario;
    }
}

module.exports = MongoInventarioRepository;
