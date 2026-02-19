/**
 * Venta Domain Entity
 */
class Venta {
    /**
     * @param {number|null} params.iva - Pre-calculated IVA. Null/undefined = auto-calc from tasaIva.
     * @param {number}      params.tasaIva - IVA rate (e.g. 19 for 19%). From RevenueConfig. Defaults to 0.
     */
    constructor({
        id,
        barberiaId,
        barberoId,
        items = [], // { type: 'servicio'|'producto', itemId, nombre, precio, cantidad, subtotal }
        subtotal = 0,
        descuento = 0,
        iva,
        tasaIva = 0,
        total,
        metodoPago = 'EFECTIVO',
        fecha = new Date(),
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberiaId = barberiaId;
        this.barberoId = barberoId;
        this.items = items;
        this.subtotal = subtotal;
        this.descuento = descuento;
        this.tasaIva = tasaIva;
        // ?? respects iva=0 explicitly. If null/undefined, calculate from tasaIva.
        this.iva = iva ?? Math.round((subtotal - descuento) * (tasaIva / 100));
        // ?? respects total=0 explicitly. If null/undefined, recalculate.
        this.total = total ?? ((subtotal - descuento) + this.iva);
        this.metodoPago = metodoPago;
        this.fecha = fecha;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    validate() {
        if (!this.barberiaId) throw new Error('El ID de la barbería es requerido');
        if (!this.items || this.items.length === 0) throw new Error('La venta debe tener al menos un item');
        if (this.total < 0) throw new Error('El total no puede ser negativo');
    }

    toObject() {
        return {
            id: this.id,
            barberiaId: this.barberiaId,
            barberoId: this.barberoId,
            items: this.items,
            subtotal: this.subtotal,
            descuento: this.descuento,
            iva: this.iva,
            tasaIva: this.tasaIva,
            total: this.total,
            metodoPago: this.metodoPago,
            fecha: this.fecha,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Venta;
