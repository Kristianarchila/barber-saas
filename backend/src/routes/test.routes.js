const express = require("express");
const router = express.Router();
const { protect } = require("../config/middleware/auth.middleware");

router.get("/private", protect, (req, res) => {
  res.json({
    message: "Acceso permitido",
    user: {
      id: req.user._id,
      email: req.user.email,
      rol: req.user.rol
    }
  });
});

module.exports = router;
