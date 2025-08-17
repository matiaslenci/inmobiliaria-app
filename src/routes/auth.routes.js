import express from "express";
import {
  processRegister,
  login,
  logout,
  getProfile,
  registerPage,
  loginPage,
  confirmEmail,
} from "../controllers/auth.controller.js";
import { guestOnly } from "../middlewares/guest-guard.js";
import { authRequired } from "../middlewares/auth-guard.js";

const router = express.Router();

// Rutas de autenticación
router.get("/login", guestOnly, loginPage);
router.get("/register", guestOnly, registerPage);
router.get("/auth/confirm", guestOnly, confirmEmail);
router.get("/auth/check-email", guestOnly, (req, res) => {
  res.render("check-email");
});

// Procesamiento de formularios
router.post("/login", login);
router.post("/register", processRegister);
router.post("/logout", logout);

// Perfil del usuario (protegido)
router.get("/profile", authRequired, getProfile);

export default router;
