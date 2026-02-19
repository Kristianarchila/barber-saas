/**
 * Email Service Wrapper - Exporta versión resiliente
 * 
 * Este archivo envuelve el servicio de email base con el wrapper resiliente
 * para que todos los controladores automáticamente usen la versión con
 * circuit breaker y graceful degradation.
 */

const baseEmailService = require('./email/email.service');
const ResilientEmailService = require('../services/resilientEmail.service');

// Crear instancia resiliente del servicio de email
const resilientEmailService = new ResilientEmailService(baseEmailService);

// Exportar la versión resiliente
module.exports = resilientEmailService;
