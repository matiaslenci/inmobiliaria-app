import express from "express";
import {
  renderConsultaSauce,
  procesarConsulta,
} from "../controllers/consulta-sauce.controller.js";

const router = express.Router();

router.get("/consulta-sauce", renderConsultaSauce);
router.post("/consulta-sauce", procesarConsulta);

export default router;
