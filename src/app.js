import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import consultaRoutes from "./routes/consulta.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import consultaSauceRoutes from "./routes/consulta-sauce.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "../public")));

app.use("/", consultaRoutes);
app.use("/", consultaSauceRoutes);
app.use("/", feedbackRoutes);

export default app;
