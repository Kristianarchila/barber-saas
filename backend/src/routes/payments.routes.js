const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Ruta de pagos activa" });
});

module.exports = router;
