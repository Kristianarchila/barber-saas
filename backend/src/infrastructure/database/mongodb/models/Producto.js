const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    barberiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barberia',
        required: true,
        index: true
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es requerido'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es requerida'],
        maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
    },
    categoria: {
        type: String,
        required: true,
        enum: ['pomada', 'cera', 'aceite', 'shampoo', 'acondicionador', 'gel', 'spray', 'cuidado_barba', 'herramientas', 'otros'],
        index: true
    },
    precio: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    precioDescuento: {
        type: Number,
        min: [0, 'El precio de descuento no puede ser negativo'],
        validate: {
            validator: function (value) {
                return !value || value < this.precio;
            },
            message: 'El precio de descuento debe ser menor al precio regular'
        }
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'El stock no puede ser negativo'],
        default: 0
    },
    imagenes: [{
        type: String,
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+/.test(v) || /^data:image\/.+/.test(v);
            },
            message: 'La URL de la imagen no es válida (debe ser URL o Base64)'
        }
    }],
    destacado: {
        type: Boolean,
        default: false,
        index: true
    },
    activo: {
        type: Boolean,
        default: true,
        index: true
    },
    especificaciones: {
        marca: {
            type: String,
            trim: true
        },
        tamaño: {
            type: String,
            trim: true
        },
        ingredientes: {
            type: String,
            maxlength: [500, 'Los ingredientes no pueden exceder 500 caracteres']
        },
        modoUso: {
            type: String,
            maxlength: [500, 'El modo de uso no puede exceder 500 caracteres']
        }
    },
    metadata: {
        ventas: {
            type: Number,
            default: 0,
            min: 0
        },
        valoracion: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    sku: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices compuestos para búsquedas eficientes
productoSchema.index({ barberiaId: 1, activo: 1, categoria: 1 });
productoSchema.index({ barberiaId: 1, destacado: 1, activo: 1 });
productoSchema.index({ nombre: 'text', descripcion: 'text' });

// Virtual para precio efectivo (con descuento si aplica)
productoSchema.virtual('precioEfectivo').get(function () {
    return this.precioDescuento || this.precio;
});

// Virtual para porcentaje de descuento
productoSchema.virtual('porcentajeDescuento').get(function () {
    if (!this.precioDescuento) return 0;
    return Math.round(((this.precio - this.precioDescuento) / this.precio) * 100);
});

// Virtual para verificar si hay stock
productoSchema.virtual('disponible').get(function () {
    return this.activo && this.stock > 0;
});

// Middleware pre-save para generar SKU automático si no existe
productoSchema.pre('save', function (next) {
    if (!this.sku) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        this.sku = `PROD-${timestamp}-${random}`.toUpperCase();
    }
    next();
});

// Método para actualizar stock
productoSchema.methods.actualizarStock = async function (cantidad) {
    this.stock += cantidad;
    if (this.stock < 0) {
        throw new Error('Stock insuficiente');
    }
    return this.save();
};

// Método para verificar disponibilidad
productoSchema.methods.verificarDisponibilidad = function (cantidad) {
    return this.activo && this.stock >= cantidad;
};

// Método estático para buscar productos
productoSchema.statics.buscarProductos = function (barberiaId, filtros = {}) {
    const query = { barberiaId, activo: true };

    if (filtros.categoria) {
        query.categoria = filtros.categoria;
    }

    if (filtros.destacado) {
        query.destacado = true;
    }

    if (filtros.busqueda) {
        query.$text = { $search: filtros.busqueda };
    }

    return this.find(query)
        .sort(filtros.ordenar || '-createdAt')
        .limit(filtros.limite || 20)
        .skip(filtros.saltar || 0);
};

module.exports = mongoose.models.Producto || mongoose.model('Producto', productoSchema);
