/**
 * Middleware deshabilitado - no se requiere autenticación
 * Permite acceso a todas las rutas sin validación
 */
export function authRequired(req, res, next) {
  req.user = null;
  res.locals.user = null;
  return next();
}
