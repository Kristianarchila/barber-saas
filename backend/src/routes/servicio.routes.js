const express = require("express");
const router = express.Router();
const { crearServicio, obtenerServicios ,cambiarEstadoServicio, editarServicio,  } = require("../controllers/servicio.controller");
const { protect, authorize } = require("../config/middleware/auth.middleware");


// Crear servicio (solo admin barbería)
router.post(
  "/",
  protect,
  authorize("BARBERIA_ADMIN"),
  crearServicio
);

// Listar servicios
router.get(
  "/",
  protect,
  authorize("BARBERIA_ADMIN"),
  obtenerServicios
);

// Activar o desactivar servicio
router.patch(
  "/:id",
  protect,
  authorize("BARBERIA_ADMIN"),
  cambiarEstadoServicio
);

// Editar servicio
router.put(
  "/:id",
  protect,
  authorize("BARBERIA_ADMIN"),
  editarServicio
);





module.exports = router;
