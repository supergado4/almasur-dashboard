import { useState, useEffect } from "react";
import { type DailyData, type Task, BRANDS } from "./data/mockData";
import { apiService, type AuthUser } from "./services/apiService";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { DashboardHeader } from "./components/DashboardHeader";
import { ConsolidatedView } from "./components/ConsolidatedView";
import { BrandView } from "./components/BrandView";
import { TaskPanel } from "./components/TaskPanel";
import { printTaskReport } from "./utils/printReport";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeBrandId, setActiveBrandId] = useState<string | "holding">("holding");
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "economics" | "tasks">("tasks");

  // Rango de fechas activo (Inicia por defecto en los últimos 30 días de la simulación)
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
    label: "Últimos 30 días",
  });

  const [simulationDate, setSimulationDate] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Estadísticas diarias de la marca seleccionada (o consolidado)
  const [dailyStats, setDailyStats] = useState<DailyData[]>([]);
  // Estadísticas diarias individuales por cada marca (requerido para comparaciones en el holding)
  const [allBrandsData, setAllBrandsData] = useState<Record<string, DailyData[]>>({});

  // 1. Cargar sesión de usuario inicial
  useEffect(() => {
    const savedUser = localStorage.getItem("almasur_user_session");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error restoring session", e);
      }
    }
  }, []);

  // 2. Sincronizar fecha de simulación inicial
  useEffect(() => {
    const simDate = apiService.getSimulationDate();
    setSimulationDate(simDate);

    // Configurar rango de fechas inicial (últimos 30 días con respecto a simDate)
    const d = new Date(simDate + "T00:00:00");
    d.setDate(d.getDate() - 29);
    const start = d.toISOString().split("T")[0];
    
    setDateRange({
      start,
      end: simDate,
      label: "Últimos 30 días",
    });
  }, []);

  // 3. Cargar tareas e históricos cada vez que cambia el rango de fechas o la simulación
  const loadDashboardData = async () => {
    if (!dateRange.start || !dateRange.end) return;

    // A. Cargar Tareas
    const tasksList = await apiService.getTasks();
    setTasks(tasksList);

    // B. Cargar Estadísticas Filtradas para la vista activa (Holding o Marca)
    const stats = await apiService.getDailyStats(activeBrandId, dateRange.start, dateRange.end);
    setDailyStats(stats);

    // C. Cargar datos desglosados de cada marca
    const brandsStats: Record<string, DailyData[]> = {};
    for (const b of BRANDS) {
      brandsStats[b.id] = await apiService.getDailyStats(b.id, dateRange.start, dateRange.end);
    }
    setAllBrandsData(brandsStats);
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeBrandId, dateRange.start, dateRange.end, simulationDate]);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem("almasur_user_session", JSON.stringify(user));
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
  };

  // ── ACCIONES DE SIMULACIÓN ──
  const handleAdvanceDay = async () => {
    const newSimDate = await apiService.advanceSimulation();
    setSimulationDate(newSimDate);

    // Desplazar el rango de fechas automáticamente para mantenerse al día
    setDateRange((prev) => {
      const dStart = new Date(prev.start + "T00:00:00");
      dStart.setDate(dStart.getDate() + 1);
      
      const dEnd = new Date(prev.end + "T00:00:00");
      dEnd.setDate(dEnd.getDate() + 1);

      return {
        start: dStart.toISOString().split("T")[0],
        end: dEnd.toISOString().split("T")[0],
        label: prev.label,
      };
    });
  };

  // ── ACCIONES DE TAREAS ──
  const handleAddTask = async (taskData: { title: string; brandId: string; type: Task["type"]; assignedTo?: string; urgency?: Task["urgency"] }) => {
    await apiService.createTask(taskData);
    loadDashboardData();
  };

  const handleUpdateTaskStatus = async (taskId: string, status: Task["status"]) => {
    await apiService.updateTaskStatus(taskId, status);
    loadDashboardData();
  };

  const handleUpdateTaskDetails = async (updatedTask: Task) => {
    await apiService.updateTask(updatedTask);
    loadDashboardData();
  };

  const handleDeleteTask = async (taskId: string) => {
    await apiService.deleteTask(taskId);
    loadDashboardData();
  };

  const handlePrintReport = () => {
    printTaskReport(tasks, simulationDate);
  };

  // Si no ha iniciado sesión, mostrar login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-full flex flex-col">
        <Layout
          user={currentUser}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeBrandId={activeBrandId}
          setActiveBrandId={setActiveBrandId}
        >
          {/* Header del Dashboard — oculto en la vista SLA */}
          {activeTab !== "tasks" && (
            <DashboardHeader
              activeBrandId={activeBrandId}
              setActiveBrandId={setActiveBrandId}
              dateRange={dateRange}
              setDateRange={setDateRange}
              simulationDate={simulationDate}
              onAdvanceDay={handleAdvanceDay}
              isRealApi={apiService.isRealApiMode()}
            />
          )}

          {/* Carga de la pestaña correspondiente */}
          {activeTab === "overview" && (
            activeBrandId === "holding" ? (
              <ConsolidatedView
                data={dailyStats}
                allBrandsData={allBrandsData}
                dateRange={dateRange}
                activeTab={activeTab}
              />
            ) : (
              <BrandView
                brandId={activeBrandId}
                data={dailyStats}
                dateRange={dateRange}
                activeTab={activeTab}
              />
            )
          )}

          {activeTab === "performance" && (
            activeBrandId === "holding" ? (
              <ConsolidatedView
                data={dailyStats}
                allBrandsData={allBrandsData}
                dateRange={dateRange}
                activeTab={activeTab}
              />
            ) : (
              <BrandView
                brandId={activeBrandId}
                data={dailyStats}
                dateRange={dateRange}
                activeTab={activeTab}
              />
            )
          )}

          {activeTab === "economics" && (
            activeBrandId === "holding" ? (
              <ConsolidatedView
                data={dailyStats}
                allBrandsData={allBrandsData}
                dateRange={dateRange}
                activeTab={activeTab}
              />
            ) : (
              <BrandView
                brandId={activeBrandId}
                data={dailyStats}
                dateRange={dateRange}
                activeTab={activeTab}
              />
            )
          )}

          {activeTab === "tasks" && (
            <TaskPanel
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateStatus={handleUpdateTaskStatus}
              onUpdateTaskDetails={handleUpdateTaskDetails}
              onDeleteTask={handleDeleteTask}
              onPrintReport={handlePrintReport}
            />
          )}
        </Layout>
      </div>
  );
}
