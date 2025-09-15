import express from "express";
import { adminGuard } from "../middlewares/admin-guard.js";
import {
  renderAdminPanel,
  getStats,
  getActivityLog,
  getUsers,
  getConsultas,
  getSubscriptions,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Proteger todas las rutas de admin con el middleware
router.use(adminGuard);

// Ruta principal del panel de administración
router.get("/", renderAdminPanel);

// API Routes para el dashboard
router.get("/api/stats", getStats);
router.get("/api/activity-log", getActivityLog);

// Rutas para las diferentes secciones
router.get("/users", getUsers);
router.get("/consultas", getConsultas);
router.get("/subscriptions", getSubscriptions);

// Rutas de configuración
router.get("/settings/general", (req, res) =>
  res.render("admin/settings/general")
);
router.get("/settings/email", (req, res) => res.render("admin/settings/email"));

export default router;
