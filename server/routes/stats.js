const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Mapea snake_case DB → camelCase frontend
function toStat(row) {
  return {
    date:             row.date,
    spendGoogle:      Number(row.spend_google),
    spendMeta:        Number(row.spend_meta),
    leadsGoogle:      Number(row.leads_google),
    leadsMeta:        Number(row.leads_meta),
    contactedGoogle:  Number(row.contacted_google),
    contactedMeta:    Number(row.contacted_meta),
    qualifiedGoogle:  Number(row.qualified_google),
    qualifiedMeta:    Number(row.qualified_meta),
    assignedGoogle:   Number(row.assigned_google),
    assignedMeta:     Number(row.assigned_meta),
    closedGoogle:     Number(row.closed_google),
    closedMeta:       Number(row.closed_meta),
    revenueGoogle:    Number(row.revenue_google),
    revenueMeta:      Number(row.revenue_meta),
  };
}

// GET /api/stats?brand=holding&start=YYYY-MM-DD&end=YYYY-MM-DD
router.get("/", async (req, res) => {
  const { brand, start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "start y end son requeridos" });
  }

  try {
    let rows;

    if (brand === "holding") {
      // Consolidar todas las marcas por fecha
      const result = await pool.query(
        `SELECT
           date,
           SUM(spend_google)     AS spend_google,
           SUM(spend_meta)       AS spend_meta,
           SUM(leads_google)     AS leads_google,
           SUM(leads_meta)       AS leads_meta,
           SUM(contacted_google) AS contacted_google,
           SUM(contacted_meta)   AS contacted_meta,
           SUM(qualified_google) AS qualified_google,
           SUM(qualified_meta)   AS qualified_meta,
           SUM(assigned_google)  AS assigned_google,
           SUM(assigned_meta)    AS assigned_meta,
           SUM(closed_google)    AS closed_google,
           SUM(closed_meta)      AS closed_meta,
           SUM(revenue_google)   AS revenue_google,
           SUM(revenue_meta)     AS revenue_meta
         FROM daily_stats
         WHERE date BETWEEN $1 AND $2
         GROUP BY date
         ORDER BY date ASC`,
        [start, end]
      );
      rows = result.rows;
    } else {
      const result = await pool.query(
        `SELECT * FROM daily_stats
         WHERE brand_id=$1 AND date BETWEEN $2 AND $3
         ORDER BY date ASC`,
        [brand, start, end]
      );
      rows = result.rows;
    }

    res.json(rows.map(toStat));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

module.exports = router;
