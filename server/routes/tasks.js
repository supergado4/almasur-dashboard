const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Mapea snake_case DB → camelCase frontend
function toTask(row) {
  return {
    id:                   row.id,
    title:                row.title,
    brandId:              row.brand_id,
    type:                 row.type,
    status:               row.status,
    urgency:              row.urgency,
    phase:                row.phase,
    assignedTo:           row.assigned_to,
    description:          row.description,
    requestDate:          row.request_date,
    completedDate:        row.completed_date,
    estimatedMarketCost:  row.estimated_market_cost,
  };
}

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at ASC"
    );
    res.json(result.rows.map(toTask));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

// POST /api/tasks
router.post("/", async (req, res) => {
  const { title, brandId, type, urgency, assignedTo, phase, requestDate, estimatedMarketCost } = req.body;

  if (!title || !brandId || !type) {
    return res.status(400).json({ error: "title, brandId y type son requeridos" });
  }

  const id = "task_" + Math.random().toString(36).substr(2, 9);
  const today = requestDate || new Date().toISOString().split("T")[0];

  try {
    const result = await pool.query(
      `INSERT INTO tasks
         (id, title, brand_id, type, status, urgency, phase, assigned_to, request_date, estimated_market_cost)
       VALUES ($1,$2,$3,$4,'backlog',$5,$6,$7,$8,$9)
       RETURNING *`,
      [id, title, brandId, type, urgency ?? "normal", phase ?? null, assignedTo ?? null, today, estimatedMarketCost ?? 0]
    );
    res.status(201).json(toTask(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

// PATCH /api/tasks/:id/status
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const valid = ["backlog", "in_progress", "in_review", "completed"];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  const completedDate = status === "completed"
    ? new Date().toISOString().split("T")[0]
    : null;

  try {
    const result = await pool.query(
      `UPDATE tasks SET status=$1, completed_date=$2 WHERE id=$3 RETURNING *`,
      [status, completedDate, id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(toTask(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

// PUT /api/tasks/:id  — actualiza todos los campos
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, brandId, type, status, urgency, phase, assignedTo, description, completedDate, estimatedMarketCost } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks SET
         title=$1, brand_id=$2, type=$3, status=$4, urgency=$5, phase=$6,
         assigned_to=$7, description=$8, completed_date=$9, estimated_market_cost=$10
       WHERE id=$11 RETURNING *`,
      [title, brandId, type, status, urgency, phase, assignedTo, description, completedDate ?? null, estimatedMarketCost, id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(toTask(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar tarea" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar tarea" });
  }
});

module.exports = router;
