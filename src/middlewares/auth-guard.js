import supabase from "../utils/client.js";
/**
 * Middleware para proteger rutas que requieren autenticación.
 * Verifica si el usuario está logueado.
 * Si no lo está, redirige al login.
 * Si lo está, permite continuar a la siguiente función middleware o ruta.
 */
export async function authRequired(req, res, next) {
  try {
    const token = req.cookies.sb_access_token;

    if (!token) {
      return res.redirect("/login");
    }

    // Validar el token con Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error("Error validando token:", error?.message);
      return res.redirect("/login");
    }

    // Guardar el usuario en res.locals (disponible en las vistas)
    res.locals.user = data.user;
    req.user = data.user;

    return next();
  } catch (err) {
    console.error("Error en authRequired:", err);
    return res.redirect("/login");
  }
}

/* export function isAdmin(req, res, next) {
  if (!req.session || !req.session.user || !req.session.user.isAdmin) {
    // No es admin → redirigir al perfil
    return res.redirect("/profile");
  }
  next();
}
 */
