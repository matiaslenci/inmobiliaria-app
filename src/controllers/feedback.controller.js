// Feedback deshabilitado - Supabase no se utiliza

export const saveFeedback = (req, res) => {
  return res.status(403).json({
    success: false,
    msg: "La función de feedback está deshabilitada en esta aplicación",
  });
};
