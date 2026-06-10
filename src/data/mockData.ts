export interface DailyData {
  date: string;
  spendGoogle: number;
  spendMeta: number;
  leadsGoogle: number;
  leadsMeta: number;
  contactedGoogle: number;
  contactedMeta: number;
  qualifiedGoogle: number;
  qualifiedMeta: number;
  assignedGoogle: number;
  assignedMeta: number;
  closedGoogle: number;
  closedMeta: number;
  revenueGoogle: number;
  revenueMeta: number;
}

export type BrandHealthStatus = "critico" | "limitado" | "sin_pauta" | "activo";

export interface BrandInfo {
  id: string;
  name: string;
  vertical: string;
  description: string;
  ltv: number;
  avgContractValue: number;
  commissionRate?: number; // for hotels/booking or sports
  healthStatus: BrandHealthStatus;
  healthNote: string; // Short diagnostic from the plan
}

export type TaskPhase = "quick_win" | "mes1" | "mes2_3" | "retainer";
export type TaskUrgency = "alta" | "media" | "normal";

export const TEAM_MEMBERS = [
  "Juan F. Perez",
  "Equipo Growth JPE",
  "Diseño JPE",
  "Paid Media JPE",
  "Web JPE",
] as const;

export interface Task {
  id: string;
  title: string;
  brandId: string;
  type: "Diseño" | "Banner" | "Campaña" | "Web" | "Email" | "Social";
  status: "backlog" | "in_progress" | "in_review" | "completed";
  urgency?: TaskUrgency;
  requestDate: string;
  completedDate?: string;
  estimatedMarketCost: number;
  description?: string;
  assignedTo?: string;
  phase?: TaskPhase;
}

export const BRANDS: BrandInfo[] = [
  {
    id: "procentro",
    name: "Procentro",
    vertical: "Minibodegas / Storage B2B",
    description: "Espacios de bodegaje industrial y comercial de alto ticket.",
    ltv: 30000000, // $30M CLP
    avgContractValue: 2500000, // $2.5M CLP monthly rent
    healthStatus: "critico",
    healthNote: "Campañas pausadas sin estrategia. PMax apagado. Brand-Procentro pausada con CTR histórico 23.66%.",
  },
  {
    id: "bluepark",
    name: "Bluepark",
    vertical: "Estacionamientos",
    description: "Estacionamiento comercial y custodias vehiculares en Santiago.",
    ltv: 1200000, // $1.2M CLP
    avgContractValue: 120000,
    healthStatus: "limitado",
    healthNote: "1 campaña Meta activa, presupuesto insuficiente ($5K/día). Sin Google Ads ni retargeting.",
  },
  {
    id: "hoteles",
    name: "Almasur Hoteles",
    vertical: "Hospitalidad",
    description: "Hoteles boutique en Punta Arenas y Providencia. Booking vía TravelClick.",
    ltv: 900000, // $900K CLP
    avgContractValue: 150000,
    healthStatus: "sin_pauta",
    healthNote: "Sitio profesional con booking, pero cero paid media. Oportunidad en Google Hotel Ads.",
  },
  {
    id: "surista",
    name: "Surista",
    vertical: "Restaurante",
    description: "Gastronomía sureña — dos ubicaciones en Providencia.",
    ltv: 180000, // $180K CLP
    avgContractValue: 35000,
    healthStatus: "sin_pauta",
    healthNote: "Sitio mínimo sin reservas ni CTA. Cero paid media. Fix urgente del sitio web pendiente.",
  },
  {
    id: "padelymas",
    name: "Padelymas",
    vertical: "Club de Pádel",
    description: "Canchas de pádel, torneos y membresías en Lampa y Huechuraba.",
    ltv: 300000, // $300K CLP
    avgContractValue: 25000,
    healthStatus: "sin_pauta",
    healthNote: "Buen sitio con booking EasyCancha. Sin pixel ni campañas activas. Email list sin activar.",
  },
];

export const TASK_MARKET_RATES = {
  Web: 2800000, // $2.8M CLP landing/microsite
  Campaña: 750000, // Setup e implementación de Ads
  Diseño: 450000, // Kit de marca, folleto o identidad
  Banner: 250000, // Set de creatividades para Ads (3-5 variaciones)
  Email: 150000, // Template y copy de email newsletter
  Social: 80000, // Piezas de redes sociales
};

// Genera datos para una marca en una fecha específica
function generateDayData(brandId: string, dateStr: string): DailyData {
  const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
  const factor = isWeekend ? 0.6 : 1.0;

  let baseGoogleSpend = 0;
  let baseMetaSpend = 0;
  let googleCpl = 0;
  let metaCpl = 0;
  let leadToClosedRate = 0.05;

  switch (brandId) {
    case "procentro":
      baseGoogleSpend = 60000;
      baseMetaSpend = 40000;
      googleCpl = 30000;
      metaCpl = 40000;
      leadToClosedRate = 0.08; // High qualify
      break;
    case "bluepark":
      baseGoogleSpend = 30000;
      baseMetaSpend = 25000;
      googleCpl = 12000;
      metaCpl = 18000;
      leadToClosedRate = 0.12;
      break;
    case "hoteles":
      baseGoogleSpend = 80000;
      baseMetaSpend = 50000;
      googleCpl = 16000;
      metaCpl = 12000;
      leadToClosedRate = 0.15; // Travel booking is high
      break;
    case "padelymas":
      baseGoogleSpend = 12000;
      baseMetaSpend = 20000;
      googleCpl = 8000;
      metaCpl = 6000;
      leadToClosedRate = 0.18;
      break;
    case "surista":
      baseGoogleSpend = 10000;
      baseMetaSpend = 30000;
      googleCpl = 7000;
      metaCpl = 5000;
      leadToClosedRate = 0.22; // Very transactional
      break;
  }

  // Random variance +/- 20%
  const rand = () => 0.8 + Math.random() * 0.4;
  
  const spendGoogle = Math.round(baseGoogleSpend * rand() * factor);
  const spendMeta = Math.round(baseMetaSpend * rand() * (isWeekend ? 1.2 : 1.0)); // Social is higher on weekend

  const leadsGoogle = Math.round((spendGoogle / googleCpl) * rand());
  const leadsMeta = Math.round((spendMeta / metaCpl) * rand());

  // Commercial pipeline steps (HERMES stats)
  const contactedGoogle = Math.round(leadsGoogle * (0.85 + Math.random() * 0.1)); // 85-95% response in under 5m
  const contactedMeta = Math.round(leadsMeta * (0.80 + Math.random() * 0.15));

  const qualifiedGoogle = Math.round(contactedGoogle * (0.60 + Math.random() * 0.15)); // 60-75% qualification
  const qualifiedMeta = Math.round(contactedMeta * (0.50 + Math.random() * 0.2));

  const assignedGoogle = qualifiedGoogle; // All qualified assigned
  const assignedMeta = qualifiedMeta;

  const closedGoogle = Math.round(assignedGoogle * leadToClosedRate * rand());
  const closedMeta = Math.round(assignedMeta * leadToClosedRate * rand());

  // Revenue = Closed * AvgContractValue
  const brand = BRANDS.find((b) => b.id === brandId)!;
  const revenueGoogle = closedGoogle * brand.avgContractValue;
  const revenueMeta = closedMeta * brand.avgContractValue;

  return {
    date: dateStr,
    spendGoogle,
    spendMeta,
    leadsGoogle,
    leadsMeta,
    contactedGoogle,
    contactedMeta,
    qualifiedGoogle,
    qualifiedMeta,
    assignedGoogle,
    assignedMeta,
    closedGoogle,
    closedMeta,
    revenueGoogle,
    revenueMeta,
  };
}

// Inicializa base de datos con los últimos 30 días de datos históricos y tareas por defecto
export function initLocalStorageDb() {
  // Version key bumped to v3 — realigns brands with PPTX + seeds Plan Performance 2026 tasks
  const currentData = localStorage.getItem("almasur_dashboard_v3");
  if (currentData) return;
  // Clear previous versions
  localStorage.removeItem("almasur_dashboard_initialized");
  localStorage.removeItem("almasur_dashboard_v2");
  localStorage.removeItem("almasur_daily_stats");
  localStorage.removeItem("almasur_tasks");
  localStorage.removeItem("almasur_simulation_date");

  const today = new Date();
  const historyDays = 40;
  const db: Record<string, DailyData[]> = {};

  // 1. Generar estadísticas diarias históricas
  for (let i = historyDays; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    BRANDS.forEach((brand) => {
      if (!db[brand.id]) {
        db[brand.id] = [];
      }
      db[brand.id].push(generateDayData(brand.id, dateStr));
    });
  }

  localStorage.setItem("almasur_daily_stats", JSON.stringify(db));

  // 2. Generar tareas iniciales por defecto
  const initialTasks: Task[] = [
    {
      id: "task_1",
      title: "Landing Page campaña especial vacaciones de invierno",
      brandId: "hoteles",
      type: "Web",
      status: "completed",
      requestDate: "2026-05-10",
      completedDate: "2026-05-13",
      estimatedMarketCost: TASK_MARKET_RATES.Web,
    },
    {
      id: "task_2",
      title: "Diseño Kit Banners Ads Meta para temporada alta",
      brandId: "procentro",
      type: "Banner",
      status: "completed",
      requestDate: "2026-05-12",
      completedDate: "2026-05-13",
      estimatedMarketCost: TASK_MARKET_RATES.Banner,
    },
    {
      id: "task_3",
      title: "Email marketing newsletter mensual clientes VIP",
      brandId: "surista",
      type: "Email",
      status: "completed",
      requestDate: "2026-05-18",
      completedDate: "2026-05-19",
      estimatedMarketCost: TASK_MARKET_RATES.Email,
    },
    {
      id: "task_4",
      title: "Rediseño completo Sitio Web institucional y reservas",
      brandId: "padelymas",
      type: "Web",
      status: "in_review",
      requestDate: "2026-06-01",
      estimatedMarketCost: TASK_MARKET_RATES.Web,
    },
    {
      id: "task_5",
      title: "Campaña Search Google Ads lanzamiento nuevas bodegas",
      brandId: "procentro",
      type: "Campaña",
      status: "in_progress",
      requestDate: "2026-06-04",
      estimatedMarketCost: TASK_MARKET_RATES.Campaña,
    },
    {
      id: "task_6",
      title: "Banners promocionales Meta Ads descuento corporativo",
      brandId: "bluepark",
      type: "Banner",
      status: "backlog",
      requestDate: "2026-06-08",
      estimatedMarketCost: TASK_MARKET_RATES.Banner,
    },
    {
      id: "task_7",
      title: "Newsletter promoción arriendos primer mes gratis",
      brandId: "departamentos",
      type: "Email",
      status: "completed",
      requestDate: "2026-05-25",
      completedDate: "2026-05-26",
      estimatedMarketCost: TASK_MARKET_RATES.Email,
    },
    {
      id: "task_8",
      title: "Configuración Campaña Meta Ads reservas cena San Valentín",
      brandId: "surista",
      type: "Campaña",
      status: "completed",
      requestDate: "2026-05-02",
      completedDate: "2026-05-04",
      estimatedMarketCost: TASK_MARKET_RATES.Campaña,
    },
    {
      id: "task_9",
      title: "Piezas Gráficas promociones Happy Hour semanales",
      brandId: "surista",
      type: "Social",
      status: "completed",
      requestDate: "2026-05-05",
      completedDate: "2026-05-06",
      estimatedMarketCost: TASK_MARKET_RATES.Social,
      phase: "retainer",
    },

    // ── PLAN PERFORMANCE 2026 — SEMANA 1-2: QUICK WINS ──
    {
      id: "plan_qw1",
      title: "Reactivar Brand-Procentro (CTR histórico 23.66% — captura demanda activa inmediata)",
      brandId: "procentro",
      type: "Campaña",
      status: "in_progress",
      requestDate: "2026-06-10",
      estimatedMarketCost: TASK_MARKET_RATES.Campaña,
      description: "Brand-Procentro tiene 23.66% de CTR histórico y está PAUSADA. Hay personas buscando Procentro por nombre y no se está capturando esa demanda. Costo bajo, impacto alto. Reactivar Día 1.",
      assignedTo: "Equipo Growth JPE",
      phase: "quick_win",
    },
    {
      id: "plan_qw2",
      title: "Escalar Minibodegas Display — mejor CPA del portafolio ($30K)",
      brandId: "procentro",
      type: "Campaña",
      status: "in_progress",
      requestDate: "2026-06-10",
      estimatedMarketCost: TASK_MARKET_RATES.Campaña,
      description: "CPA actual $30K es el mejor del portafolio. Campaña está limitada por presupuesto. Incrementar presupuesto y medir impacto en conversiones.",
      assignedTo: "Equipo Growth JPE",
      phase: "quick_win",
    },
    {
      id: "plan_qw3",
      title: "Bluepark · Subir presupuesto Meta a $15K/día + activar Google Search",
      brandId: "bluepark",
      type: "Campaña",
      status: "in_progress",
      requestDate: "2026-06-10",
      estimatedMarketCost: TASK_MARKET_RATES.Campaña,
      description: "Presupuesto actual $5K/día es insuficiente para Santiago. Pixel Facebook instalado y listo para retargeting. Activar también Google Search: 'estacionamiento Vitacura/Providencia'.",
      assignedTo: "Equipo Growth JPE",
      phase: "quick_win",
    },

    // ── PLAN PERFORMANCE 2026 — MES 1: ESTRUCTURACIÓN ──
    {
      id: "plan_m1_1",
      title: "Procentro · Reestructurar PMax con CPA objetivo $45K + conversiones offline",
      brandId: "procentro",
      type: "Campaña",
      status: "backlog",
      requestDate: "2026-06-10",
      estimatedMarketCost: TASK_MARKET_RATES.Campaña,
      description: "Integrar datos de leads offline para reducir CPA de $88K a objetivo $45K. Requiere configuración de conversiones importadas. Meta: 60+ conv/mes desde 33 actuales.",
      assignedTo: "Equipo Growth JPE",
      phase: "mes1",
    },
    {
      id: "plan_m1_2",
      title: "Hoteles · Lanzar Google Hotel Ads para Punta Arenas y Providencia",
      brandId: "hoteles",
      type: "Campaña",
      status: "backlog",
      requestDate: "2026-06-10",
      estimatedMarketCost: TASK_MARKET_RATES.Campaña,
      description: "Sitio profesional con booking TravelClick operativo. Activar Google Hotel Ads para los 2 destinos. Segmentación: viajeros turismo Patagonia + ejecutivos Providencia.",
      assignedTo: "Equipo Growth JPE",
      phase: "mes1",
    },
    {
      id: "plan_m1_3",
      title: "Surista · Fix sitio web urgente + Google Ads local (ambas ubicaciones)",
      brandId: "surista",
      type: "Web",
      status: "backlog",
      requestDate: "2026-06-10",
      estimatedMarketCost: TASK_MARKET_RATES.Web,
      description: "Sitio actual sin reservas ni CTA claro. Menú de Providencia enlaza al hotel (confuso). Fix urgente + Google Ads local para 'restaurante Providencia'. Meta: fotos de platos para Meta Ads con alto engagement.",
      assignedTo: "Equipo Growth JPE",
      phase: "mes1",
    },

    // ── PLAN PERFORMANCE 2026 — MES 2-3: ESCALA ──
    {
      id: "plan_m23_1",
      title: "Padelymas · Meta Ads reservas de canchas + Google Local Lampa / Huechuraba",
      brandId: "padelymas",
      type: "Campaña",
      status: "backlog",
      requestDate: "2026-06-10",
      estimatedMarketCost: TASK_MARKET_RATES.Campaña,
      description: "Buen sitio con booking EasyCancha. Activar Meta Ads para reservas y torneos. Google Local para las 2 ubicaciones. Email list existente — activar nurture sequence.",
      assignedTo: "Equipo Growth JPE",
      phase: "mes2_3",
    },
    {
      id: "plan_m23_2",
      title: "Hoteles · Meta retargeting visitantes + segmentación turismo internacional",
      brandId: "hoteles",
      type: "Campaña",
      status: "backlog",
      requestDate: "2026-06-10",
      estimatedMarketCost: TASK_MARKET_RATES.Campaña,
      description: "Con pixel instalado tras Mes 1, activar retargeting a visitantes del sitio. Segmentación avanzada: turistas internacionales Patagonia, ejecutivos en tránsito.",
      assignedTo: "Equipo Growth JPE",
      phase: "mes2_3",
    },
    {
      id: "plan_m23_3",
      title: "Holding · Integración de datos offline → optimización de conversiones mejoradas",
      brandId: "procentro",
      type: "Campaña",
      status: "backlog",
      requestDate: "2026-06-10",
      estimatedMarketCost: TASK_MARKET_RATES.Campaña,
      description: "Conectar CRM / datos de leads offline con Google Ads y Meta para mejorar la señal de conversión en todas las marcas del holding. Impacto directo en calidad de leads y reducción de CPA.",
      assignedTo: "Equipo Growth JPE",
      phase: "mes2_3",
    },
  ];

  localStorage.setItem("almasur_tasks", JSON.stringify(initialTasks));

  // Guardar fecha actual de simulación
  localStorage.setItem("almasur_simulation_date", today.toISOString().split("T")[0]);

  localStorage.setItem("almasur_dashboard_v3", "true");
}

// Avanza la simulación en 1 día y genera nuevos datos
export function advanceSimulationDay(): string {
  initLocalStorageDb();

  const simDateStr = localStorage.getItem("almasur_simulation_date") || new Date().toISOString().split("T")[0];
  const nextDate = new Date(simDateStr);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateStr = nextDate.toISOString().split("T")[0];

  // 1. Agregar datos para este nuevo día
  const dailyStats = JSON.parse(localStorage.getItem("almasur_daily_stats") || "{}") as Record<string, DailyData[]>;
  BRANDS.forEach((brand) => {
    if (!dailyStats[brand.id]) dailyStats[brand.id] = [];
    dailyStats[brand.id].push(generateDayData(brand.id, nextDateStr));
  });
  localStorage.setItem("almasur_daily_stats", JSON.stringify(dailyStats));

  // 2. Simular avance de tareas (probabilidad de avanzar estados de tareas en proceso)
  const tasks = JSON.parse(localStorage.getItem("almasur_tasks") || "[]") as Task[];
  const updatedTasks = tasks.map((task) => {
    if (task.status === "backlog" && Math.random() < 0.2) {
      return { ...task, status: "in_progress" as const };
    }
    if (task.status === "in_progress" && Math.random() < 0.3) {
      return { ...task, status: "in_review" as const };
    }
    if (task.status === "in_review" && Math.random() < 0.4) {
      return { 
        ...task, 
        status: "completed" as const, 
        completedDate: nextDateStr 
      };
    }
    return task;
  });
  localStorage.setItem("almasur_tasks", JSON.stringify(updatedTasks));

  // 3. Guardar nueva fecha de simulación
  localStorage.setItem("almasur_simulation_date", nextDateStr);

  return nextDateStr;
}
