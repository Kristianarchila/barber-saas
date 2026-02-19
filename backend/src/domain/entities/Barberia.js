const Email = require('../value-objects/Email');

/**
 * Barberia Domain Entity
 * Represents a barber shop (SaaS tenant) with complete business logic
 */
class Barberia {
    constructor({
        id,
        nombre,
        slug,
        email,
        direccion,
        telefono,
        rut,
        plan = 'basico',
        estado = 'trial',
        activa = true,
        esMatriz = false,
        configuracion = {},
        configuracionMatriz = {},
        sucursales = [],
        fechaFinTrial,
        proximoPago,
        stripeCustomerId,
        stripeSubscriptionId,
        historial = [],
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.nombre = nombre;
        this.slug = slug;
        this.email = email instanceof Email ? email : (email ? new Email(email) : null);
        this.direccion = direccion;
        this.telefono = telefono;
        this.rut = rut;
        this.plan = plan;
        this.estado = estado;
        this.activa = activa;
        this.esMatriz = esMatriz;
        this.configuracion = configuracion;
        this.configuracionMatriz = configuracionMatriz;
        this.sucursales = sucursales;
        this.fechaFinTrial = fechaFinTrial;
        this.proximoPago = proximoPago;
        this.stripeCustomerId = stripeCustomerId;
        this.stripeSubscriptionId = stripeSubscriptionId;
        this.historial = historial;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    /**
     * Validate business rules for Barberia
     */
    validate() {
        if (!this.nombre || this.nombre.trim().length === 0) {
            throw new Error('El nombre de la barbería es obligatorio');
        }
        if (this.email && !this.email.value) {
            throw new Error('El email de la barbería es obligatorio');
        }

        // Validate plan
        const planesValidos = ['trial', 'basico', 'pro', 'premium'];
        if (this.plan && !planesValidos.includes(this.plan)) {
            throw new Error(`Plan inválido: ${this.plan}`);
        }

        // Validate estado
        const estadosValidos = ['trial', 'activa', 'suspendida', 'pendiente_pago'];
        if (this.estado && !estadosValidos.includes(this.estado)) {
            throw new Error(`Estado inválido: ${this.estado}`);
        }
    }

    /**
     * Update general information
     */
    updateInfo(data) {
        if (data.nombre) this.nombre = data.nombre;
        if (data.direccion) this.direccion = data.direccion;
        if (data.telefono) this.telefono = data.telefono;
        if (data.rut) this.rut = data.rut;
        this.updatedAt = new Date();
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.configuracion = {
            ...this.configuracion,
            ...config
        };
        this.updatedAt = new Date();
    }

    /**
     * Check if barberia can be activated
     */
    canActivate() {
        return this.estado !== 'activa';
    }

    /**
     * Activate barberia
     */
    activate() {
        if (!this.canActivate()) {
            throw new Error('La barbería ya está activa');
        }

        this.estado = 'activa';

        // Set next payment date (30 days from now)
        const nextPayment = new Date();
        nextPayment.setDate(nextPayment.getDate() + 30);
        this.proximoPago = nextPayment;

        this.updatedAt = new Date();
    }

    /**
     * Suspend barberia
     */
    suspend(reason = '') {
        if (this.estado === 'suspendida') {
            throw new Error('La barbería ya está suspendida');
        }

        this.estado = 'suspendida';
        this.activa = false;
        this.updatedAt = new Date();
    }

    /**
     * Extend payment deadline
     */
    extendPaymentDeadline(days) {
        if (days <= 0) {
            throw new Error('Los días deben ser mayores a 0');
        }

        const base = this.proximoPago ? new Date(this.proximoPago) : new Date();
        const newDate = new Date(base);
        newDate.setDate(newDate.getDate() + days);

        this.proximoPago = newDate;
        this.updatedAt = new Date();

        return newDate;
    }

    /**
     * Add history entry
     */
    addHistoryEntry(action, userId, notes = '') {
        this.historial.push({
            fecha: new Date(),
            accion: action,
            realizadoPor: userId,
            notas: notes
        });
        this.updatedAt = new Date();
    }

    /**
     * Toggle matriz mode (multi-location)
     */
    toggleMatrizMode(enable) {
        if (enable && this.sucursales.length === 0) {
            throw new Error('No se puede habilitar modo matriz sin sucursales');
        }

        this.esMatriz = enable;
        this.updatedAt = new Date();
    }

    /**
     * Check if barberia is active
     */
    isActive() {
        return this.estado === 'activa' && this.activa;
    }

    /**
     * Check if barberia is in trial
     */
    isTrial() {
        return this.estado === 'trial';
    }

    /**
     * Check if barberia is suspended
     */
    isSuspended() {
        return this.estado === 'suspendida';
    }

    /**
     * Check if trial has expired
     */
    isTrialExpired() {
        if (!this.isTrial() || !this.fechaFinTrial) {
            return false;
        }
        return new Date() > new Date(this.fechaFinTrial);
    }

    /**
     * Get days until payment
     */
    getDaysUntilPayment() {
        if (!this.proximoPago) {
            return null;
        }

        const today = new Date();
        const payment = new Date(this.proximoPago);
        const diffTime = payment - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    /**
     * Check if payment is overdue
     */
    isPaymentOverdue() {
        const days = this.getDaysUntilPayment();
        return days !== null && days < 0;
    }

    /**
     * Convert to plain object for persistence
     */
    toObject() {
        return {
            id: this.id,
            nombre: this.nombre,
            slug: this.slug,
            email: this.email ? this.email.value : null,
            direccion: this.direccion,
            telefono: this.telefono,
            rut: this.rut,
            plan: this.plan,
            estado: this.estado,
            activa: this.activa,
            esMatriz: this.esMatriz,
            configuracion: this.configuracion,
            configuracionMatriz: this.configuracionMatriz,
            sucursales: this.sucursales,
            fechaFinTrial: this.fechaFinTrial,
            proximoPago: this.proximoPago,
            stripeCustomerId: this.stripeCustomerId,
            stripeSubscriptionId: this.stripeSubscriptionId,
            historial: this.historial,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Barberia;
