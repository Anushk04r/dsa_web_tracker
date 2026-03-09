import { Router } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { Problem } from "../models/Problem";

const router = Router();

const createProblemSchema = z.object({
  title: z.string().min(1),
  link: z.string().url().optional(),
  source: z.enum(["leetcode", "gfg", "codeforces", "other"]).default("other"),
  difficulty: z.enum(["easy", "medium", "hard", "unknown"]).default("unknown"),
  tags: z.array(z.string()).optional(),
  status: z.enum(["unsolved", "attempted", "solved", "review"]).default("unsolved"),
  notes: z.string().optional(),
});

const fetchMetadataSchema = z.object({
  url: z.string().url(),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const parseResult = createProblemSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const problem = await Problem.create({
      ...parseResult.data,
      user: req.userId,
    });
    return res.status(201).json(problem);
  } catch (err) {
    console.error("Create problem error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const problems = await Problem.find({ user: req.userId }).sort({ createdAt: -1 });
    return res.json(problems);
  } catch (err) {
    console.error("List problems error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/fetch-metadata", requireAuth, async (req: AuthRequest, res) => {
  const parseResult = fetchMetadataSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const { url } = parseResult.data;
  const hostname = new URL(url).hostname;

  let title = "";
  let difficulty = "unknown";
  const tags: string[] = [];
  let source: "leetcode" | "gfg" | "codeforces" | "other" = "other";

  // Determine source
  if (hostname.includes("leetcode.com")) {
    source = "leetcode";
  } else if (hostname.includes("geeksforgeeks.org")) {
    source = "gfg";
  } else if (hostname.includes("codeforces.com")) {
    source = "codeforces";
  }

  try {
    // Fetch HTML with browser-like headers
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.google.com/",
      },
      timeout: 10000,
    });

    // Extract title using regex from <title> tag
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
      
      // Clean title based on source
      if (source === "leetcode") {
        // "Two Sum - LeetCode" -> "Two Sum"
        title = title.replace(/\s*-\s*LeetCode.*$/i, "").trim();
      } else if (source === "gfg") {
        // "Two Sum | GeeksforGeeks" -> "Two Sum"
        title = title.replace(/\s*\|\s*GeeksforGeeks.*$/i, "").trim();
        title = title.replace(/\s*-\s*GeeksforGeeks.*$/i, "").trim();
      }
    }

    // Extract difficulty (LeetCode only - search for CSS classes or JSON)
    if (source === "leetcode") {
      // Look for CSS classes like "text-difficulty-easy", "text-difficulty-medium", "text-difficulty-hard"
      const difficultyClassMatch = html.match(/text-difficulty-(easy|medium|hard)/i);
      if (difficultyClassMatch) {
        difficulty = difficultyClassMatch[1].toLowerCase();
      } else {
        // Look for JSON data like "difficulty": "Easy"
        const jsonMatch = html.match(/"difficulty"\s*:\s*"?(Easy|Medium|Hard)"?/i);
        if (jsonMatch) {
          difficulty = jsonMatch[1].toLowerCase();
        } else {
          // Look for any mention of difficulty in the HTML
          const diffText = html.match(/difficulty["\s:]+(easy|medium|hard)/i);
          if (diffText) {
            difficulty = diffText[1].toLowerCase();
          }
        }
      }
    }

    // Fallback: Extract title from URL if HTML parsing failed
    if (!title || title.length < 3) {
      if (source === "leetcode") {
        const urlMatch = url.match(/\/problems\/([^\/\?]+)/);
        if (urlMatch) {
          title = urlMatch[1]
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
      } else if (source === "gfg") {
        const urlMatch = url.match(/\/([^\/]+)-problem/);
        if (urlMatch) {
          title = urlMatch[1]
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
      }
    }

    // If still no title, return error
    if (!title || title.length < 3) {
      return res.status(400).json({
        message: "Could not extract problem title. Please enter manually.",
      });
    }

    return res.json({
      title,
      difficulty,
      tags,
      source,
    });
  } catch (err: any) {
    console.error("Fetch metadata error", err.message);
    
    // Handle 403/429 errors (LeetCode blocking)
    if (err.response?.status === 403 || err.response?.status === 429) {
      // Even if blocked, try to extract from URL as fallback
      if (source === "leetcode") {
        const urlMatch = url.match(/\/problems\/([^\/\?]+)/);
        if (urlMatch) {
          const extractedTitle = urlMatch[1]
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          
          return res.json({
            title: extractedTitle,
            difficulty: "unknown",
            tags: [],
            source: "leetcode",
          });
        }
      }
      
      return res.status(400).json({
        message: "LeetCode is blocking automated requests. Title extracted from URL - please fill difficulty manually.",
      });
    }
    
    if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      return res.status(400).json({
        message: "Could not connect to the website. Please check the URL and try again.",
      });
    }

    // For other errors, try URL extraction as fallback
    if (source === "leetcode") {
      const urlMatch = url.match(/\/problems\/([^\/\?]+)/);
      if (urlMatch) {
        const extractedTitle = urlMatch[1]
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        
        return res.json({
          title: extractedTitle,
          difficulty: "unknown",
          tags: [],
          source: "leetcode",
        });
      }
    }

    return res.status(500).json({
      message: "Failed to fetch problem details. Please enter manually.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { id } = req.params;
  const { notes } = req.body;

  try {
    const problem = await Problem.findOne({ _id: id, user: req.userId });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    problem.notes = notes || "";
    await problem.save();

    return res.json(problem);
  } catch (err) {
    console.error("Update problem error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;


