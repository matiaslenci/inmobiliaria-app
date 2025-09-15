import { supabase } from "../utils/client.js";

// Renderiza la página principal del panel de administración
export const renderAdminPanel = async (req, res) => {
  try {
    res.render("admin");
  } catch (error) {
    console.error("Error al renderizar panel de admin:", error);
    res.status(500).send("Error interno del servidor");
  }
};

// Obtiene estadísticas para el dashboard
export const getStats = async (req, res) => {
  try {
    // Obtener total de usuarios
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact" });

    // Obtener consultas del mes actual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthlyQueries } = await supabase
      .from("consultas")
      .select("*", { count: "exact" })
      .gte("created_at", startOfMonth.toISOString());

    // Obtener suscripciones activas
    const { count: activeSubscriptions } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact" })
      .eq("status", "active");

    res.json({
      totalUsers: totalUsers || 0,
      monthlyQueries: monthlyQueries || 0,
      activeSubscriptions: activeSubscriptions || 0,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};

// Obtiene el registro de actividades recientes
export const getActivityLog = async (req, res) => {
  try {
    const { data: activities, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({
      activities: activities.map((activity) => ({
        date: activity.created_at,
        action: activity.action,
        user: activity.user_email,
      })),
    });
  } catch (error) {
    console.error("Error al obtener registro de actividades:", error);
    res.status(500).json({ error: "Error al obtener registro de actividades" });
  }
};

// Obtiene la lista de usuarios
export const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.render("admin/users", { users });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).send("Error al obtener usuarios");
  }
};

// Obtiene la lista de consultas
export const getConsultas = async (req, res) => {
  try {
    const { data: consultas, error } = await supabase
      .from("consultas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.render("admin/consultas", { consultas });
  } catch (error) {
    console.error("Error al obtener consultas:", error);
    res.status(500).send("Error al obtener consultas");
  }
};

// Obtiene la lista de suscripciones
export const getSubscriptions = async (req, res) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.render("admin/subscriptions", { subscriptions });
  } catch (error) {
    console.error("Error al obtener suscripciones:", error);
    res.status(500).send("Error al obtener suscripciones");
  }
};
