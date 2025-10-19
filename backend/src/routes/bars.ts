import { Router } from "express";
import { z } from "zod";
import pool from "../database/db.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";

const router = Router();

const barSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().optional(),
  description: z.string().optional(),
});

// Get all bars
router.get("/", authenticate, async (_req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        u.username as created_by_username,
        COALESCE(v.vote_count, 0) as current_votes
      FROM bars b
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN (
        SELECT bar_id, COUNT(*) as vote_count
        FROM votes
        WHERE vote_date = CURRENT_DATE
        GROUP BY bar_id
      ) v ON b.id = v.bar_id
      ORDER BY b.name
    `);

    res.json({ bars: result.rows });
  } catch (error) {
    console.error("Get bars error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get bar by ID
router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        b.*,
        u.username as created_by_username,
        COALESCE(v.vote_count, 0) as current_votes
      FROM bars b
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN (
        SELECT bar_id, COUNT(*) as vote_count
        FROM votes
        WHERE vote_date = CURRENT_DATE
        GROUP BY bar_id
      ) v ON b.id = v.bar_id
      WHERE b.id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bar not found" });
    }

    res.json({ bar: result.rows[0] });
  } catch (error) {
    console.error("Get bar error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create bar
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, address, description } = barSchema.parse(req.body);

    const result = await pool.query(
      "INSERT INTO bars (name, address, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, address, description, req.userId]
    );

    res.status(201).json({ bar: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Create bar error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update bar
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, address, description } = barSchema.parse(req.body);

    const result = await pool.query(
      "UPDATE bars SET name = $1, address = $2, description = $3 WHERE id = $4 RETURNING *",
      [name, address, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bar not found" });
    }

    res.json({ bar: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Update bar error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete bar
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM bars WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bar not found" });
    }

    res.json({ message: "Bar deleted successfully" });
  } catch (error) {
    console.error("Delete bar error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
