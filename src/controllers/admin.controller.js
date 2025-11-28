// Panel de administración deshabilitado - Supabase no se utiliza

export const renderAdminPanel = (req, res) => {
  res.status(403).json({ error: "Panel de administración deshabilitado" });
};

export const getStats = (req, res) => {
  res.status(403).json({ error: "Panel de administración deshabilitado" });
};

export const getActivityLog = (req, res) => {
  res.status(403).json({ error: "Panel de administración deshabilitado" });
};

export const getUsers = (req, res) => {
  res.status(403).json({ error: "Panel de administración deshabilitado" });
};

export const getConsultas = (req, res) => {
  res.status(403).json({ error: "Panel de administración deshabilitado" });
};

export const getSubscriptions = (req, res) => {
  res.status(403).json({ error: "Panel de administración deshabilitado" });
};
