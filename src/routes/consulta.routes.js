import { Router } from "express";
import {
  mostrarFormulario,
  procesarConsulta,
} from "../controllers/consulta.controller.js";

const router = Router();

router.get("/", mostrarFormulario);
router.post("/consulta", procesarConsulta);

export default router;
