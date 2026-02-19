const mongoose = require('mongoose');

const productoReviewSchema = new mongoose.Schema({
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true,
        index: true
    },
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    pedidoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pedido',
        required: true
    },
    valoracion: {
        type: Number,
        required: [true, 'La valoración es requerida'],
        min: [1, 'La valoración mínima es 1'],
        max: [5, 'La valoración máxima es 5']
    },
    comentario: {
        type: String,
        required: [true, 'El comentario es requerido'],
        trim: true,
        minlength: [10, 'El comentario debe tener al menos 10 caracteres'],
        maxlength: [500, 'El comentario no puede exceder 500 caracteres']
    },
    imagenes: [{
        type: String,
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'La URL de la imagen no es válida'
        }
    }],
    respuestaAdmin: {
        texto: String,
        fecha: Date,
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    verificado: {
        type: Boolean,
        default: false
    },
    util: {
        positivos: {
            type: Number,
            default: 0
        },
        negativos: {
            type: Number,
            default: 0
        }
    },
    reportado: {
        type: Boolean,
        default: false
    },
    aprobado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices compuestos
productoReviewSchema.index({ productoId: 1, createdAt: -1 });
productoReviewSchema.index({ clienteId: 1, productoId: 1 }, { unique: true }); // Un review por cliente por producto
productoReviewSchema.index({ aprobado: 1, productoId: 1 });

// Middleware para actualizar estadísticas del producto
productoReviewSchema.post('save', async function () {
    const Producto = mongoose.model('Producto');

    const stats = await this.constructor.aggregate([
        {
            $match: {
                productoId: this.productoId,
                aprobado: true
            }
        },
        {
            $group: {
                _id: '$productoId',
                valoracionPromedio: { $avg: '$valoracion' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Producto.findByIdAndUpdate(this.productoId, {
            'metadata.valoracion': Math.round(stats[0].valoracionPromedio * 10) / 10,
            'metadata.totalReviews': stats[0].totalReviews
        });
    }
});

// Middleware para actualizar estadísticas al eliminar
productoReviewSchema.post('remove', async function () {
    const Producto = mongoose.model('Producto');

    const stats = await this.constructor.aggregate([
        {
            $match: {
                productoId: this.productoId,
                aprobado: true
            }
        },
        {
            $group: {
                _id: '$productoId',
                valoracionPromedio: { $avg: '$valoracion' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Producto.findByIdAndUpdate(this.productoId, {
            'metadata.valoracion': Math.round(stats[0].valoracionPromedio * 10) / 10,
            'metadata.totalReviews': stats[0].totalReviews
        });
    } else {
        await Producto.findByIdAndUpdate(this.productoId, {
            'metadata.valoracion': 0,
            'metadata.totalReviews': 0
        });
    }
});

// Método para marcar como útil
productoReviewSchema.methods.marcarUtil = async function (esUtil) {
    if (esUtil) {
        this.util.positivos += 1;
    } else {
        this.util.negativos += 1;
    }
    return this.save();
};

// Método para responder (admin)
productoReviewSchema.methods.responder = async function (texto, adminId) {
    this.respuestaAdmin = {
        texto,
        fecha: new Date(),
        adminId
    };
    return this.save();
};

// Método estático para verificar si el cliente puede dejar review
productoReviewSchema.statics.puedeDejarReview = async function (clienteId, productoId) {
    const Pedido = mongoose.model('Pedido');

    // Verificar si el cliente compró el producto
    const pedido = await Pedido.findOne({
        clienteId,
        'items.productoId': productoId,
        estado: 'entregado'
    });

    if (!pedido) {
        return { puede: false, razon: 'Debes comprar el producto primero' };
    }

    // Verificar si ya dejó review
    const reviewExistente = await this.findOne({ clienteId, productoId });

    if (reviewExistente) {
        return { puede: false, razon: 'Ya dejaste una reseña para este producto' };
    }

    return { puede: true, pedidoId: pedido._id };
};

module.exports = mongoose.models.ProductoReview || mongoose.model('ProductoReview', productoReviewSchema);
