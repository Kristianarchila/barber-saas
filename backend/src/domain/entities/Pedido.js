/**
 * Pedido Domain Entity
 * Represents a customer order for products
 */
class Pedido {
    constructor({
        id,
        barberiaId,
        clienteId = null,
        numeroPedido,
        items = [],
        subtotal = 0,
        descuento = 0,
        impuestos = 0,
        total = 0,
        estado = 'pendiente',
        metodoPago,
        estadoPago = 'pendiente',
        datosEntrega = {},
        tipoEntrega = 'recoger_tienda',
        tracking = {},
        notas = '',
        notasInternas = '',
        stripePaymentIntentId = null,
        cuponAplicado = null,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberiaId = barberiaId;
        this.clienteId = clienteId;
        this.numeroPedido = numeroPedido;
        this.items = items;
        this.subtotal = subtotal;
        this.descuento = descuento;
        this.impuestos = impuestos;
        this.total = total;
        this.estado = estado;
        this.metodoPago = metodoPago;
        this.estadoPago = estadoPago;
        this.datosEntrega = datosEntrega;
        this.tipoEntrega = tipoEntrega;
        this.tracking = tracking || {
            fechaPedido: new Date(),
            fechaConfirmacion: null,
            fechaPreparacion: null,
            fechaEnvio: null,
            fechaEntrega: null,
            fechaCancelacion: null
        };
        this.notas = notas;
        this.notasInternas = notasInternas;
        this.stripePaymentIntentId = stripePaymentIntentId;
        this.cuponAplicado = cuponAplicado;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    /**
     * Validate business rules for Pedido
     */
    validate() {
        if (!this.barberiaId) throw new Error('El ID de la barbería es requerido');
        if (this.items.length === 0) throw new Error('El pedido debe tener al menos un item');
        if (this.total < 0) throw new Error('El total no puede ser negativo');
    }

    /**
     * Transition to a new state with validation
     */
    cambiarEstado(nuevoEstado) {
        const estadosValidos = {
            'pendiente': ['confirmado', 'cancelado'],
            'confirmado': ['preparando', 'cancelado'],
            'preparando': ['listo', 'enviado', 'cancelado'],
            'listo': ['entregado', 'cancelado'],
            'enviado': ['entregado', 'cancelado'],
            'entregado': [],
            'cancelado': []
        };

        if (!estadosValidos[this.estado].includes(nuevoEstado)) {
            throw new Error(`No se puede cambiar de ${this.estado} a ${nuevoEstado}`);
        }

        this.estado = nuevoEstado;
        const ahora = new Date();

        switch (nuevoEstado) {
            case 'confirmado': this.tracking.fechaConfirmacion = ahora; break;
            case 'preparando': this.tracking.fechaPreparacion = ahora; break;
            case 'listo': break; // No explicit date in schema for 'listo'
            case 'enviado': this.tracking.fechaEnvio = ahora; break;
            case 'entregado': this.tracking.fechaEntrega = ahora; break;
            case 'cancelado': this.tracking.fechaCancelacion = ahora; break;
        }

        this.updatedAt = ahora;
    }

    /**
     * Calculate totals
     */
    calcularTotales() {
        this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
        this.total = this.subtotal - this.descuento + this.impuestos;
        return this;
    }

    /**
     * Convert to plain object
     */
    toObject() {
        return {
            id: this.id,
            barberiaId: this.barberiaId,
            clienteId: this.clienteId,
            numeroPedido: this.numeroPedido,
            items: this.items,
            subtotal: this.subtotal,
            descuento: this.descuento,
            impuestos: this.impuestos,
            total: this.total,
            estado: this.estado,
            metodoPago: this.metodoPago,
            estadoPago: this.estadoPago,
            datosEntrega: this.datosEntrega,
            tipoEntrega: this.tipoEntrega,
            tracking: this.tracking,
            notas: this.notas,
            notasInternas: this.notasInternas,
            stripePaymentIntentId: this.stripePaymentIntentId,
            cuponAplicado: this.cuponAplicado,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Pedido;
