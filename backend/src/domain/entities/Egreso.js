/**
 * Egreso Domain Entity
 */
class Egreso {
    constructor({
        id,
        barberiaId,
        descripcion,
        montoTotal,
        iva = 0,
        montoNeto,
        categoria,
        fecha,
        metodoPago,
        registradoPor,
        proveedor = '',
        nroComprobante = '',
        adjuntoUrl = '',
        activo = true,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberiaId = barberiaId;
        this.descripcion = descripcion;
        this.montoTotal = montoTotal;
        this.iva = iva;
        this.montoNeto = montoNeto || (montoTotal - iva);
        this.categoria = categoria;
        this.fecha = fecha;
        this.metodoPago = metodoPago;
        this.registradoPor = registradoPor;
        this.proveedor = proveedor;
        this.nroComprobante = nroComprobante;
        this.adjuntoUrl = adjuntoUrl;
        this.activo = activo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    validate() {
        if (!this.barberiaId) throw new Error('El ID de la barbería es requerido');
        if (!this.descripcion) throw new Error('La descripción es requerida');
        if (this.montoTotal <= 0) throw new Error('El monto debe ser mayor a cero');
        if (!this.categoria) throw new Error('La categoría es requerida');
        if (!this.fecha) throw new Error('La fecha es requerida');
    }

    toObject() {
        return {
            id: this.id,
            barberiaId: this.barberiaId,
            descripcion: this.descripcion,
            montoTotal: this.montoTotal,
            iva: this.iva,
            montoNeto: this.montoNeto,
            categoria: this.categoria,
            fecha: this.fecha,
            metodoPago: this.metodoPago,
            registradoPor: this.registradoPor,
            proveedor: this.proveedor,
            nroComprobante: this.nroComprobante,
            adjuntoUrl: this.adjuntoUrl,
            activo: this.activo,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Egreso;
