import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import consultaRoutes from "./routes/consulta.routes.js";
import authRoutes from "./routes/auth.routes.js";
import consultaSauceRoutes from "./routes/consulta-sauce.routes.js";
import { supabase } from "./utils/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware para que el usuario esté disponible en todas las vistas EJS
app.use(async (req, res, next) => {
  try {
    // Obtener el token desde las cookies
    const token = req.cookies?.sb_access_token;

    if (token) {
      // Validar el token con Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error) {
        console.error("Error al obtener usuario:", error.message);
        // Token inválido, limpiar cookie
        res.clearCookie("sb_access_token");
        res.locals.user = null;
      } else {
        res.locals.user = user;
      }
    } else {
      res.locals.user = null;
    }
  } catch (err) {
    console.error("Error middleware usuario:", err);
    res.locals.user = null;
  }
  next();
});

// Motor de vistas
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// Rutas
app.use("/", consultaRoutes);
app.use("/", authRoutes);
app.use("/", consultaSauceRoutes);

export default app;
