import express from "express";
import {
  obtenerMontoAgua,
  obtenerMontoTasas,
} from "../services/consulta.service.js";

const router = express.Router();

router.get("/consulta-cuenta/sauce", (req, res) => {
  res.render("consulta-sauce", { monto: null, error: null });
});

router.post("/consulta-cuenta/sauce", async (req, res) => {
  const { nroCuenta } = req.body;
  try {
    const monto = await obtenerMontoAgua(nroCuenta); // O usa obtenerMontoTasas según corresponda
    res.render("consulta-sauce", { monto, error: null });
  } catch (error) {
    res.render("consulta-sauce", { monto: null, error: error.message });
  }
});

export default router;
