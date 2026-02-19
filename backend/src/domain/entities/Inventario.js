/**
 * Inventario Domain Entity
 */
class Inventario {
    constructor({
        id,
        productoId,
        barberiaId,
        cantidadActual = 0,
        stockMinimo = 5,
        stockMaximo = 100,
        ubicacion = '',
        unidadMedida = 'unidad',
        activo = true,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.productoId = productoId;
        this.barberiaId = barberiaId;
        this.cantidadActual = cantidadActual;
        this.stockMinimo = stockMinimo;
        this.stockMaximo = stockMaximo;
        this.ubicacion = ubicacion;
        this.unidadMedida = unidadMedida;
        this.activo = activo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    validate() {
        if (!this.productoId) throw new Error('El ID del producto es requerido');
        if (!this.barberiaId) throw new Error('El ID de la barbería es requerido');
        if (this.cantidadActual < 0) throw new Error('La cantidad no puede ser negativa');
    }

    get bajoPuntoReorden() {
        return this.cantidadActual <= this.stockMinimo;
    }

    toObject() {
        return {
            id: this.id,
            productoId: this.productoId,
            barberiaId: this.barberiaId,
            cantidadActual: this.cantidadActual,
            stockMinimo: this.stockMinimo,
            stockMaximo: this.stockMaximo,
            ubicacion: this.ubicacion,
            unidadMedida: this.unidadMedida,
            activo: this.activo,
            bajoPuntoReorden: this.bajoPuntoReorden,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Inventario;
