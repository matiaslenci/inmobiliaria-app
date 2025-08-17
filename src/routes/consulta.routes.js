import { Router } from "express";
import {
  procesarConsulta,
  uploadExcel,
  uploadExcelMiddleware,
  descargarPlantilla,
} from "../controllers/consulta.controller.js";
import { authRequired } from "../middlewares/auth-guard.js";

const router = Router();

router.get("/", uploadExcel);
router.post("/upload", authRequired, uploadExcelMiddleware, procesarConsulta);
router.get("/plantilla", descargarPlantilla);

export default router;
