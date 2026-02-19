/**
 * Pago Domain Entity
 */
class Pago {
    /**
     * @param {Object} params
     * @param {number|null} params.iva - Pre-calculated IVA amount. Use null/undefined to auto-calculate from tasaIva.
     * @param {number}      params.tasaIva - IVA rate (e.g. 19 for 19%). Comes from RevenueConfig. Defaults to 0 (no tax).
     */
    constructor({
        id,
        barberiaId,
        reservaId,
        barberoId,
        fecha,
        montoTotal,
        detallesPago = [], // { metodoPago, monto, comision, montoNeto }
        registradoPor,
        iva,
        tasaIva = 0,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberiaId = barberiaId;
        this.reservaId = reservaId;
        this.barberoId = barberoId;
        this.fecha = fecha;
        this.montoTotal = montoTotal;
        this.detallesPago = detallesPago;
        this.registradoPor = registradoPor;
        this.tasaIva = tasaIva;
        // ?? respects iva=0 explicitly passed. If iva is null/undefined, calculate from tasaIva.
        this.iva = iva ?? Math.round(montoTotal * (tasaIva / 100));

        this.validate();
    }

    validate() {
        if (!this.barberiaId) throw new Error('El ID de la barbería es requerido');
        if (!this.reservaId) throw new Error('El ID de la reserva es requerido');
        if (!this.barberoId) throw new Error('El ID del barbero es requerido');
        if (this.montoTotal <= 0) throw new Error('El monto total debe ser mayor a cero');

        const totalDetalles = this.detallesPago.reduce((sum, p) => sum + p.monto, 0);
        if (Math.abs(totalDetalles - this.montoTotal) > 1) { // Allowance for rounding
            throw new Error('El total de los detalles no coincide con el monto total');
        }
    }

    get totalEfectivo() {
        return this.detallesPago
            .filter(d => d.metodoPago === 'EFECTIVO')
            .reduce((sum, d) => sum + d.monto, 0);
    }

    get totalTarjeta() {
        return this.detallesPago
            .filter(d => ['DEBITO', 'CREDITO', 'TARJETA'].includes(d.metodoPago))
            .reduce((sum, d) => sum + d.monto, 0);
    }

    get totalTransferencia() {
        return this.detallesPago
            .filter(d => d.metodoPago === 'TRANSFERENCIA')
            .reduce((sum, d) => sum + d.monto, 0);
    }

    get comisionTotal() {
        return this.detallesPago.reduce((sum, d) => sum + (d.comision || 0), 0);
    }

    get ingresoNeto() {
        return this.montoTotal - this.comisionTotal;
    }

    /**
     * Helper to calculate commission
     */
    static calcularComision(metodo, monto) {
        if (metodo === 'CREDITO') return Math.round(monto * 0.03); // 3%
        if (metodo === 'DEBITO') return Math.round(monto * 0.015); // 1.5%
        if (metodo === 'TARJETA') return Math.round(monto * 0.025); // Generic 2.5%
        return 0;
    }

    toObject() {
        return {
            id: this.id,
            barberiaId: this.barberiaId,
            reservaId: this.reservaId,
            barberoId: this.barberoId,
            fecha: this.fecha,
            montoTotal: this.montoTotal,
            detallesPago: this.detallesPago,
            registradoPor: this.registradoPor,
            iva: this.iva,
            tasaIva: this.tasaIva,
            totalEfectivo: this.totalEfectivo,
            totalTarjeta: this.totalTarjeta,
            totalTransferencia: this.totalTransferencia,
            comisionTotal: this.comisionTotal,
            ingresoNeto: this.ingresoNeto,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Pago;
