const adminEmails = ["matiaslenci@gmail.com", "nachomontero05@gmail.com"];

export function adminGuard(req, res, next) {
  try {
    // Obtener el token de la cookie
    const token = req.cookies.access_token;

    if (!token) {
      console.log("No se encontró token de autenticación");
      return res.redirect("/login");
    }

    // Verificar si hay un usuario en las cookies
    const userEmail = req.cookies.user_email;
    if (!userEmail) {
      console.error("Email de usuario no encontrado en las cookies");
      return res.redirect("/login");
    }

    // Verificar si el usuario es administrador
    if (!adminEmails.includes(userEmail)) {
      console.log(`Acceso denegado para el usuario: ${userEmail}`);
      return res
        .status(403)
        .send("Acceso denegado. No tienes permisos de administrador.");
    }

    // Usuario autenticado y autorizado
    next();
  } catch (error) {
    console.error("Error en adminGuard:", error);
    return res.status(500).send("Error interno del servidor");
  }
}
