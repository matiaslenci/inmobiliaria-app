import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import consultaRoutes from "./routes/consulta.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import consultaSauceRoutes from "./routes/consulta-sauce.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware para usuario (deshabilitado - sin autenticación)
app.use((req, res, next) => {
  res.locals.user = null;
  next();
});

// Motor de vistas
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// Rutas
app.use("/", consultaRoutes);
app.use("/", consultaSauceRoutes);
app.use("/", feedbackRoutes);

export default app;
