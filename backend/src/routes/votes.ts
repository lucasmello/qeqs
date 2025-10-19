import { Router } from "express";
import { z } from "zod";
import pool from "../database/db.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";

const router = Router();

const voteSchema = z.object({
  barId: z.number(),
});

// Get current votes (today's votes)
router.get("/current", authenticate, async (_req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id as bar_id,
        b.name as bar_name,
        COUNT(v.id) as vote_count,
        ARRAY_AGG(u.username) as voters
      FROM bars b
      LEFT JOIN votes v ON b.id = v.bar_id AND v.vote_date = CURRENT_DATE
      LEFT JOIN users u ON v.user_id = u.id
      GROUP BY b.id, b.name
      HAVING COUNT(v.id) > 0
      ORDER BY vote_count DESC, b.name
    `);

    res.json({ votes: result.rows });
  } catch (error) {
    console.error("Get votes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Vote for a bar
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { barId } = voteSchema.parse(req.body);

    // Check if bar exists
    const barCheck = await pool.query("SELECT id FROM bars WHERE id = $1", [
      barId,
    ]);
    if (barCheck.rows.length === 0) {
      return res.status(404).json({ error: "Bar not found" });
    }

    // Check if user already voted for this bar today
    const existingVote = await pool.query(
      "SELECT id FROM votes WHERE user_id = $1 AND bar_id = $2 AND vote_date = CURRENT_DATE",
      [req.userId, barId]
    );

    if (existingVote.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "You already voted for this bar today" });
    }

    // Create vote
    const result = await pool.query(
      "INSERT INTO votes (user_id, bar_id) VALUES ($1, $2) RETURNING *",
      [req.userId, barId]
    );

    res.status(201).json({ vote: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Vote error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove vote
router.delete("/:barId", authenticate, async (req: AuthRequest, res) => {
  try {
    const { barId } = req.params;

    const result = await pool.query(
      "DELETE FROM votes WHERE user_id = $1 AND bar_id = $2 AND vote_date = CURRENT_DATE RETURNING *",
      [req.userId, barId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vote not found" });
    }

    res.json({ message: "Vote removed successfully" });
  } catch (error) {
    console.error("Remove vote error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's votes for today
router.get("/my-votes", authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, b.name as bar_name 
       FROM votes v
       JOIN bars b ON v.bar_id = b.id
       WHERE v.user_id = $1 AND v.vote_date = CURRENT_DATE`,
      [req.userId]
    );

    res.json({ votes: result.rows });
  } catch (error) {
    console.error("Get my votes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
