import React from "react";
import { type Task, BRANDS, TASK_MARKET_RATES } from "../data/mockData";

interface PDFReportProps {
  tasks: Task[];
  simulationDate: string;
}

export const PDFReport: React.FC<PDFReportProps> = ({ tasks, simulationDate }) => {
  // ── métricas generales ──
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

  const getBrandName = (bId: string) => BRANDS.find((b) => b.id === bId)?.name || bId;

  const fmtCLP = (val: number) =>
    "$" + Math.round(val).toLocaleString("es-CL");

  const todayStr = new Date(simulationDate + "T00:00:00").toLocaleDateString("es-CL", {
    year: "numeric", month: "long", day: "numeric",
  });

  const statusLabel: Record<Task["status"], string> = {
    backlog:     "Backlog",
    in_progress: "En Progreso",
    in_review:   "En Revisión",
    completed:   "Completado",
  };

  const statusBadge: Record<Task["status"], string> = {
    backlog:     "background:#f1f3f4;color:#5f6368;border:1px solid #dadce0",
    in_progress: "background:#fff3e0;color:#e65100;border:1px solid #ffcc02",
    in_review:   "background:#fffde7;color:#f57f17;border:1px solid #f9ab00",
    completed:   "background:#e6f4ea;color:#137333;border:1px solid #34a853",
  };

  const urgencyBadge: Record<string, string> = {
    alta:   "background:#fce8e6;color:#c5221f;border:1px solid #f28b82",
    media:  "background:#fef9e7;color:#b45309;border:1px solid #fbbf24",
    normal: "background:#f1f3f4;color:#5f6368;border:1px solid #dadce0",
  };

  // Métricas por marca
  const brandMetrics = BRANDS.map((b) => {
    const bt  = tasks.filter((t) => t.brandId === b.id);
    const done = bt.filter((t) => t.status === "completed").length;
    const cost = bt.reduce((s, t) => s + t.estimatedMarketCost, 0);
    return { brand: b, total: bt.length, done, cost };
  }).filter((m) => m.total > 0);

  // Ordenar: primero alta urgencia, luego media, luego normal; y por estado
  const statusOrder: Record<Task["status"], number> = {
    in_progress: 0, in_review: 1, backlog: 2, completed: 3,
  };
  const urgencyOrder: Record<string, number> = { alta: 0, media: 1, normal: 2 };

  const sortedTasks = [...tasks].sort((a, b) => {
    const uDiff = (urgencyOrder[a.urgency || "normal"] ?? 2) - (urgencyOrder[b.urgency || "normal"] ?? 2);
    if (uDiff !== 0) return uDiff;
    return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
  });

  return (
    <div className="print-only p-8 bg-white text-google-gray800 max-w-5xl mx-auto space-y-8 fade-in text-xs">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between border-b-2 border-google-blue pb-6">
        <div>
          <img
            src="https://jpedesign.cl/wp-content/uploads/2026/04/657703961_18039370931716598_5734186209565692188_n-Photoroom.png"
            alt="JPEdesign Logo"
            className="h-12 w-auto object-contain mb-2"
          />
          <h1 className="text-xl font-bold text-google-gray800 uppercase tracking-tight">
            Reporte SLA · Plan Performance 2026
          </h1>
          <p className="text-xs text-google-gray600">Estado de tareas y ahorro acumulado — Inversiones Almasur Holding</p>
        </div>
        <div className="text-right text-xs text-google-gray600">
          <div className="font-bold text-google-blue">JPEdesign Growth Consultancy</div>
          <div>jpedesign.cl</div>
          <div>Fecha de emisión: {todayStr}</div>
        </div>
      </div>

      {/* ── KPI RESUMEN PRINCIPAL ── */}
      <div>
        <h2 className="text-[9px] font-bold uppercase tracking-widest text-google-gray500 mb-3">Resumen General</h2>
        <div className="grid grid-cols-5 gap-3">
          {/* Total */}
          <div className="col-span-1 border border-google-gray300 rounded p-3 text-center bg-google-gray50">
            <div className="text-2xl font-bold text-google-gray800">{tasks.length}</div>
            <div className="text-[9px] text-google-gray500 uppercase font-bold mt-0.5">Total Tareas</div>
          </div>
          {/* Backlog */}
          <div className="border border-google-gray300 rounded p-3 text-center">
            <div className="text-2xl font-bold text-google-gray600">{byStatus.backlog}</div>
            <div className="text-[9px] text-google-gray500 uppercase font-bold mt-0.5">Backlog</div>
          </div>
          {/* En progreso */}
          <div className="border border-orange-200 rounded p-3 text-center bg-orange-50">
            <div className="text-2xl font-bold text-orange-600">{byStatus.in_progress}</div>
            <div className="text-[9px] text-orange-500 uppercase font-bold mt-0.5">En Progreso</div>
          </div>
          {/* En revisión */}
          <div className="border border-yellow-200 rounded p-3 text-center bg-yellow-50">
            <div className="text-2xl font-bold text-yellow-700">{byStatus.in_review}</div>
            <div className="text-[9px] text-yellow-600 uppercase font-bold mt-0.5">En Revisión</div>
          </div>
          {/* Completadas */}
          <div className="border border-green-300 rounded p-3 text-center bg-green-50">
            <div className="text-2xl font-bold text-green-700">{byStatus.completed}</div>
            <div className="text-[9px] text-green-600 uppercase font-bold mt-0.5">Completadas</div>
          </div>
        </div>
      </div>

      {/* ── MÉTRICAS FINANCIERAS + URGENCIA ── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Ahorro */}
        <div>
          <h2 className="text-[9px] font-bold uppercase tracking-widest text-google-gray500 mb-3">Impacto Financiero</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between border border-google-gray300 rounded p-3">
              <span className="text-google-gray600">Costo de mercado (pipeline completo)</span>
              <span className="font-bold text-google-gray800">{fmtCLP(allMarketCost)}</span>
            </div>
            <div className="flex items-center justify-between border border-green-300 rounded p-3 bg-green-50">
              <span className="text-green-700 font-semibold">Costo de mercado entregado</span>
              <span className="font-bold text-green-700">{fmtCLP(totalMarketCost)}</span>
            </div>
            <div className="flex items-center justify-between border border-google-blue border-opacity-30 rounded p-3 bg-google-blueLight">
              <span className="text-google-blue font-semibold">Ahorro neto vs. contratación externa</span>
              <span className="font-bold text-google-blue">
                {totalMarketCost > 0 ? fmtCLP(totalMarketCost) : "$0"}
              </span>
            </div>
          </div>
        </div>

        {/* Urgencia + marcas */}
        <div>
          <h2 className="text-[9px] font-bold uppercase tracking-widest text-google-gray500 mb-3">Distribución por Urgencia SLA</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between border border-red-200 rounded p-3 bg-red-50">
              <span className="text-red-700 font-semibold">🔴 Alta</span>
              <span className="font-bold text-red-700">{byUrgency.alta} tarea{byUrgency.alta !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center justify-between border border-yellow-200 rounded p-3 bg-yellow-50">
              <span className="text-yellow-700 font-semibold">🟡 Media</span>
              <span className="font-bold text-yellow-700">{byUrgency.media} tarea{byUrgency.media !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center justify-between border border-google-gray300 rounded p-3">
              <span className="text-google-gray600">⚪ Normal</span>
              <span className="font-bold text-google-gray700">{byUrgency.normal} tarea{byUrgency.normal !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RESUMEN POR MARCA ── */}
      {brandMetrics.length > 0 && (
        <div>
          <h2 className="text-[9px] font-bold uppercase tracking-widest text-google-gray500 mb-3">Distribución por Marca</h2>
          <table className="w-full border-collapse border border-google-gray300">
            <thead>
              <tr className="bg-google-gray100 text-[9px] uppercase tracking-wider text-google-gray600 font-bold border-b border-google-gray300">
                <th className="px-3 py-2 text-left border border-google-gray300">Marca</th>
                <th className="px-3 py-2 text-center border border-google-gray300">Total</th>
                <th className="px-3 py-2 text-center border border-google-gray300">Completadas</th>
                <th className="px-3 py-2 text-center border border-google-gray300">Avance</th>
                <th className="px-3 py-2 text-right border border-google-gray300">Costo Mercado</th>
              </tr>
            </thead>
            <tbody>
              {brandMetrics.map((m) => {
                const pct = m.total > 0 ? Math.round((m.done / m.total) * 100) : 0;
                return (
                  <tr key={m.brand.id} className="border-b border-google-gray200">
                    <td className="px-3 py-2 border border-google-gray300 font-semibold text-google-gray800">{m.brand.name}</td>
                    <td className="px-3 py-2 border border-google-gray300 text-center">{m.total}</td>
                    <td className="px-3 py-2 border border-google-gray300 text-center text-green-700 font-bold">{m.done}</td>
                    <td className="px-3 py-2 border border-google-gray300 text-center">{pct}%</td>
                    <td className="px-3 py-2 border border-google-gray300 text-right">{fmtCLP(m.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
