import React, { useState } from "react";
import { type Task, type TaskPhase, type TaskUrgency, BRANDS, TEAM_MEMBERS, TASK_MARKET_RATES } from "../data/mockData";
import { KanbanSquare, Plus, FileText, ClipboardList, Trash2, CheckCircle2, User, AlertTriangle, AlertCircle, MinusCircle, Building2, BarChart3, X } from "lucide-react";

// ── Plan Performance 2026 — config de fases ──
const PLAN_PHASES: { id: TaskPhase; label: string; sublabel: string; color: string; bg: string; border: string }[] = [
  { id: "quick_win", label: "Semana 1–2", sublabel: "Quick Wins", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300" },
  { id: "mes1",      label: "Mes 1",      sublabel: "Estructuración", color: "text-blue-700",  bg: "bg-blue-50",   border: "border-blue-300"   },
  { id: "mes2_3",    label: "Mes 2–3",    sublabel: "Escala",        color: "text-green-700", bg: "bg-green-50",  border: "border-green-300"  },
];

// Health status display helpers
const HEALTH_CONFIG: Record<string, { label: string; color: string; bg: string; iconKey: "critico" | "limitado" | "sin_pauta" | "activo" }> = {
  critico:   { label: "CRÍTICO",   color: "text-red-700",    bg: "bg-red-50 border-red-300",       iconKey: "critico"   },
  limitado:  { label: "LIMITADO",  color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-300", iconKey: "limitado"  },
  sin_pauta: { label: "SIN PAUTA", color: "text-gray-600",   bg: "bg-gray-50 border-gray-300",     iconKey: "sin_pauta" },
  activo:    { label: "ACTIVO",    color: "text-green-700",  bg: "bg-green-50 border-green-300",   iconKey: "activo"    },
};

const HEALTH_ICON_MAP = {
  critico:   AlertTriangle,
  limitado:  AlertCircle,
  sin_pauta: MinusCircle,
  activo:    CheckCircle2,
} as const;

interface TaskPanelProps {
  tasks: Task[];
  onAddTask: (task: { title: string; brandId: string; type: Task["type"]; assignedTo?: string; urgency?: Task["urgency"] }) => void;
  onUpdateStatus: (taskId: string, status: Task["status"]) => void;
  onUpdateTaskDetails: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onPrintReport: () => void;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({
  tasks,
  onAddTask,
  onUpdateStatus,
  onUpdateTaskDetails,
  onDeleteTask,
  onPrintReport,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [brandId, setBrandId] = useState(BRANDS[0].id);
  const [type, setType] = useState<Task["type"]>("Banner");
  const [newAssignedTo, setNewAssignedTo] = useState<string>(TEAM_MEMBERS[0]);
  const [newUrgency, setNewUrgency] = useState<TaskUrgency>("normal");

  // Drag and Drop active column state
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Task Details Modal states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBrandId, setEditBrandId] = useState("");
  const [editType, setEditType] = useState<Task["type"]>("Banner");
  const [editStatus, setEditStatus] = useState<Task["status"]>("backlog");
  const [editMarketCost, setEditMarketCost] = useState(0);
  const [editAssignedTo, setEditAssignedTo] = useState("");

  // Calcular ahorros acumulados
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const totalSavings = completedTasks.reduce((sum, t) => sum + t.estimatedMarketCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title,
      brandId,
      type,
      assignedTo: newAssignedTo,
      urgency: newUrgency,
    });

    setTitle("");
    setNewUrgency("normal");
    setShowAddForm(false);
  };

  const handleOpenDetailModal = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditBrandId(task.brandId);
    setEditType(task.type);
    setEditStatus(task.status);
    setEditMarketCost(task.estimatedMarketCost);
    setEditAssignedTo(task.assignedTo || "Equipo Growth JPE");
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    onUpdateTaskDetails({
      ...selectedTask,
      title: editTitle,
      description: editDescription,
      brandId: editBrandId,
      type: editType,
      status: editStatus,
      estimatedMarketCost: editMarketCost,
      assignedTo: editAssignedTo,
    });

    setSelectedTask(null);
  };

  const getBrandName = (bId: string) => {
    return BRANDS.find((b) => b.id === bId)?.name || bId;
  };

  // Filtrar tareas por columnas
  const columns = [
    { id: "backlog", name: "Backlog / Cola", bg: "bg-google-gray100" },
    { id: "in_progress", name: "En Proceso", bg: "bg-google-blueLight text-google-blue" },
    { id: "in_review", name: "En Revisión", bg: "bg-google-yellowLight text-google-yellow" },
    { id: "completed", name: "Terminado / Guardado", bg: "bg-google-greenLight text-google-green" },
  ] as const;

  const fmtCLP = (val: number) => {
    return "$" + Math.round(val).toLocaleString("es-CL");
  };

  // ── MANEJADORES DRAG AND DROP (HTML5) ──
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColId(null);
  };

  const handleDrop = (e: React.DragEvent, colId: Task["status"]) => {
    e.preventDefault();
    setDragOverColId(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onUpdateStatus(taskId, colId);
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in no-print bg-google-gray50 min-h-screen">
      {/* SECTION TITLE & PDF ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-google-gray300">
        <div className="flex items-center gap-2">
          <KanbanSquare className="w-5 h-5 text-google-blue" />
          <h2 className="text-lg font-medium text-google-gray800">SLA · Plan Performance 2026 — Almasur Holding</h2>
        </div>

        <button
          onClick={onPrintReport}
          className="bg-white border border-google-gray300 hover:border-google-blue text-google-gray700 hover:text-google-blue rounded px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <FileText className="w-4 h-4 text-google-gray600 hover:text-google-blue" />
          <span>Descargar Resumen Ahorros (PDF)</span>
        </button>
      </div>

      {/* ── PLAN PERFORMANCE 2026 — ESTADO POR MARCA ── */}
      <div className="bg-white border border-google-gray300 rounded overflow-hidden">
        <div className="px-5 py-3 border-b border-google-gray300 bg-google-gray50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-google-blue" />
            <span className="text-xs font-bold text-google-gray800 uppercase tracking-wider">Plan Performance 2026 · Diagnóstico por Marca</span>
          </div>
          <span className="text-[10px] text-google-gray500 font-medium">Holding Almasur · 5 marcas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-google-gray200">
          {BRANDS.map((brand) => {
            const cfg = HEALTH_CONFIG[brand.healthStatus] || HEALTH_CONFIG.activo;
            const IconComp = HEALTH_ICON_MAP[cfg.iconKey];
            return (
              <div key={brand.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-google-gray500 flex-shrink-0" />
                  <span className="text-xs font-bold text-google-gray800 truncate">{brand.name}</span>
                </div>
                <span className="text-[9px] text-google-gray500 uppercase tracking-wide font-medium">{brand.vertical}</span>
                <div className={`inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                  <IconComp className="w-2.5 h-2.5" />
                  {cfg.label}
                </div>
                <p className="text-[10px] text-google-gray600 leading-relaxed line-clamp-3">{brand.healthNote}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PRIORIZACIÓN DEL PLAN 2026 POR FASE ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_PHASES.map((phase) => {
          const phaseTasks = tasks.filter((t) => t.phase === phase.id);
          const done = phaseTasks.filter((t) => t.status === "completed").length;
          const total = phaseTasks.length;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <div key={phase.id} className={`border rounded p-4 ${phase.bg} ${phase.border}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${phase.color}`}>{phase.label}</span>
                  <p className={`text-sm font-bold ${phase.color}`}>{phase.sublabel}</p>
                </div>
                <span className={`text-xs font-bold ${phase.color}`}>{done}/{total}</span>
              </div>
              <div className="w-full bg-white bg-opacity-60 rounded-full h-1.5 mb-3">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${phase.id === "quick_win" ? "bg-orange-500" : phase.id === "mes1" ? "bg-blue-500" : "bg-green-500"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="space-y-1.5">
                {phaseTasks.map((t) => {
                  const brand = BRANDS.find((b) => b.id === t.brandId);
                  const statusDot: Record<Task["status"], string> = {
                    backlog: "bg-gray-400",
                    in_progress: "bg-orange-400",
                    in_review: "bg-yellow-400",
                    completed: "bg-green-500",
                  };
                  return (
                    <div key={t.id} className="flex items-start gap-2">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[t.status]}`} />
                      <span className={`text-[10px] leading-snug ${t.status === "completed" ? "line-through opacity-50" : "text-google-gray800"}`}>
                        <span className="font-semibold">{brand?.name} · </span>{t.title.split("·").slice(-1)[0]?.trim() || t.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* REQUEST ADD FORM BLOCK */}
      <div className="bg-white border border-google-gray300 rounded overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-google-gray300 bg-white flex items-center justify-between">
          <span className="text-xs font-semibold text-google-gray700 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-google-gray600" />
            <span>Cola de Trabajo Comercial</span>
          </span>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-semibold text-google-blue hover:text-google-blueHover flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Solicitar Pieza de Marketing</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="p-5 border-b border-google-gray300 bg-google-gray50 space-y-4 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Task title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-google-gray600 uppercase mb-1">Título de la Solicitud</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rediseñar banner promocional de Almasur Hoteles"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-google-gray300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                />
              </div>

              {/* Brand Selector */}
              <div>
                <label className="block text-xs font-semibold text-google-gray600 uppercase mb-1">Unidad de Negocio</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full px-3 py-2 border border-google-gray300 bg-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                >
                  {BRANDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-google-gray600 uppercase mb-1">Tipo de Tarea</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Task["type"])}
                  className="w-full px-3 py-2 border border-google-gray300 bg-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                >
                  {Object.keys(TASK_MARKET_RATES).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-xs font-semibold text-google-gray600 uppercase mb-1">Asignar a</label>
                <select
                  value={newAssignedTo}
                  onChange={(e) => setNewAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-google-gray300 bg-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Urgency / SLA */}
              <div>
                <label className="block text-xs font-semibold text-google-gray600 uppercase mb-1">Urgencia SLA</label>
                <div className="flex gap-2">
                  {(["alta", "media", "normal"] as TaskUrgency[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setNewUrgency(u)}
                      className={`flex-1 py-2 rounded text-xs font-bold uppercase border transition-colors ${
                        newUrgency === u
                          ? u === "alta"   ? "bg-red-500 border-red-500 text-white"
                          : u === "media"  ? "bg-yellow-400 border-yellow-400 text-white"
                          :                  "bg-google-gray200 border-google-gray300 text-google-gray700"
                          : "bg-white border-google-gray300 text-google-gray500 hover:bg-google-gray50"
                      }`}
                    >
                      {u === "alta" ? "🔴 Alta" : u === "media" ? "🟡 Media" : "⚪ Normal"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-google-blue hover:bg-google-blueHover text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
              >
                Crear Solicitud
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-google-gray600 hover:text-google-gray800 font-semibold px-3 py-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col bg-white border rounded min-h-[450px] transition-all duration-200 ${
                isOver ? "border-google-blue border-dashed bg-google-blueLight" : "border-google-gray300"
              }`}
            >
              {/* Column Header */}
              <div className={`px-4 py-3 border-b border-google-gray300 flex items-center justify-between rounded-t ${col.bg}`}>
                <span className="text-xs font-bold uppercase tracking-wider">{col.name}</span>
                <span className="text-xs font-bold bg-white text-google-gray800 rounded-full px-2 py-0.5 shadow-sm border border-google-gray200">
                  {colTasks.length}
                </span>
              </div>

              {/* Column body / Tasks container */}
              <div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[500px]">
                {colTasks.length === 0 ? (
                  <div className="h-full min-h-[300px] flex items-center justify-center border border-dashed border-google-gray300 rounded p-6 text-center text-xs text-google-gray500">
                    Arrastra una tarea aquí
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => handleOpenDetailModal(task)}
                      className="bg-white border border-google-gray300 rounded p-3 hover:shadow-md hover:border-google-blue cursor-pointer transition-all duration-200 space-y-2 group active:opacity-50 active:scale-95"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-google-gray150 text-google-gray750">
                          {task.type}
                        </span>
                        {task.urgency === "alta" && (
                          <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">🔴 Alta</span>
                        )}
                        {task.urgency === "media" && (
                          <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">🟡 Media</span>
                        )}
                        {task.phase && task.phase !== "retainer" && (
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            task.phase === "quick_win" ? "bg-orange-100 text-orange-700" :
                            task.phase === "mes1"      ? "bg-blue-100 text-blue-700" :
                                                         "bg-green-100 text-green-700"
                          }`}>
                            {task.phase === "quick_win" ? "Quick Win" : task.phase === "mes1" ? "Mes 1" : "Mes 2–3"}
                          </span>
                        )}
                        <span className="text-[9px] font-medium text-google-gray550 truncate max-w-[90px]" title={getBrandName(task.brandId)}>
                          {getBrandName(task.brandId)}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-google-gray800 leading-normal line-clamp-2">{task.title}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-google-gray100 text-[10px] text-google-gray550">
                        <span className="font-semibold">{fmtCLP(task.estimatedMarketCost)}</span>
                        <span className="text-[9px] text-google-blue font-semibold group-hover:underline">Ver detalle</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RETAINER SAVINGS — compacto, debajo del kanban */}
      <div className="bg-white border border-google-gray200 rounded px-5 py-3 flex flex-wrap items-center gap-6 text-xs text-google-gray600">
        <span className="font-bold text-google-gray500 uppercase tracking-wider text-[10px]">Plan Growth Retainer</span>
        <span className="text-google-gray400">|</span>
        <span>
          Costo de mercado ahorrado:{" "}
          <span className="font-semibold text-google-blue">{fmtCLP(totalSavings)}</span>
        </span>
        <span className="text-google-gray400">·</span>
        <span className="text-google-gray500">{completedTasks.length} entregas completadas bajo retainer</span>
      </div>

      {/* DETAIL MODAL (Google Ads premium look) */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-xs z-50 flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded border border-google-gray300 max-w-lg w-full p-6 shadow-xl relative scale-in flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-google-gray300">
              <div className="flex items-center gap-2">
                <KanbanSquare className="w-5 h-5 text-google-blue" />
                <h3 className="text-sm font-semibold text-google-gray800">Detalles de Solicitud de Marketing</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-google-gray500 hover:text-google-gray800 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDetails} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-google-gray700 uppercase tracking-wider mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-google-gray300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-google-gray700 uppercase tracking-wider mb-1">Descripción / Notas de SLA</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  placeholder="Detalles del requerimiento, dimensiones, links de referencia o pautas de diseño..."
                  className="w-full px-3 py-2 border border-google-gray300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-bold text-google-gray700 uppercase tracking-wider mb-1">Unidad de Negocio</label>
                  <select
                    value={editBrandId}
                    onChange={(e) => setEditBrandId(e.target.value)}
                    className="w-full px-3 py-2 border border-google-gray300 bg-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                  >
                    {BRANDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-bold text-google-gray700 uppercase tracking-wider mb-1">Tipo de Tarea</label>
                  <select
                    value={editType}
                    onChange={(e) => {
                      const newType = e.target.value as Task["type"];
                      setEditType(newType);
                      setEditMarketCost(TASK_MARKET_RATES[newType] || 250000);
                    }}
                    className="w-full px-3 py-2 border border-google-gray300 bg-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                  >
                    {Object.keys(TASK_MARKET_RATES).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-google-gray700 uppercase tracking-wider mb-1">Estado</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Task["status"])}
                    className="w-full px-3 py-2 border border-google-gray300 bg-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                  >
                    <option value="backlog">Backlog / Cola</option>
                    <option value="in_progress">En Proceso</option>
                    <option value="in_review">En Revisión</option>
                    <option value="completed">Terminado / Guardado</option>
                  </select>
                </div>

                {/* Estimated Market Cost */}
                <div>
                  <label className="block text-xs font-bold text-google-gray700 uppercase tracking-wider mb-1">Costo de Mercado (SLA)</label>
                  <input
                    type="number"
                    required
                    value={editMarketCost}
                    onChange={(e) => setEditMarketCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-google-gray300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                  />
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-xs font-bold text-google-gray700 uppercase tracking-wider mb-1">Responsable Ejecución</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-3.5 h-3.5 text-google-gray500" />
                  </span>
                  <input
                    type="text"
                    required
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-google-gray300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-google-blue"
                  />
                </div>
              </div>

              {/* Metadata Info */}
              <div className="pt-2 text-[10px] text-google-gray500 flex justify-between">
                <span>Petición: {selectedTask.requestDate}</span>
                {selectedTask.completedDate && <span>Completada: {selectedTask.completedDate}</span>}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-google-gray300">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("¿Estás seguro de que deseas eliminar esta solicitud?")) {
                      onDeleteTask(selectedTask.id);
                      setSelectedTask(null);
                    }
                  }}
                  className="bg-white hover:bg-google-redLight border border-google-gray300 hover:border-google-red text-google-gray700 hover:text-google-red text-xs font-semibold px-4 py-2 rounded transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="text-xs font-semibold text-google-gray600 hover:text-google-gray800 px-3 py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-google-blue hover:bg-google-blueHover text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
