const events = require("../events");
const emailService = require("../notifications/email/email.service");
const { getInstance: getSSEManager } = require("../infrastructure/sse/SSEManager");
const Barbero = require("../infrastructure/database/mongodb/models/Barbero");
const container = require("../shared/Container");

console.log("📡 reservas.events cargado");

// Evento: Reserva creada
events.on("reserva.creada", async (reserva) => {
  try {
    // Enviar email de confirmación
    await emailService.reservaConfirmada(reserva);

    // Enviar notificación SSE en tiempo real
    const sseManager = getSSEManager();

    // Notificar al barbero asignado
    if (reserva.barberoId) {
      try {
        const barbero = await Barbero.findById(reserva.barberoId).populate('usuarioId');

        if (barbero?.usuarioId) {
          sseManager.sendToUser(barbero.usuarioId.toString(), 'nueva_reserva', {
            reservaId: reserva._id?.toString() || reserva.id,
            clienteNombre: reserva.nombreCliente,
            fecha: reserva.fecha,
            hora: reserva.hora,
            servicio: reserva.servicioId?.nombre || 'Servicio',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('[SSE] Error notificando a barbero:', error.message);
      }
    }

    // Notificar a admins de la barbería
    sseManager.sendToBarberia(
      reserva.barberiaId?.toString() || reserva.barberiaId,
      'nueva_reserva_admin',
      {
        reservaId: reserva._id?.toString() || reserva.id,
        clienteNombre: reserva.nombreCliente,
        barberoNombre: reserva.barberoId?.nombre || 'Sin asignar',
        fecha: reserva.fecha,
        hora: reserva.hora,
        timestamp: new Date().toISOString()
      },
      ['BARBERO'] // Excluir barberos
    );

    // 🆕 Sincronizar con Calendario Externo (Google/Outlook)
    try {
      const syncUseCase = container.syncReservaWithCalendarUseCase;
      await syncUseCase.execute(reserva._id?.toString() || reserva.id, 'CREATE');
    } catch (syncError) {
      console.error('⚠️ Error sincronizando con calendario:', syncError.message);
    }

  } catch (error) {
    console.error("⚠️ Error en evento reserva.creada:", error.message);
  }
});

// Evento: Reserva cancelada
events.on("reserva.cancelada", async (reserva) => {
  try {
    const sseManager = getSSEManager();

    // Notificar a toda la barbería
    sseManager.sendToBarberia(
      reserva.barberiaId?.toString() || reserva.barberiaId,
      'cancelacion',
      {
        reservaId: reserva._id?.toString() || reserva.id,
        clienteNombre: reserva.nombreCliente,
        fecha: reserva.fecha,
        hora: reserva.hora,
        timestamp: new Date().toISOString()
      }
    );

    // 🆕 Notificar a la lista de espera
    try {
      const notifyWaitingListUseCase = container.notifyWaitingListUseCase;

      await notifyWaitingListUseCase.execute({
        barberiaId: reserva.barberiaId,
        barberoId: reserva.barberoId,
        servicioId: reserva.servicioId,
        fecha: reserva.fecha,
        hora: reserva.hora
      });

      console.log('✅ Lista de espera notificada para horario liberado');
    } catch (waitingListError) {
      console.error('⚠️ Error notificando lista de espera:', waitingListError.message);
      // No fallar si la notificación de lista de espera falla
    }

    // 🆕 Eliminar/Notificar en Calendario Externo
    try {
      const syncUseCase = container.syncReservaWithCalendarUseCase;
      await syncUseCase.execute(reserva._id?.toString() || reserva.id, 'DELETE');
    } catch (syncError) {
      console.error('⚠️ Error eliminando de calendario:', syncError.message);
    }

  } catch (error) {
    console.error('[SSE] Error en evento reserva.cancelada:', error.message);
  }
});

// Evento: Reserva completada
events.on("reserva.completada", async (reserva) => {
  try {
    const sseManager = getSSEManager();

    // Notificar al barbero
    if (reserva.barberoId) {
      try {
        const barbero = await Barbero.findById(reserva.barberoId).populate('usuarioId');

        if (barbero?.usuarioId) {
          sseManager.sendToUser(barbero.usuarioId.toString(), 'reserva_completada', {
            reservaId: reserva._id?.toString() || reserva.id,
            clienteNombre: reserva.nombreCliente,
            ganancia: reserva.precio || 0,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('[SSE] Error notificando completado a barbero:', error.message);
      }
    }
  } catch (error) {
    console.error('[SSE] Error en evento reserva.completada:', error.message);
  }
});

