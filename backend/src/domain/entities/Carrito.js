/**
 * Carrito Domain Entity
 */
class Carrito {
    constructor({
        id,
        barberiaId,
        clienteId = null,
        sessionId = null,
        items = [],
        subtotal = 0,
        total = 0,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberiaId = barberiaId;
        this.clienteId = clienteId;
        this.sessionId = sessionId;
        this.items = items;
        this.subtotal = subtotal;
        this.total = total;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
        this.recalculateTotals();
    }

    validate() {
        if (!this.barberiaId) throw new Error('El ID de la barbería es requerido');
        if (!this.clienteId && !this.sessionId) {
            throw new Error('Debe haber un cliente o una sesión asociada');
        }
    }

    recalculateTotals() {
        this.subtotal = this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        // Add taxes or shipping logic if needed
        this.total = this.subtotal;
    }

    addItem(producto, cantidad) {
        const itemIndex = this.items.findIndex(i => i.productoId === producto.id);

        if (itemIndex > -1) {
            this.items[itemIndex].cantidad += cantidad;
            this.items[itemIndex].precio = producto.precioEfectivo; // Update to current price
        } else {
            this.items.push({
                productoId: producto.id,
                nombre: producto.nombre,
                precio: producto.precioEfectivo,
                cantidad: cantidad,
                imagen: producto.imagenes?.[0] || ''
            });
        }
        this.recalculateTotals();
    }

    updateItemQuantity(productoId, cantidad) {
        const itemIndex = this.items.findIndex(i => i.productoId === productoId);
        if (itemIndex > -1) {
            this.items[itemIndex].cantidad = cantidad;
            this.recalculateTotals();
        }
    }

    removeItem(productoId) {
        this.items = this.items.filter(i => i.productoId !== productoId);
        this.recalculateTotals();
    }

    clear() {
        this.items = [];
        this.recalculateTotals();
    }

    toObject() {
        return {
            id: this.id,
            barberiaId: this.barberiaId,
            clienteId: this.clienteId,
            sessionId: this.sessionId,
            items: this.items,
            subtotal: this.subtotal,
            total: this.total,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Carrito;
