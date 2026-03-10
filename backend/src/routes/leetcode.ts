import { Router } from "express";
import axios from "axios";
import { User } from "../models/User";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const LEETCODE_GQL_URL = "https://leetcode.com/graphql";

async function fetchStats(req: AuthRequest, res: any) {
    let username = req.params.username;

    if (!username) {
        const user = await User.findById(req.userId);
        username = user?.leetcodeUsername || "";
    }

    if (!username) {
        return res.status(400).json({ message: "LeetCode username not found" });
    }

    try {
        const query = `
      query userProblemsSolved($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          problemsSolvedBeatsStats {
            difficulty
            percentage
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

        const response = await axios.post(LEETCODE_GQL_URL, {
            query,
            variables: { username },
        });

        if (response.data.errors) {
            return res.status(404).json({ message: "User not found on LeetCode" });
        }

        return res.json(response.data.data);
    } catch (err: any) {
        console.error("LeetCode stats error", err);
        return res.status(500).json({ message: "Failed to fetch LeetCode statistics" });
    }
}

async function fetchCalendar(req: AuthRequest, res: any) {
    let username = req.params.username;

    if (!username) {
        const user = await User.findById(req.userId);
        username = user?.leetcodeUsername || "";
    }

    if (!username) {
        return res.status(400).json({ message: "LeetCode username not found" });
    }

    try {
        const query = `
      query userCalendar($username: String!, $year: Int) {
        matchedUser(username: $username) {
          userCalendar(year: $year) {
            activeYears
            streak
            totalActiveDays
            dccBadges {
              timestamp
              badge {
                name
                icon
              }
            }
            submissionCalendar
          }
        }
      }
    `;

        const response = await axios.post(LEETCODE_GQL_URL, {
            query,
            variables: { username },
        });

        if (response.data.errors) {
            return res.status(404).json({ message: "User not found on LeetCode" });
        }

        const calendarData = response.data.data.matchedUser.userCalendar;
        if (calendarData.submissionCalendar) {
            calendarData.submissionCalendar = JSON.parse(calendarData.submissionCalendar);
        }

        return res.json(calendarData);
    } catch (err: any) {
        console.error("LeetCode calendar error", err);
        return res.status(500).json({ message: "Failed to fetch LeetCode calendar" });
    }
}

router.get("/stats", requireAuth, fetchStats as any);
router.get("/stats/:username", requireAuth, fetchStats as any);
router.get("/calendar", requireAuth, fetchCalendar as any);
router.get("/calendar/:username", requireAuth, fetchCalendar as any);

export default router;
