import { Router } from "express";
import axios from "axios";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { Problem } from "../models/Problem";
import { Session } from "../models/Session";

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1),
});

async function buildUserSummary(userId: string): Promise<string> {
  const [problems, sessions] = await Promise.all([
    Problem.find({ user: userId }),
    Session.find({ user: userId }),
  ]);

  const totalSolved = problems.filter((p) => p.status === "solved").length;
  const byDifficulty: Record<string, number> = { easy: 0, medium: 0, hard: 0, unknown: 0 };
  for (const p of problems) {
    byDifficulty[p.difficulty] = (byDifficulty[p.difficulty] ?? 0) + 1;
  }

  const totalSessions = sessions.length;

  return [
    `User has solved ${totalSolved} problems in total.`,
    `By difficulty: easy=${byDifficulty.easy}, medium=${byDifficulty.medium}, hard=${byDifficulty.hard}.`,
    `Total practice sessions: ${totalSessions}.`,
    `Use this context to tailor explanations and suggestions to the user's level.`,
  ].join(" ");
}

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parseResult = chatSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid data" });
  }

  if (!req.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { message } = parseResult.data;

  const chatbotUrl = process.env.CHATBOT_URL || "http://localhost:8000/chat";

  try {
    const userSummary = await buildUserSummary(req.userId);

    const response = await axios.post(chatbotUrl, {
      message,
      user_summary: userSummary,
    });

    return res.json(response.data);
  } catch (err) {
    console.error("Chatbot proxy error", err);
    return res.status(500).json({ message: "Failed to contact chatbot service" });
  }
});

export default router;


