import { Router } from "express";
import {
  procesarConsulta,
  uploadExcel,
  uploadExcelMiddleware,
  descargarPlantilla,
} from "../controllers/consulta.controller.js";

const router = Router();

router.get("/", uploadExcel);
router.post("/upload", uploadExcelMiddleware, procesarConsulta);
router.get("/plantilla", descargarPlantilla);

export default router;
