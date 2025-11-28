// Autenticación deshabilitada - Supabase no se utiliza

// Página de registro
export const registerPage = (req, res) => {
  res.render("register", {
    error: "La autenticación está deshabilitada en esta aplicación",
    success: null,
    user: null,
  });
};

// Página de login
export const loginPage = (req, res) => {
  res.render("login", {
    error: "La autenticación está deshabilitada en esta aplicación",
    user: null,
  });
};

// Procesar registro
export const processRegister = (req, res) => {
  res.status(403).json({
    error: "La autenticación está deshabilitada en esta aplicación",
  });
};

// Procesar login
export const login = (req, res) => {
  res.status(403).json({
    error: "La autenticación está deshabilitada en esta aplicación",
  });
};

// Cerrar sesión
export const logout = (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("user_email");
  res.redirect("/");
};

// Perfil del usuario
export const getProfile = (req, res) => {
  res.status(403).json({
    error: "La autenticación está deshabilitada en esta aplicación",
  });
};

// Confirmar email
export const confirmEmail = (req, res) => {
  res.render("confirm-email", {
    error: "La autenticación está deshabilitada en esta aplicación",
    success: false,
  });
};
