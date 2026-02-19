/**
 * Circuit Breaker Pattern Implementation
 * 
 * Previene llamadas repetidas a servicios que están fallando,
 * permitiendo que el sistema se recupere gradualmente.
 * 
 * Estados:
 * - CLOSED: Funcionamiento normal
 * - OPEN: Servicio fallando, rechaza llamadas inmediatamente
 * - HALF_OPEN: Probando si el servicio se recuperó
 */

class CircuitBreaker {
    constructor(options = {}) {
        this.name = options.name || 'unnamed';
        this.failureThreshold = options.failureThreshold || 5; // Fallos antes de abrir
        this.successThreshold = options.successThreshold || 2; // Éxitos para cerrar desde HALF_OPEN
        this.timeout = options.timeout || 60000; // Tiempo en OPEN antes de probar (60s)
        this.fallback = options.fallback || null; // Función fallback opcional

        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
        this.stats = {
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            rejectedCalls: 0
        };
    }

    async execute(fn, ...args) {
        this.stats.totalCalls++;

        // Si está OPEN, rechazar inmediatamente
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                this.stats.rejectedCalls++;
                console.warn(`⚡ Circuit Breaker [${this.name}] OPEN - Rechazando llamada`);

                // Usar fallback si existe
                if (this.fallback) {
                    return this.fallback(...args);
                }

                throw new Error(`Circuit breaker [${this.name}] is OPEN`);
            }

            // Tiempo cumplido, pasar a HALF_OPEN
            this.state = 'HALF_OPEN';
            this.successCount = 0;
            console.log(`🔄 Circuit Breaker [${this.name}] pasando a HALF_OPEN`);
        }

        try {
            const result = await fn(...args);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.stats.successfulCalls++;
        this.failureCount = 0;

        if (this.state === 'HALF_OPEN') {
            this.successCount++;

            if (this.successCount >= this.successThreshold) {
                this.state = 'CLOSED';
                console.log(`✅ Circuit Breaker [${this.name}] CERRADO - Servicio recuperado`);
            }
        }
    }

    onFailure() {
        this.stats.failedCalls++;
        this.failureCount++;
        this.successCount = 0;

        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.timeout;
            console.error(`🔴 Circuit Breaker [${this.name}] ABIERTO - Servicio fallando`);
        }
    }

    getState() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            stats: this.stats
        };
    }

    reset() {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
        console.log(`🔄 Circuit Breaker [${this.name}] reseteado manualmente`);
    }
}

module.exports = CircuitBreaker;
