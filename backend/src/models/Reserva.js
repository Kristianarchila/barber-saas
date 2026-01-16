const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    barberoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barbero",
      required: true
    },

    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false // luego se activará cuando creemos clientes
    },
     
    nombreCliente: {
      type: String,
      required: true
    },
    barberiaId: {                
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barberia",
      required: true
    },
    fecha: {
      type: String, // YYYY-MM-DD
      required: true
    },

    hora: {
      type: String, // HH:MM
      required: true
    },

    estado: {
      type: String,
      enum: ["RESERVADA", "CANCELADA", "COMPLETADA"],
      default: "RESERVADA"
    }, 
    
    horaFin: { 
      type: String, 
      required: true 
    },
    
    servicioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Servicio",
      required: true
    }
  },
  { timestamps: true }
);

// índice para evitar duplicados
reservaSchema.index(
  { barberoId: 1, fecha: 1, hora: 1 },
  { unique: true }
);

module.exports = mongoose.model("Reserva", reservaSchema);