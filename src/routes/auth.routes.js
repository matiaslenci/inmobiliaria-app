import express from "express";
import {
  processRegister,
  login,
  logout,
  getProfile,
  registerPage,
  loginPage,
  confirmEmail
} from "../controllers/auth.controller.js";

const router = express.Router();

// Rutas de autenticación
router.get("/login", loginPage);
router.get("/register", registerPage);
router.get("/auth/confirm", confirmEmail);

// Procesamiento de formularios
router.post("/login", login);
router.post("/register", processRegister);
router.post("/logout", logout);

// Perfil del usuario (protegido)
router.get("/profile", getProfile);

export default router;
