/**
 * Subscription Domain Entity
 * 
 * Represents a barberia's subscription to a plan.
 * Contains business logic for subscription lifecycle.
 */

class Subscription {
    constructor({
        id,
        barberiaId,
        plan,
        status,
        stripeCustomerId,
        stripeSubscriptionId,
        stripePriceId,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd = false,
        trialEndsAt,
        paymentMethod = 'STRIPE',
        manualPayments = [],
        changeHistory = [],
        metadata = {},
        createdAt,
        updatedAt
    }) {
        this._id = id;
        this._barberiaId = barberiaId;
        this._plan = plan;
        this._status = status;
        this._stripeCustomerId = stripeCustomerId;
        this._stripeSubscriptionId = stripeSubscriptionId;
        this._stripePriceId = stripePriceId;
        this._currentPeriodStart = currentPeriodStart;
        this._currentPeriodEnd = currentPeriodEnd;
        this._cancelAtPeriodEnd = cancelAtPeriodEnd;
        this._trialEndsAt = trialEndsAt;
        this._paymentMethod = paymentMethod;
        this._manualPayments = manualPayments;
        this._changeHistory = changeHistory;
        this._metadata = metadata;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;

        this.validate();
    }

    // Getters
    get id() { return this._id; }
    get barberiaId() { return this._barberiaId; }
    get plan() { return this._plan; }
    get status() { return this._status; }
    get stripeCustomerId() { return this._stripeCustomerId; }
    get stripeSubscriptionId() { return this._stripeSubscriptionId; }
    get stripePriceId() { return this._stripePriceId; }
    get currentPeriodStart() { return this._currentPeriodStart; }
    get currentPeriodEnd() { return this._currentPeriodEnd; }
    get cancelAtPeriodEnd() { return this._cancelAtPeriodEnd; }
    get trialEndsAt() { return this._trialEndsAt; }
    get paymentMethod() { return this._paymentMethod; }
    get manualPayments() { return this._manualPayments; }
    get changeHistory() { return this._changeHistory; }
    get metadata() { return this._metadata; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }

    /**
     * Validate subscription data
     * @throws {Error} if validation fails
     */
    validate() {
        if (!this._barberiaId) {
            throw new Error('barberiaId is required');
        }

        // Normalize plan name to canonical key using centralized PlanLimits
        const { normalizePlan, PLAN_LIMITS } = require('../constants/PlanLimits');
        const normalizedPlan = normalizePlan(this._plan);
        if (!PLAN_LIMITS[normalizedPlan]) {
            throw new Error(`Invalid plan: ${this._plan}`);
        }
        // Store the normalized plan name for consistency
        this._plan = normalizedPlan;

        const validStatuses = ['ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', 'INCOMPLETE'];
        if (!validStatuses.includes(this._status)) {
            throw new Error(`Invalid status: ${this._status}`);
        }

        const validPaymentMethods = ['STRIPE', 'MANUAL', 'FLOW', 'TRANSBANK', 'MERCADOPAGO'];
        if (!validPaymentMethods.includes(this._paymentMethod)) {
            throw new Error(`Invalid payment method: ${this._paymentMethod}`);
        }

        // stripeCustomerId is only required for STRIPE payment method
        if (this._paymentMethod === 'STRIPE' && !this._stripeCustomerId) {
            throw new Error('stripeCustomerId is required for STRIPE payment method');
        }
    }

    /**
     * Check if subscription is active
     * @returns {boolean}
     */
    isActive() {
        return this._status === 'ACTIVE';
    }

    /**
     * Check if subscription is in trial period
     * @returns {boolean}
     */
    isTrialing() {
        return this._status === 'TRIALING';
    }

    /**
     * Check if subscription is past due
     * @returns {boolean}
     */
    isPastDue() {
        return this._status === 'PAST_DUE';
    }

    /**
     * Check if subscription is canceled
     * @returns {boolean}
     */
    isCanceled() {
        return this._status === 'CANCELED';
    }

    /**
     * Check if subscription allows access to the system
     * @returns {boolean}
     */
    canAccess() {
        return this.isActive() || this.isTrialing();
    }

    /**
     * Check if subscription is scheduled for cancellation
     * @returns {boolean}
     */
    isScheduledForCancellation() {
        return this._cancelAtPeriodEnd === true;
    }

    /**
     * Check if trial has ended
     * @returns {boolean}
     */
    hasTrialEnded() {
        if (!this._trialEndsAt) return true;
        return new Date() > new Date(this._trialEndsAt);
    }

    /**
     * Get days remaining in trial
     * @returns {number} Days remaining, or 0 if not in trial
     */
    getTrialDaysRemaining() {
        if (!this.isTrialing() || !this._trialEndsAt) return 0;

        const now = new Date();
        const trialEnd = new Date(this._trialEndsAt);
        const diffTime = trialEnd - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    }

    /**
     * Get days remaining in current period
     * @returns {number} Days remaining
     */
    getDaysRemainingInPeriod() {
        if (!this._currentPeriodEnd) return 0;

        const now = new Date();
        const periodEnd = new Date(this._currentPeriodEnd);
        const diffTime = periodEnd - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    }

    /**
     * Check if subscription can be upgraded
     * @param {string} newPlan 
     * @returns {boolean}
     */
    canUpgradeTo(newPlan) {
        if (!this.canAccess()) return false;

        const Plan = require('./Plan');
        return Plan.canUpgrade(this._plan, newPlan);
    }

    /**
     * Check if subscription can be downgraded
     * @param {string} newPlan 
     * @returns {boolean}
     */
    canDowngradeTo(newPlan) {
        if (!this.canAccess()) return false;

        const Plan = require('./Plan');
        return Plan.canDowngrade(this._plan, newPlan);
    }

    /**
     * Activate subscription
     * @returns {Subscription} Updated subscription
     */
    activate() {
        this._status = 'ACTIVE';
        this._updatedAt = new Date();
        return this;
    }

    /**
     * Mark subscription as past due
     * @returns {Subscription} Updated subscription
     */
    markPastDue() {
        this._status = 'PAST_DUE';
        this._updatedAt = new Date();
        return this;
    }

    /**
     * Cancel subscription
     * @param {boolean} immediately - Cancel immediately or at period end
     * @returns {Subscription} Updated subscription
     */
    cancel(immediately = false) {
        if (immediately) {
            this._status = 'CANCELED';
        } else {
            this._cancelAtPeriodEnd = true;
        }
        this._updatedAt = new Date();
        return this;
    }

    /**
     * Reactivate a canceled subscription
     * @returns {Subscription} Updated subscription
     */
    reactivate() {
        if (!this.isCanceled() && !this.isScheduledForCancellation()) {
            throw new Error('Subscription is not canceled');
        }

        this._status = 'ACTIVE';
        this._cancelAtPeriodEnd = false;
        this._updatedAt = new Date();
        return this;
    }

    /**
     * Update plan
     * @param {string} newPlan 
     * @param {string} newStripePriceId 
     * @returns {Subscription} Updated subscription
     */
    updatePlan(newPlan, newStripePriceId) {
        const Plan = require('./Plan');

        if (!Plan.isValid(newPlan)) {
            throw new Error(`Invalid plan: ${newPlan}`);
        }

        this._plan = newPlan;
        this._stripePriceId = newStripePriceId;
        this._updatedAt = new Date();
        return this;
    }

    /**
     * Update period dates
     * @param {Date} start 
     * @param {Date} end 
     * @returns {Subscription} Updated subscription
     */
    updatePeriod(start, end) {
        this._currentPeriodStart = start;
        this._currentPeriodEnd = end;
        this._updatedAt = new Date();
        return this;
    }

    /**
     * Change plan manually (for manual subscription management)
     * @param {string} newPlan 
     * @param {string} changedBy - User ID who made the change
     * @param {string} reason - Reason for the change
     * @returns {Subscription} Updated subscription
     */
    changePlanManually(newPlan, changedBy, reason = '') {
        const Plan = require('./Plan');

        if (!Plan.isValid(newPlan)) {
            throw new Error(`Invalid plan: ${newPlan}`);
        }

        const oldPlan = this._plan;
        this._plan = newPlan;
        this._paymentMethod = 'MANUAL';
        this._updatedAt = new Date();

        // Record change in history
        this._changeHistory.push({
            from: oldPlan,
            to: newPlan,
            date: new Date(),
            changedBy,
            reason,
            type: 'PLAN_CHANGE'
        });

        return this;
    }

    /**
     * Extend subscription period manually
     * @param {number} months - Number of months to extend
     * @param {string} extendedBy - User ID who extended
     * @param {string} reason - Reason for extension
     * @returns {Subscription} Updated subscription
     */
    extendPeriodManually(months, extendedBy, reason = '') {
        if (months <= 0) {
            throw new Error('Months must be positive');
        }

        const oldEnd = this._currentPeriodEnd;
        const newEnd = new Date(this._currentPeriodEnd || new Date());
        newEnd.setMonth(newEnd.getMonth() + months);

        this._currentPeriodEnd = newEnd;
        this._paymentMethod = 'MANUAL';
        this._updatedAt = new Date();

        // Record change in history
        this._changeHistory.push({
            from: oldEnd,
            to: newEnd,
            date: new Date(),
            changedBy: extendedBy,
            reason,
            type: 'PERIOD_EXTENSION',
            metadata: { months }
        });

        return this;
    }

    /**
     * Record a manual payment
     * @param {number} amount - Payment amount
     * @param {string} concept - Payment concept/description
     * @param {string} recordedBy - User ID who recorded the payment
     * @param {Object} metadata - Additional payment metadata
     * @returns {Subscription} Updated subscription
     */
    recordManualPayment(amount, concept, recordedBy, metadata = {}) {
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }

        this._manualPayments.push({
            amount,
            concept,
            date: new Date(),
            recordedBy,
            metadata
        });

        this._paymentMethod = 'MANUAL';
        this._updatedAt = new Date();

        return this;
    }

    /**
     * Activate subscription manually
     * @param {string} activatedBy - User ID who activated
     * @param {string} reason - Reason for activation
     * @returns {Subscription} Updated subscription
     */
    activateManually(activatedBy, reason = '') {
        const oldStatus = this._status;
        this._status = 'ACTIVE';
        this._cancelAtPeriodEnd = false;
        this._paymentMethod = 'MANUAL';
        this._updatedAt = new Date();

        // Record change in history
        this._changeHistory.push({
            from: oldStatus,
            to: 'ACTIVE',
            date: new Date(),
            changedBy: activatedBy,
            reason,
            type: 'STATUS_CHANGE'
        });

        return this;
    }

    /**
     * Deactivate subscription manually
     * @param {string} deactivatedBy - User ID who deactivated
     * @param {string} reason - Reason for deactivation
     * @returns {Subscription} Updated subscription
     */
    deactivateManually(deactivatedBy, reason = '') {
        const oldStatus = this._status;
        this._status = 'CANCELED';
        this._paymentMethod = 'MANUAL';
        this._updatedAt = new Date();

        // Record change in history
        this._changeHistory.push({
            from: oldStatus,
            to: 'CANCELED',
            date: new Date(),
            changedBy: deactivatedBy,
            reason,
            type: 'STATUS_CHANGE'
        });

        return this;
    }

    /**
     * Check if subscription is managed manually
     * @returns {boolean}
     */
    isManagedManually() {
        return this._paymentMethod === 'MANUAL';
    }

    /**
     * Convert to plain object for persistence
     * @returns {Object}
     */
    toObject() {
        return {
            id: this._id,
            barberiaId: this._barberiaId,
            plan: this._plan,
            status: this._status,
            stripeCustomerId: this._stripeCustomerId,
            stripeSubscriptionId: this._stripeSubscriptionId,
            stripePriceId: this._stripePriceId,
            currentPeriodStart: this._currentPeriodStart,
            currentPeriodEnd: this._currentPeriodEnd,
            cancelAtPeriodEnd: this._cancelAtPeriodEnd,
            trialEndsAt: this._trialEndsAt,
            paymentMethod: this._paymentMethod,
            manualPayments: this._manualPayments,
            changeHistory: this._changeHistory,
            metadata: this._metadata,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt
        };
    }

    /**
     * Create from plain object
     * @param {Object} data 
     * @returns {Subscription}
     */
    static fromObject(data) {
        return new Subscription(data);
    }
}

module.exports = Subscription;
