import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import consultaRoutes from "./routes/consulta.routes.js";
import multer from "multer";
import XLSX from "xlsx";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Motor de vistas
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// Configuración de multer para subir archivos
const upload = multer({ dest: "uploads/" });

// Página principal
app.get("/", (req, res) => {
  res.render("index");
});

// Endpoint para subir y procesar Excel
app.post("/upload", upload.single("excelFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se subió ningún archivo");
  }

  // Leer archivo Excel
  const filePath = path.join(__dirname, "../", req.file.path);
  const workbook = XLSX.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Extraer la columna "CUENTA AGUA"
  const cuentasAgua = [];
  sheet.forEach((row) => {
    if (row["CUENTA AGUA"]) {
      cuentasAgua.push(row["CUENTA AGUA"]);
    }
  });

  // Eliminar archivo temporal
  fs.unlinkSync(filePath);

  // Renderizar resultados en una tabla
  res.render("result", { cuentas: cuentasAgua });
});

// Rutas
app.use("/aguas", consultaRoutes);

export default app;
