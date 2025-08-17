import supabase from "../utils/client.js";

/**
 * Solo para usuarios no autenticados.
 * Redirige a la página de inicio si el usuario ya está logueado.
 * Si no está logueado, permite continuar a la siguiente función middleware o ruta.
 */
export async function guestOnly(req, res, next) {
  const token = req.cookies.sb_access_token;

  if (!token) {
    return next(); // no hay sesión → puede ver login/register
  }

  // validar sesión
  const { data, error } = await supabase.auth.getUser(token);

  if (data?.user && !error) {
    return res.redirect("/profile"); // ya logeado → no puede ir a login/register
  }

  return next();
}
