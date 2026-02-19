const mongoose = require('mongoose');

const carritoSchema = new mongoose.Schema({
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
    sessionId: {
        type: String,
        index: true
    },
    items: [{
        productoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: [1, 'La cantidad mínima es 1'],
            max: [99, 'La cantidad máxima es 99']
        },
        precioUnitario: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    expiraEn: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
        // TTL index defined in schema.index below
    }
}, {
    timestamps: true
});

// Índice compuesto para búsqueda eficiente
carritoSchema.index({ barberiaId: 1, clienteId: 1 });
carritoSchema.index({ barberiaId: 1, sessionId: 1 });
carritoSchema.index({ expiraEn: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual para calcular total
carritoSchema.virtual('total').get(function () {
    return this.items.reduce((sum, item) => {
        return sum + (item.precioUnitario * item.cantidad);
    }, 0);
});

// Virtual para contar items
carritoSchema.virtual('totalItems').get(function () {
    return this.items.reduce((sum, item) => sum + item.cantidad, 0);
});

// Método para agregar producto
carritoSchema.methods.agregarProducto = async function (productoId, cantidad, precioUnitario) {
    const itemExistente = this.items.find(item =>
        item.productoId.toString() === productoId.toString()
    );

    if (itemExistente) {
        itemExistente.cantidad += cantidad;
        if (itemExistente.cantidad > 99) {
            throw new Error('Cantidad máxima excedida');
        }
    } else {
        this.items.push({
            productoId,
            cantidad,
            precioUnitario
        });
    }

    // Extender expiración
    this.expiraEn = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.save();
};

// Método para actualizar cantidad
carritoSchema.methods.actualizarCantidad = async function (productoId, nuevaCantidad) {
    const item = this.items.find(item =>
        item.productoId.toString() === productoId.toString()
    );

    if (!item) {
        throw new Error('Producto no encontrado en el carrito');
    }

    if (nuevaCantidad < 1) {
        throw new Error('La cantidad mínima es 1');
    }

    if (nuevaCantidad > 99) {
        throw new Error('La cantidad máxima es 99');
    }

    item.cantidad = nuevaCantidad;

    return this.save();
};

// Método para remover producto
carritoSchema.methods.removerProducto = async function (productoId) {
    this.items = this.items.filter(item =>
        item.productoId.toString() !== productoId.toString()
    );

    return this.save();
};

// Método para vaciar carrito
carritoSchema.methods.vaciar = async function () {
    this.items = [];
    return this.save();
};

// Método estático para obtener o crear carrito
carritoSchema.statics.obtenerOCrear = async function (barberiaId, clienteId, sessionId) {
    const query = { barberiaId };

    if (clienteId) {
        query.clienteId = clienteId;
    } else if (sessionId) {
        query.sessionId = sessionId;
    } else {
        throw new Error('Se requiere clienteId o sessionId');
    }

    let carrito = await this.findOne(query);

    if (!carrito) {
        carrito = await this.create({
            barberiaId,
            clienteId,
            sessionId,
            items: []
        });
    }

    return carrito;
};

// Método para migrar carrito de sesión a usuario
carritoSchema.statics.migrarCarrito = async function (sessionId, clienteId, barberiaId) {
    const carritoSesion = await this.findOne({ sessionId, barberiaId });

    if (!carritoSesion || carritoSesion.items.length === 0) {
        return null;
    }

    const carritoUsuario = await this.obtenerOCrear(barberiaId, clienteId, null);

    // Combinar items
    for (const item of carritoSesion.items) {
        await carritoUsuario.agregarProducto(
            item.productoId,
            item.cantidad,
            item.precioUnitario
        );
    }

    // Eliminar carrito de sesión
    await carritoSesion.remove();

    return carritoUsuario;
};

module.exports = mongoose.models.Carrito || mongoose.model('Carrito', carritoSchema);
