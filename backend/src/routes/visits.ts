import { Router } from 'express';
import { z } from 'zod';
import pool from '../database/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

const visitSchema = z.object({
  barId: z.number(),
  visitDate: z.string(),
  notes: z.string().optional(),
});

// Get all visits
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.*,
        b.name as bar_name,
        b.address as bar_address,
        u.username as created_by_username
      FROM visits v
      JOIN bars b ON v.bar_id = b.id
      LEFT JOIN users u ON v.created_by = u.id
      ORDER BY v.visit_date DESC
    `);

    res.json({ visits: result.rows });
  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get visits by date range
router.get('/range', authenticate, async (req: AuthRequest, res) => {
  try {
    const { start, end } = req.query;

    const result = await pool.query(`
      SELECT 
        v.*,
        b.name as bar_name,
        b.address as bar_address,
        u.username as created_by_username
      FROM visits v
      JOIN bars b ON v.bar_id = b.id
      LEFT JOIN users u ON v.created_by = u.id
      WHERE v.visit_date BETWEEN $1 AND $2
      ORDER BY v.visit_date DESC
    `, [start, end]);

    res.json({ visits: result.rows });
  } catch (error) {
    console.error('Get visits by range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create visit
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { barId, visitDate, notes } = visitSchema.parse(req.body);

    // Check if bar exists
    const barCheck = await pool.query('SELECT id FROM bars WHERE id = $1', [barId]);
    if (barCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Bar not found' });
    }

    // Check if visit already exists for this bar and date
    const existingVisit = await pool.query(
      'SELECT id FROM visits WHERE bar_id = $1 AND visit_date = $2',
      [barId, visitDate]
    );

    if (existingVisit.rows.length > 0) {
      return res.status(400).json({ error: 'Visit already recorded for this date' });
    }

    // Create visit
    const result = await pool.query(
      'INSERT INTO visits (bar_id, visit_date, notes, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [barId, visitDate, notes, req.userId]
    );

    res.status(201).json({ visit: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update visit
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await pool.query(
      'UPDATE visits SET notes = $1 WHERE id = $2 RETURNING *',
      [notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({ visit: result.rows[0] });
  } catch (error) {
    console.error('Update visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete visit
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM visits WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    console.error('Delete visit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

