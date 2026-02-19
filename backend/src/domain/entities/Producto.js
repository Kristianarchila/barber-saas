/**
 * Producto Domain Entity
 * Represents a product available for sale in a barber shop
 */
class Producto {
    constructor({
        id,
        barberiaId,
        nombre,
        descripcion,
        categoria,
        precio,
        precioDescuento = null,
        stock = 0,
        imagenes = [],
        destacado = false,
        activo = true,
        especificaciones = {},
        metadata = {},
        sku,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberiaId = barberiaId;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.precio = precio;
        this.precioDescuento = precioDescuento;
        this.stock = stock;
        this.imagenes = imagenes;
        this.destacado = destacado;
        this.activo = activo;
        this.especificaciones = especificaciones || {
            marca: '',
            tamaño: '',
            ingredientes: '',
            modoUso: ''
        };
        this.metadata = metadata || {
            ventas: 0,
            valoracion: 0,
            totalReviews: 0
        };
        this.sku = sku;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    /**
     * Validate business rules for Producto
     */
    validate() {
        if (!this.nombre || this.nombre.trim().length === 0) {
            throw new Error('El nombre del producto es requerido');
        }
        if (this.precio < 0) {
            throw new Error('El precio no puede ser negativo');
        }
        if (this.stock < 0) {
            throw new Error('El stock no puede ser negativo');
        }
        if (this.precioDescuento !== null && this.precioDescuento >= this.precio) {
            throw new Error('El precio de descuento debe ser menor al precio regular');
        }
    }

    /**
     * Update stock amount
     */
    actualizarStock(cantidad) {
        const nuevoStock = this.stock + cantidad;
        if (nuevoStock < 0) {
            throw new Error('Stock insuficiente');
        }
        this.stock = nuevoStock;
        this.updatedAt = new Date();
    }

    /**
     * Check if product is available for a certain quantity
     */
    estaDisponible(cantidad = 1) {
        return this.activo && this.stock >= cantidad;
    }

    /**
     * Soft delete
     */
    desactivar() {
        this.activo = false;
        this.updatedAt = new Date();
    }

    /**
     * Update product information
     */
    update(data) {
        const fields = [
            'nombre', 'descripcion', 'categoria', 'precio', 'precioDescuento',
            'stock', 'imagenes', 'destacado', 'activo'
        ];

        fields.forEach(field => {
            if (data[field] !== undefined) {
                this[field] = data[field];
            }
        });

        if (data.especificaciones) {
            this.especificaciones = { ...this.especificaciones, ...data.especificaciones };
        }

        this.validate();
        this.updatedAt = new Date();
    }

    /**
     * Convert to plain object
     */
    toObject() {
        return {
            id: this.id,
            barberiaId: this.barberiaId,
            nombre: this.nombre,
            descripcion: this.descripcion,
            categoria: this.categoria,
            precio: this.precio,
            precioDescuento: this.precioDescuento,
            stock: this.stock,
            imagenes: this.imagenes,
            destacado: this.destacado,
            activo: this.activo,
            especificaciones: this.especificaciones,
            metadata: this.metadata,
            sku: this.sku,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Calculated value for current price
     */
    get precioEfectivo() {
        return this.precioDescuento || this.precio;
    }
}

module.exports = Producto;
