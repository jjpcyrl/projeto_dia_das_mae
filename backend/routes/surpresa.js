const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/surpresaController");

router.get("/assinar", ctrl.assinar);
router.post("/", express.json(), ctrl.criar);
router.get("/:id", ctrl.buscar);

module.exports = router;