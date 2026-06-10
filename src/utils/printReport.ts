import type { Task } from "../data/mockData";
import { BRANDS } from "../data/mockData";

function fmtCLP(val: number): string {
  return "$" + Math.round(val).toLocaleString("es-CL");
}

function getBrandName(bId: string): string {
  return BRANDS.find((b) => b.id === bId)?.name ?? bId;
}

export function printTaskReport(tasks: Task[], simulationDate: string): void {
  const todayStr = new Date(simulationDate + "T00:00:00").toLocaleDateString("es-CL", {
    year: "numeric", month: "long", day: "numeric",
  });

  const byStatus = {
    backlog:     tasks.filter((t) => t.status === "backlog").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    in_review:   tasks.filter((t) => t.status === "in_review").length,
    completed:   tasks.filter((t) => t.status === "completed").length,
  };

  const completedTasks  = tasks.filter((t) => t.status === "completed");
  const totalMarketCost = completedTasks.reduce((sum, t) => sum + t.estimatedMarketCost, 0);
  const allMarketCost   = tasks.reduce((sum, t) => sum + t.estimatedMarketCost, 0);

  const byUrgency = {
    alta:   tasks.filter((t) => t.urgency === "alta").length,
    media:  tasks.filter((t) => t.urgency === "media").length,
    normal: tasks.filter((t) => !t.urgency || t.urgency === "normal").length,
  };

  const brandMetrics = BRANDS.map((b) => {
    const bt   = tasks.filter((t) => t.brandId === b.id);
    const done = bt.filter((t) => t.status === "completed").length;
    const cost = bt.reduce((s, t) => s + t.estimatedMarketCost, 0);
    return { brand: b, total: bt.length, done, cost };
  }).filter((m) => m.total > 0);

  const statusOrder: Record<Task["status"], number> = {
    in_progress: 0, in_review: 1, backlog: 2, completed: 3,
  };
  const urgencyOrder: Record<string, number> = { alta: 0, media: 1, normal: 2 };
  const sortedTasks = [...tasks].sort((a, b) => {
    const uDiff = (urgencyOrder[a.urgency ?? "normal"] ?? 2) - (urgencyOrder[b.urgency ?? "normal"] ?? 2);
    if (uDiff !== 0) return uDiff;
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  });

  const statusLabel: Record<Task["status"], string> = {
    backlog: "Backlog", in_progress: "En Progreso", in_review: "En Revisión", completed: "Completado",
  };
  const statusStyle: Record<Task["status"], string> = {
    backlog:     "background:#f1f3f4;color:#5f6368;border:1px solid #dadce0",
    in_progress: "background:#fff3e0;color:#e65100;border:1px solid #ffcc02",
    in_review:   "background:#fffde7;color:#f57f17;border:1px solid #f9ab00",
    completed:   "background:#e6f4ea;color:#137333;border:1px solid #34a853",
  };
  const urgencyStyle: Record<string, string> = {
    alta:   "background:#fce8e6;color:#c5221f;border:1px solid #f28b82",
    media:  "background:#fef9e7;color:#b45309;border:1px solid #fbbf24",
    normal: "background:#f1f3f4;color:#5f6368;border:1px solid #dadce0",
  };

  /* ── HTML Sections ───────────────────────────────────────────────────── */

  const brandRows = brandMetrics.map((m) => {
    const pct = m.total > 0 ? Math.round((m.done / m.total) * 100) : 0;
    return `<tr>
      <td style="padding:6px 10px;border:1px solid #dadce0;font-weight:600">${m.brand.name}</td>
      <td style="padding:6px 10px;border:1px solid #dadce0;text-align:center">${m.total}</td>
      <td style="padding:6px 10px;border:1px solid #dadce0;text-align:center;color:#137333;font-weight:700">${m.done}</td>
      <td style="padding:6px 10px;border:1px solid #dadce0">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="flex:1;background:#dadce0;border-radius:4px;height:5px">
            <div style="background:#1a73e8;height:5px;border-radius:4px;width:${pct}%"></div>
          </div>
          <span style="font-size:9px;font-weight:700;color:#5f6368;min-width:28px">${pct}%</span>
        </div>
      </td>
      <td style="padding:6px 10px;border:1px solid #dadce0;text-align:right;font-weight:500">${fmtCLP(m.cost)}</td>
    </tr>`;
  }).join("");

  const taskRows = sortedTasks.map((t) => {
    const urg = t.urgency ?? "normal";
    const urgLabel = urg === "alta" ? "🔴 Alta" : urg === "media" ? "🟡 Media" : "Normal";
    const titleHtml = t.status === "completed"
      ? `<span style="text-decoration:line-through;opacity:0.5">${t.title}</span>`
      : t.title;
    return `<tr>
      <td style="padding:6px 10px;border:1px solid #dadce0;font-weight:500">${titleHtml}</td>
      <td style="padding:6px 10px;border:1px solid #dadce0;color:#5f6368">${getBrandName(t.brandId)}</td>
      <td style="padding:6px 10px;border:1px solid #dadce0">
        <span style="background:#f1f3f4;border:1px solid #dadce0;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:600">${t.type}</span>
      </td>
      <td style="padding:6px 10px;border:1px solid #dadce0;text-align:center">
        <span style="${urgencyStyle[urg]};padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase">${urgLabel}</span>
      </td>
      <td style="padding:6px 10px;border:1px solid #dadce0;text-align:center">
        <span style="${statusStyle[t.status]};padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase;white-space:nowrap">${statusLabel[t.status]}</span>
      </td>
      <td style="padding:6px 10px;border:1px solid #dadce0;color:#5f6368;font-size:10px">${t.assignedTo ?? "—"}</td>
      <td style="padding:6px 10px;border:1px solid #dadce0;text-align:right;font-weight:500">${fmtCLP(t.estimatedMarketCost)}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte SLA · Plan Performance 2026 — Almasur</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #3c4043; background: white; padding: 32px; }
    h2 { font-size: 9px; font-weight: 700; color: #80868b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f3f4; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #5f6368; font-weight: 700; padding: 7px 10px; border: 1px solid #dadce0; }
    @media print {
      body { padding: 16px; }
      .no-break { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a73e8;padding-bottom:18px;margin-bottom:22px">
    <div>
      <img src="https://jpedesign.cl/wp-content/uploads/2026/04/657703961_18039370931716598_5734186209565692188_n-Photoroom.png" alt="JPEdesign" style="height:38px;margin-bottom:8px;display:block">
      <div style="font-size:17px;font-weight:700;color:#202124;text-transform:uppercase;letter-spacing:0.5px">Reporte SLA · Plan Performance 2026</div>
      <div style="color:#5f6368;margin-top:4px;font-size:11px">Estado de tareas y ahorro acumulado — Inversiones Almasur Holding</div>
    </div>
    <div style="text-align:right;font-size:11px;color:#5f6368">
      <div style="font-weight:700;color:#1a73e8">JPEdesign Growth Consultancy</div>
      <div>jpedesign.cl</div>
      <div>Fecha de emisión: ${todayStr}</div>
    </div>
  </div>

  <!-- KPIs -->
  <div class="no-break" style="margin-bottom:24px">
    <h2>Resumen General</h2>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">
      <div style="border:1px solid #dadce0;border-radius:6px;padding:14px;text-align:center;background:#f8f9fa">
        <div style="font-size:26px;font-weight:700;color:#202124">${tasks.length}</div>
        <div style="font-size:9px;color:#5f6368;font-weight:700;text-transform:uppercase;margin-top:3px">Total Tareas</div>
      </div>
      <div style="border:1px solid #dadce0;border-radius:6px;padding:14px;text-align:center">
        <div style="font-size:26px;font-weight:700;color:#5f6368">${byStatus.backlog}</div>
        <div style="font-size:9px;color:#80868b;font-weight:700;text-transform:uppercase;margin-top:3px">Backlog</div>
      </div>
      <div style="border:1px solid #ffcc02;border-radius:6px;padding:14px;text-align:center;background:#fff3e0">
        <div style="font-size:26px;font-weight:700;color:#e65100">${byStatus.in_progress}</div>
        <div style="font-size:9px;color:#e65100;font-weight:700;text-transform:uppercase;margin-top:3px">En Progreso</div>
      </div>
      <div style="border:1px solid #f9ab00;border-radius:6px;padding:14px;text-align:center;background:#fffde7">
        <div style="font-size:26px;font-weight:700;color:#f57f17">${byStatus.in_review}</div>
        <div style="font-size:9px;color:#f57f17;font-weight:700;text-transform:uppercase;margin-top:3px">En Revisión</div>
      </div>
      <div style="border:1px solid #34a853;border-radius:6px;padding:14px;text-align:center;background:#e6f4ea">
        <div style="font-size:26px;font-weight:700;color:#137333">${byStatus.completed}</div>
        <div style="font-size:9px;color:#137333;font-weight:700;text-transform:uppercase;margin-top:3px">Completadas</div>
      </div>
    </div>
  </div>

  <!-- FINANCIERO + URGENCIA -->
  <div class="no-break" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
    <div>
      <h2>Impacto Financiero</h2>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;justify-content:space-between;border:1px solid #dadce0;border-radius:6px;padding:10px 14px">
          <span style="color:#5f6368">Costo de mercado (pipeline total)</span>
          <span style="font-weight:700">${fmtCLP(allMarketCost)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;border:1px solid #34a853;border-radius:6px;padding:10px 14px;background:#e6f4ea">
          <span style="color:#137333;font-weight:600">Costo de mercado entregado</span>
          <span style="font-weight:700;color:#137333">${fmtCLP(totalMarketCost)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;border:1px solid rgba(26,115,232,0.4);border-radius:6px;padding:10px 14px;background:#e8f0fe">
          <span style="color:#1a73e8;font-weight:600">Ahorro neto vs. contratación externa</span>
          <span style="font-weight:700;color:#1a73e8">${fmtCLP(totalMarketCost)}</span>
        </div>
      </div>
    </div>
    <div>
      <h2>Distribución por Urgencia SLA</h2>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;justify-content:space-between;border:1px solid #f28b82;border-radius:6px;padding:10px 14px;background:#fce8e6">
          <span style="color:#c5221f;font-weight:600">🔴 Alta</span>
          <span style="font-weight:700;color:#c5221f">${byUrgency.alta} tarea${byUrgency.alta !== 1 ? "s" : ""}</span>
        </div>
        <div style="display:flex;justify-content:space-between;border:1px solid #fbbf24;border-radius:6px;padding:10px 14px;background:#fef9e7">
          <span style="color:#b45309;font-weight:600">🟡 Media</span>
          <span style="font-weight:700;color:#b45309">${byUrgency.media} tarea${byUrgency.media !== 1 ? "s" : ""}</span>
        </div>
        <div style="display:flex;justify-content:space-between;border:1px solid #dadce0;border-radius:6px;padding:10px 14px">
          <span style="color:#5f6368">⚪ Normal</span>
          <span style="font-weight:700;color:#5f6368">${byUrgency.normal} tarea${byUrgency.normal !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- POR MARCA -->
  ${brandMetrics.length > 0 ? `
  <div class="no-break" style="margin-bottom:24px">
    <h2>Distribución por Marca</h2>
    <table>
      <thead>
        <tr>
          <th style="text-align:left">Marca</th>
          <th>Total</th>
          <th>Completadas</th>
          <th>Avance</th>
          <th style="text-align:right">Costo Mercado</th>
        </tr>
      </thead>
      <tbody>${brandRows}</tbody>
    </table>
  </div>` : ""}

  <!-- TABLA COMPLETA -->
  <div>
    <h2>Detalle Completo de Tareas (${tasks.length})</h2>
    <table>
      <thead>
        <tr>
          <th style="text-align:left">Tarea</th>
          <th style="text-align:left">Marca</th>
          <th style="text-align:left">Tipo</th>
          <th>Urgencia</th>
          <th>Estado</th>
          <th style="text-align:left">Asignado</th>
          <th style="text-align:right">Costo Mercado</th>
        </tr>
      </thead>
      <tbody>
        ${taskRows}
        <tr style="background:#f1f3f4;font-weight:700;border-top:2px solid #9aa0a6">
          <td colspan="6" style="padding:8px 10px;border:1px solid #dadce0;text-align:right;font-size:9px;text-transform:uppercase;color:#5f6368">
            Total pipeline (${tasks.length} tareas)
          </td>
          <td style="padding:8px 10px;border:1px solid #dadce0;text-align:right">${fmtCLP(allMarketCost)}</td>
        </tr>
        <tr style="background:#e6f4ea;font-weight:700">
          <td colspan="6" style="padding:8px 10px;border:1px solid #dadce0;text-align:right;font-size:9px;text-transform:uppercase;color:#137333">
            Entregado (${byStatus.completed} completadas)
          </td>
          <td style="padding:8px 10px;border:1px solid #dadce0;text-align:right;color:#137333">${fmtCLP(totalMarketCost)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- FIRMA -->
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #dadce0;display:flex;justify-content:space-between;font-size:11px;color:#5f6368">
    <div>
      <div style="font-weight:700;color:#202124">Juan F. Pérez</div>
      <div>Growth Architect · JPEdesign SpA</div>
    </div>
    <div style="text-align:right">
      <div style="font-weight:700">Conforme cliente</div>
      <div style="border-bottom:1px solid #9aa0a6;width:180px;margin:28px 0 4px auto"></div>
      <div>Carla Medici · Inversiones Almasur</div>
    </div>
  </div>

  <script>
    window.onload = function () { setTimeout(function () { window.print(); }, 250); };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Permite ventanas emergentes en tu navegador para generar el PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
