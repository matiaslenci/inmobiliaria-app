import { Router } from "express";
import {
  mostrarFormulario,
  procesarConsulta,
  uploadExcel,
  uploadExcelMiddleware,
} from "../controllers/consulta.controller.js";

const router = Router();

router.get("/", uploadExcel);
router.post("/upload", uploadExcelMiddleware, procesarConsulta);
//router.get("/", mostrarFormulario);
router.get("/consulta", mostrarFormulario);
//router.post("/consulta-aguas", procesarConsulta);

export default router;
