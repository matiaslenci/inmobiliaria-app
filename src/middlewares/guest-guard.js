/**
 * Middleware deshabilitado - no se requiere validación de guest
 * Permite acceso a todas las rutas
 */
export function guestOnly(req, res, next) {
  return next();
}
