/**
 * Transaction Domain Entity
 */
class Transaction {
    constructor({
        id,
        barberiaId,
        barberoId,
        reservaId,
        servicioId,
        montosAutomaticos,
        montosFinales,
        historialAjustes = [],
        extras = { propina: 0, bonus: 0, descuento: 0, distribucionPropina: 'barbero' },
        impuestos = { iva: 0, retencion: 0, montoIVA: 0, montoRetencion: 0 },
        estado = 'pendiente',
        metodoPago = 'efectivo',
        notas = '',
        aprobaciones = { barberoAprobo: false, adminAprobo: false },
        fecha = new Date(),
        creadoPor,
        fechaPago,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberiaId = barberiaId;
        this.barberoId = barberoId;
        this.reservaId = reservaId;
        this.servicioId = servicioId;
        this.montosAutomaticos = montosAutomaticos;
        this.montosFinales = montosFinales || montosAutomaticos;
        this.historialAjustes = historialAjustes;
        this.extras = extras;
        this.impuestos = impuestos;
        this.estado = estado;
        this.metodoPago = metodoPago;
        this.notas = notas;
        this.aprobaciones = aprobaciones;
        this.fecha = fecha;
        this.creadoPor = creadoPor;
        this.fechaPago = fechaPago;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    validate() {
        if (!this.barberiaId) throw new Error('El ID de la barbería es requerido');
        if (!this.barberoId) throw new Error('El ID del barbero es requerido');
        if (!this.reservaId) throw new Error('El ID de la reserva es requerido');
        if (!this.montosAutomaticos) throw new Error('Los montos automáticos son requeridos');
    }

    ajustar(data, adminId) {
        const anteriorBarbero = this.montosFinales.montoBarbero;
        const anteriorBarberia = this.montosFinales.montoBarberia;

        this.montosFinales = {
            ...this.montosFinales,
            montoBarbero: data.montoBarbero ?? this.montosFinales.montoBarbero,
            montoBarberia: data.montoBarberia ?? this.montosFinales.montoBarberia,
            fueAjustado: true,
            ajustadoPor: adminId,
            fechaAjuste: new Date(),
            razonAjuste: data.razon
        };

        this.historialAjustes.push({
            montoBarberoAnterior: anteriorBarbero,
            montoBarberoNuevo: this.montosFinales.montoBarbero,
            montoBarberiaAnterior: anteriorBarberia,
            montoBarberiaNuevo: this.montosFinales.montoBarberia,
            razon: data.razon,
            ajustadoPor: adminId,
            fecha: new Date()
        });

        if (data.extras) {
            this.extras = { ...this.extras, ...data.extras };
        }
    }

    marcarPagado(adminId, data = {}) {
        this.estado = 'pagado';
        this.fechaPago = new Date();
        if (data.metodoPago) this.metodoPago = data.metodoPago;
        if (data.notas) this.notas = data.notas;
        this.aprobaciones.adminAprobo = true;
        this.aprobaciones.fechaAprobacionAdmin = new Date();
    }

    toObject() {
        return {
            id: this.id,
            barberiaId: this.barberiaId,
            barberoId: this.barberoId,
            reservaId: this.reservaId,
            servicioId: this.servicioId,
            montosAutomaticos: this.montosAutomaticos,
            montosFinales: this.montosFinales,
            historialAjustes: this.historialAjustes,
            extras: this.extras,
            impuestos: this.impuestos,
            estado: this.estado,
            metodoPago: this.metodoPago,
            notas: this.notas,
            aprobaciones: this.aprobaciones,
            fecha: this.fecha,
            creadoPor: this.creadoPor,
            fechaPago: this.fechaPago,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Transaction;
