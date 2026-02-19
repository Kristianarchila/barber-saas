const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barberia',
        required: true,
        index: true
    },
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    numeroPedido: {
        type: String,
        required: true
        // unique index defined in schema.index below
    },
    items: [{
        productoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        precio: {
            type: Number,
            required: true,
            min: 0
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        imagenUrl: String
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    descuento: {
        type: Number,
        default: 0,
        min: 0
    },
    impuestos: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'confirmado', 'preparando', 'listo', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente',
        index: true
    },
    metodoPago: {
        type: String,
        required: true,
        enum: ['efectivo', 'tarjeta', 'transferencia', 'stripe']
    },
    estadoPago: {
        type: String,
        required: true,
        enum: ['pendiente', 'pagado', 'reembolsado', 'fallido'],
        default: 'pendiente',
        index: true
    },
    datosEntrega: {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        telefono: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        direccion: String,
        ciudad: String,
        codigoPostal: String,
        notas: String
    },
    tipoEntrega: {
        type: String,
        required: true,
        enum: ['recoger_tienda', 'envio_domicilio'],
        default: 'recoger_tienda'
    },
    tracking: {
        fechaPedido: {
            type: Date,
            default: Date.now
        },
        fechaConfirmacion: Date,
        fechaPreparacion: Date,
        fechaEnvio: Date,
        fechaEntrega: Date,
        fechaCancelacion: Date
    },
    notas: String,
    notasInternas: String,
    stripePaymentIntentId: String,
    cuponAplicado: {
        codigo: String,
        descuento: Number
    }
}, {
    timestamps: true
});

// Índices compuestos
pedidoSchema.index({ barberiaId: 1, estado: 1, createdAt: -1 });
pedidoSchema.index({ clienteId: 1, createdAt: -1 });
pedidoSchema.index({ numeroPedido: 1 }, { unique: true }); // Unique order number

// Generar número de pedido automáticamente
pedidoSchema.pre('save', async function (next) {
    if (!this.numeroPedido) {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');

        // Contar pedidos del mes actual
        const count = await this.constructor.countDocuments({
            barberiaId: this.barberiaId,
            createdAt: {
                $gte: new Date(año, fecha.getMonth(), 1),
                $lt: new Date(año, fecha.getMonth() + 1, 1)
            }
        });

        const numero = String(count + 1).padStart(4, '0');
        this.numeroPedido = `ORD-${año}${mes}-${numero}`;
    }
    next();
});

// Método para cambiar estado
pedidoSchema.methods.cambiarEstado = async function (nuevoEstado) {
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

    // Actualizar tracking
    const ahora = new Date();
    switch (nuevoEstado) {
        case 'confirmado':
            this.tracking.fechaConfirmacion = ahora;
            break;
        case 'preparando':
            this.tracking.fechaPreparacion = ahora;
            break;
        case 'enviado':
            this.tracking.fechaEnvio = ahora;
            break;
        case 'entregado':
            this.tracking.fechaEntrega = ahora;
            break;
        case 'cancelado':
            this.tracking.fechaCancelacion = ahora;
            break;
    }

    return this.save();
};

// Método para calcular totales
pedidoSchema.methods.calcularTotales = function () {
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.total = this.subtotal - this.descuento + this.impuestos;
    return this;
};

// Método estático para obtener estadísticas
pedidoSchema.statics.obtenerEstadisticas = async function (barberiaId, fechaInicio, fechaFin) {
    return this.aggregate([
        {
            $match: {
                barberiaId: mongoose.Types.ObjectId(barberiaId),
                createdAt: {
                    $gte: new Date(fechaInicio),
                    $lte: new Date(fechaFin)
                },
                estado: { $ne: 'cancelado' }
            }
        },
        {
            $group: {
                _id: null,
                totalPedidos: { $sum: 1 },
                totalIngresos: { $sum: '$total' },
                promedioTicket: { $avg: '$total' },
                productosVendidos: { $sum: { $size: '$items' } }
            }
        }
    ]);
};

module.exports = mongoose.models.Pedido || mongoose.model('Pedido', pedidoSchema);
