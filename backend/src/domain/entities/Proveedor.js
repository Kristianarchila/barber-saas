/**
 * Proveedor Domain Entity
 */
class Proveedor {
    constructor({
        id,
        barberiaId,
        nombre,
        contacto,
        telefono,
        email,
        direccion = '',
        sitioWeb = '',
        productos = [], // IDs of products they supply
        activo = true,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberiaId = barberiaId;
        this.nombre = nombre;
        this.contacto = contacto;
        this.telefono = telefono;
        this.email = email;
        this.direccion = direccion;
        this.sitioWeb = sitioWeb;
        this.productos = productos;
        this.activo = activo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    validate() {
        if (!this.nombre) throw new Error('El nombre del proveedor es requerido');
        if (!this.barberiaId) throw new Error('El ID de la barbería es requerido');
    }

    toObject() {
        return {
            id: this.id,
            barberiaId: this.barberiaId,
            nombre: this.nombre,
            contacto: this.contacto,
            telefono: this.telefono,
            email: this.email,
            direccion: this.direccion,
            sitioWeb: this.sitioWeb,
            productos: this.productos,
            activo: this.activo,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Proveedor;
