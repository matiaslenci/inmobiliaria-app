import { Router } from "express";
import {
  procesarConsulta,
  uploadExcel,
  uploadExcelMiddleware,
  descargarPlantilla,
  descargarResultados,
} from "../controllers/consulta.controller.js";
import { authRequired } from "../middlewares/auth-guard.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get("/", uploadExcel);
router.post("/upload", authRequired, uploadExcelMiddleware, procesarConsulta);

router.get("/plantilla", descargarPlantilla);
router.post("/exportar-resultados", descargarResultados);

// SEO Routes
router.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.sendFile(path.join(__dirname, "../../public/robots.txt"));
});

router.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.sendFile(path.join(__dirname, "../../public/sitemap.xml"));
});

export default router;
