import { supabase } from "../utils/client.js";

export const saveFeedback = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, msg: "Mensaje vacío" });
    }

    const userId = req.user ? req.user.id : null; // tu middleware de auth debería llenar req.user

    const { error } = await supabase.from("feedback").insert([
      {
        message,
        user_id: userId, // null si es anónimo
      },
    ]);

    if (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, msg: "Error al guardar en BD" });
    }

    return res.json({ success: true, msg: "Sugerencia guardada con éxito" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, msg: "Error interno del servidor" });
  }
};
