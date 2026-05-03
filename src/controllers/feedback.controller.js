import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEEDBACK_FILE = path.join(__dirname, "../../feedback.jsonl");

export const saveFeedback = (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ success: false, msg: "Mensaje vacío" });
  }

  try {
    const entry = JSON.stringify({
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });
    fs.appendFileSync(FEEDBACK_FILE, entry + "\n");
    return res.json({ success: true, msg: "Sugerencia guardada con éxito" });
  } catch (err) {
    console.error("Error guardando feedback:", err);
    return res.status(500).json({ success: false, msg: "Error al guardar sugerencia" });
  }
};
