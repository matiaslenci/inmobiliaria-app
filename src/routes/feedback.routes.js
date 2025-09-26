import express from "express";
import { saveFeedback } from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/feedback", saveFeedback);

export default router;
