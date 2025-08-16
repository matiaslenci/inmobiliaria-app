import { supabase } from "../utils/client.js";

// Página de registro
export const registerPage = (req, res) => {
  res.render("register", { 
    error: null, 
    success: null,
    user: res.locals.user 
  });
};

// Página de login
export const loginPage = (req, res) => {
  res.render("login", { 
    error: null, 
    user: res.locals.user 
  });
};

// Procesar registro
export const processRegister = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.render("register", { 
        error: "Todos los campos son obligatorios",
        success: null,
        user: res.locals.user
      });
    }

    if (password.length < 6) {
      return res.render("register", { 
        error: "La contraseña debe tener al menos 6 caracteres",
        success: null,
        user: res.locals.user
      });
    }

    if (password !== confirmPassword) {
      return res.render("register", { 
        error: "Las contraseñas no coinciden",
        success: null,
        user: res.locals.user
      });
    }

    // Intentar registro con Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${req.protocol}://${req.get('host')}/auth/confirm`
      }
    });

    // Manejar error
    if (error) {
      console.error("Error en registro:", error);
      return res.render("register", { 
        error: error.message,
        success: null,
        user: res.locals.user
      });
    }

    // Usuario creado pero requiere confirmación de email
    if (data.user && !data.session) {
      return res.redirect("/auth/check-email");
    }

    // Usuario creado y autenticado automáticamente
    if (data.session) {
      res.cookie("sb_access_token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        sameSite: "lax"
      });

      return res.redirect("/profile");
    }

  } catch (error) {
    console.error("Error inesperado en registro:", error);
    return res.render("register", { 
      error: "Error inesperado. Intenta nuevamente.",
      success: null,
      user: res.locals.user
    });
  }
};


// Procesar login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.render("login", { 
        error: "Todos los campos son obligatorios",
        user: res.locals.user
      });
    }

    // Intentar login con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Error en login:", error);
      
      let errorMessage = "Error al iniciar sesión";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email o contraseña incorrectos";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor confirma tu email antes de iniciar sesión";
      } else {
        errorMessage = error.message;
      }

      return res.render("login", { 
        error: errorMessage,
        user: res.locals.user
      });
    }

    if (data.session) {
      // Login exitoso, establecer cookie
      res.cookie("sb_access_token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        sameSite: "lax"
      });

      return res.redirect("/profile");
    }

  } catch (error) {
    console.error("Error inesperado en login:", error);
    return res.render("login", { 
      error: "Error inesperado. Intenta nuevamente.",
      user: res.locals.user
    });
  }
};

// Cerrar sesión
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.sb_access_token;
    
    if (token) {
      await supabase.auth.signOut();
    }
    
    res.clearCookie("sb_access_token");
    res.redirect("/");
  } catch (error) {
    console.error("Error en logout:", error);
    res.clearCookie("sb_access_token");
    res.redirect("/");
  }
};

// Perfil del usuario
export const getProfile = async (req, res) => {
  try {
    const token = req.cookies?.sb_access_token;
    if (!token) {
      return res.redirect("/login");
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.clearCookie("sb_access_token");
      return res.redirect("/login");
    }

    res.render("profile", { user });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.clearCookie("sb_access_token");
    res.redirect("/login");
  }
};

// Confirmar email
export const confirmEmail = async (req, res) => {
  try {
    const { token_hash, type } = req.query;
    
    if (type === 'signup' && token_hash) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'signup'
      });

      if (error) {
        return res.render("confirm-email", { 
          error: "Error al confirmar el email. El enlace puede haber expirado.",
          success: false
        });
      }

      return res.render("confirm-email", { 
        error: null,
        success: true,
        message: "¡Email confirmado exitosamente! Ya puedes iniciar sesión."
      });
    }

    res.render("confirm-email", { 
      error: "Enlace de confirmación inválido",
      success: false
    });
  } catch (error) {
    console.error("Error confirmando email:", error);
    res.render("confirm-email", { 
      error: "Error inesperado al confirmar el email",
      success: false
    });
  }
};
