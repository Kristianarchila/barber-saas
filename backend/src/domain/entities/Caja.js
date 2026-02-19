/**
 * Caja Domain Entity
 */
class Caja {
    constructor({
        id,
        barberiaId,
        fecha,
        turno = 'COMPLETO',
        responsable,
        horaApertura,
        horaCierre = null,
        montoInicial = 0,
        montoEsperado = 0,
        montoReal = 0,
        diferencia = 0,
        ingresos = [],
        egresos = [],
        arqueo = {
            billetes: { "20000": 0, "10000": 0, "5000": 0, "2000": 0, "1000": 0 },
            monedas: { "500": 0, "100": 0, "50": 0, "10": 0 },
            totalContado: 0
        },
        observaciones = '',
        estado = 'ABIERTA',
        tieneDescuadre = false,
        nivelDescuadre = 'NINGUNO',
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.barberiaId = barberiaId;
        this.fecha = fecha;
        this.turno = turno;
        this.responsable = responsable;
        this.horaApertura = horaApertura;
        this.horaCierre = horaCierre;
        this.montoInicial = montoInicial;
        this.montoEsperado = montoEsperado;
        this.montoReal = montoReal;
        this.diferencia = diferencia;
        this.ingresos = ingresos;
        this.egresos = egresos;
        this.arqueo = arqueo;
        this.observaciones = observaciones;
        this.estado = estado;
        this.tieneDescuadre = tieneDescuadre;
        this.nivelDescuadre = nivelDescuadre;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
        this.recalculateTotals();
    }

    validate() {
        if (!this.barberiaId) throw new Error('El ID de la barbería es requerido');
        if (!this.fecha) throw new Error('La fecha es requerida');
        if (!this.responsable) throw new Error('El responsable es requerido');
        if (!this.horaApertura) throw new Error('La hora de apertura es requerida');
    }

    recalculateTotals() {
        const totalIngresos = this.ingresos.reduce((sum, i) => sum + i.monto, 0);
        const totalEgresos = this.egresos.reduce((sum, e) => sum + e.monto, 0);
        this.montoEsperado = this.montoInicial + totalIngresos - totalEgresos;

        if (this.estado === 'CERRADA' && this.montoReal !== undefined) {
            this.diferencia = this.montoReal - this.montoEsperado;
            const diffAbs = Math.abs(this.diferencia);
            if (diffAbs === 0) {
                this.tieneDescuadre = false;
                this.nivelDescuadre = 'NINGUNO';
            } else if (diffAbs <= 1000) {
                this.tieneDescuadre = true;
                this.nivelDescuadre = 'MENOR';
            } else {
                this.tieneDescuadre = true;
                this.nivelDescuadre = 'ALTO';
            }
        }
    }

    addIngreso(ingreso) {
        this.ingresos.push({
            ...ingreso,
            hora: ingreso.hora || new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
        });
        this.recalculateTotals();
    }

    addEgreso(egreso) {
        this.egresos.push({
            ...egreso,
            hora: egreso.hora || new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
        });
        this.recalculateTotals();
    }

    cerrar(montoReal, arqueo, observaciones) {
        this.horaCierre = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        this.montoReal = montoReal;
        this.arqueo = arqueo;
        this.observaciones = observaciones;
        this.estado = 'CERRADA';
        this.recalculateTotals();
    }

    toObject() {
        return {
            id: this.id,
            barberiaId: this.barberiaId,
            fecha: this.fecha,
            turno: this.turno,
            responsable: this.responsable,
            horaApertura: this.horaApertura,
            horaCierre: this.horaCierre,
            montoInicial: this.montoInicial,
            montoEsperado: this.montoEsperado,
            montoReal: this.montoReal,
            diferencia: this.diferencia,
            ingresos: this.ingresos,
            egresos: this.egresos,
            arqueo: this.arqueo,
            observaciones: this.observaciones,
            estado: this.estado,
            tieneDescuadre: this.tieneDescuadre,
            nivelDescuadre: this.nivelDescuadre,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Caja;
