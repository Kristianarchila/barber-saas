/**
 * MovimientoStock Domain Entity
 */
class MovimientoStock {
    constructor({
        id,
        productoId,
        inventarioId,
        barberiaId,
        tipo,
        cantidad,
        cantidadAnterior,
        cantidadNueva,
        motivo,
        proveedorId = null,
        pedidoId = null,
        usuarioId,
        observaciones = '',
        costoUnitario = null,
        costoTotal = null,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.productoId = productoId;
        this.inventarioId = inventarioId;
        this.barberiaId = barberiaId;
        this.tipo = tipo; // entry, exit, adjustment, sale, return
        this.cantidad = cantidad;
        this.cantidadAnterior = cantidadAnterior;
        this.cantidadNueva = cantidadNueva;
        this.motivo = motivo;
        this.proveedorId = proveedorId;
        this.pedidoId = pedidoId;
        this.usuarioId = usuarioId;
        this.observaciones = observaciones;
        this.costoUnitario = costoUnitario;
        this.costoTotal = costoTotal;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    validate() {
        const tiposValidos = ["entrada", "salida", "ajuste", "venta", "devolucion"];
        if (!tiposValidos.includes(this.tipo)) throw new Error('Tipo de movimiento inválido');
        if (this.cantidad < 0) throw new Error('La cantidad no puede ser negativa');
        if (!this.usuarioId) throw new Error('El ID del usuario es requerido');
    }

    toObject() {
        return {
            id: this.id,
            productoId: this.productoId,
            inventarioId: this.inventarioId,
            barberiaId: this.barberiaId,
            tipo: this.tipo,
            cantidad: this.cantidad,
            cantidadAnterior: this.cantidadAnterior,
            cantidadNueva: this.cantidadNueva,
            motivo: this.motivo,
            proveedorId: this.proveedorId,
            pedidoId: this.pedidoId,
            usuarioId: this.usuarioId,
            observaciones: this.observaciones,
            costoUnitario: this.costoUnitario,
            costoTotal: this.costoTotal,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = MovimientoStock;
