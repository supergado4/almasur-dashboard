import { type DailyData, type Task, initLocalStorageDb, advanceSimulationDay, TASK_MARKET_RATES } from "../data/mockData";

// ── CONFIG ─────────────────────────────────────────────────────────────────────
const USE_REAL_APIS = import.meta.env.VITE_USE_REAL_APIS === "true";
const API_BASE_URL  = import.meta.env.VITE_API_BASE_URL || "/api";

const TOKEN_KEY = "almasur_jwt";

// ── AUTH USER TYPE ─────────────────────────────────────────────────────────────
export interface AuthUser {
  email:        string;
  name:         string;
  role:         string;
  organization: string;
  avatar:       string;
}

export class ApiService {
  constructor() {
    if (!USE_REAL_APIS) {
      initLocalStorageDb();
    }
  }

  // ── AUTH ───────────────────────────────────────────────────────────────────

  /** Login against the backend, stores JWT, returns the user. */
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Credenciales incorrectas");
    }

    const { token, user } = await res.json() as { token: string; user: AuthUser };
    localStorage.setItem(TOKEN_KEY, token);
    return user;
  }

  /** Remove JWT and user session from localStorage. */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("almasur_user_session");
  }

  /** Current JWT token (or null if not authenticated). */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── INTERNAL FETCH HELPER ──────────────────────────────────────────────────

  private authHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  private async fetchWithAuth(input: string, init: RequestInit = {}): Promise<Response> {
    const res = await fetch(input, {
      ...init,
      headers: {
        ...(init.headers as Record<string, string> ?? {}),
        ...this.authHeaders(),
      },
    });
    if (res.status === 401) {
      // Token expired — force logout
      this.logout();
      window.location.reload();
    }
    return res;
  }

  // ── DAILY STATS ────────────────────────────────────────────────────────────

  async getDailyStats(brandId: string | "holding", startDateStr: string, endDateStr: string): Promise<DailyData[]> {
    if (USE_REAL_APIS) {
      try {
        const res = await this.fetchWithAuth(
          `${API_BASE_URL}/stats?brand=${brandId}&start=${startDateStr}&end=${endDateStr}`
        );
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
      } catch (error) {
        console.error("Error fetching stats, falling back to demo mode:", error);
        return this.getMockDailyStats(brandId, startDateStr, endDateStr);
      }
    }
    return this.getMockDailyStats(brandId, startDateStr, endDateStr);
  }

  // ── TASKS ──────────────────────────────────────────────────────────────────

  async getTasks(): Promise<Task[]> {
    if (USE_REAL_APIS) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/tasks`);
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
      } catch (error) {
        console.error("Error fetching tasks, falling back to demo mode:", error);
        return this.getMockTasks();
      }
    }
    return this.getMockTasks();
  }

  async createTask(taskData: { title: string; brandId: string; type: Task["type"]; assignedTo?: string; urgency?: Task["urgency"] }): Promise<Task> {
    if (USE_REAL_APIS) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/tasks`, {
          method: "POST",
          body:   JSON.stringify(taskData),
        });
        if (!res.ok) throw new Error("Failed to create task");
        return await res.json();
      } catch (error) {
        console.error("Error creating task, falling back to demo:", error);
        return this.createMockTask(taskData);
      }
    }
    return this.createMockTask(taskData);
  }

  async updateTaskStatus(taskId: string, status: Task["status"]): Promise<Task> {
    if (USE_REAL_APIS) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/tasks/${taskId}/status`, {
          method: "PATCH",
          body:   JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to update task");
        return await res.json();
      } catch (error) {
        console.error("Error updating task status, falling back to demo:", error);
        return this.updateMockTaskStatus(taskId, status);
      }
    }
    return this.updateMockTaskStatus(taskId, status);
  }

  async updateTask(updatedTask: Task): Promise<Task> {
    if (USE_REAL_APIS) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/tasks/${updatedTask.id}`, {
          method: "PUT",
          body:   JSON.stringify(updatedTask),
        });
        if (!res.ok) throw new Error("Failed to update task details");
        return await res.json();
      } catch (error) {
        console.error("Error updating task details, falling back to demo:", error);
        return this.updateMockTaskDetails(updatedTask);
      }
    }
    return this.updateMockTaskDetails(updatedTask);
  }

  async deleteTask(taskId: string): Promise<boolean> {
    if (USE_REAL_APIS) {
      try {
        const res = await this.fetchWithAuth(`${API_BASE_URL}/tasks/${taskId}`, { method: "DELETE" });
        return res.ok;
      } catch (error) {
        console.error("Error deleting task, falling back to demo:", error);
        return this.deleteMockTask(taskId);
      }
    }
    return this.deleteMockTask(taskId);
  }

  // ── SIMULATION (demo only) ─────────────────────────────────────────────────

  async advanceSimulation(): Promise<string> {
    if (USE_REAL_APIS) return new Date().toISOString().split("T")[0];
    return advanceSimulationDay();
  }

  getSimulationDate(): string {
    if (USE_REAL_APIS) return new Date().toISOString().split("T")[0];
    return localStorage.getItem("almasur_simulation_date") || new Date().toISOString().split("T")[0];
  }

  isRealApiMode(): boolean {
    return USE_REAL_APIS;
  }

  // ── MOCK DATA HELPERS ──────────────────────────────────────────────────────

  private getMockDailyStats(brandId: string | "holding", startDateStr: string, endDateStr: string): DailyData[] {
    const dailyStats = JSON.parse(localStorage.getItem("almasur_daily_stats") || "{}") as Record<string, DailyData[]>;
    const start = new Date(startDateStr);
    const end   = new Date(endDateStr);

    if (brandId === "holding") {
      const datesMap: Record<string, DailyData> = {};
      Object.keys(dailyStats).forEach((bId) => {
        dailyStats[bId].forEach((day) => {
          const dDate = new Date(day.date);
          if (dDate >= start && dDate <= end) {
            if (!datesMap[day.date]) {
              datesMap[day.date] = { date: day.date, spendGoogle: 0, spendMeta: 0, leadsGoogle: 0, leadsMeta: 0, contactedGoogle: 0, contactedMeta: 0, qualifiedGoogle: 0, qualifiedMeta: 0, assignedGoogle: 0, assignedMeta: 0, closedGoogle: 0, closedMeta: 0, revenueGoogle: 0, revenueMeta: 0 };
            }
            datesMap[day.date].spendGoogle     += day.spendGoogle;
            datesMap[day.date].spendMeta       += day.spendMeta;
            datesMap[day.date].leadsGoogle     += day.leadsGoogle;
            datesMap[day.date].leadsMeta       += day.leadsMeta;
            datesMap[day.date].contactedGoogle += day.contactedGoogle;
            datesMap[day.date].contactedMeta   += day.contactedMeta;
            datesMap[day.date].qualifiedGoogle += day.qualifiedGoogle;
            datesMap[day.date].qualifiedMeta   += day.qualifiedMeta;
            datesMap[day.date].assignedGoogle  += day.assignedGoogle;
            datesMap[day.date].assignedMeta    += day.assignedMeta;
            datesMap[day.date].closedGoogle    += day.closedGoogle;
            datesMap[day.date].closedMeta      += day.closedMeta;
            datesMap[day.date].revenueGoogle   += day.revenueGoogle;
            datesMap[day.date].revenueMeta     += day.revenueMeta;
          }
        });
      });
      return Object.values(datesMap).sort((a, b) => a.date.localeCompare(b.date));
    }

    const brandData = dailyStats[brandId] || [];
    return brandData.filter((day) => {
      const dDate = new Date(day.date);
      return dDate >= start && dDate <= end;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  private getMockTasks(): Task[] {
    return JSON.parse(localStorage.getItem("almasur_tasks") || "[]") as Task[];
  }

  private createMockTask(taskData: { title: string; brandId: string; type: Task["type"]; assignedTo?: string; urgency?: Task["urgency"] }): Task {
    const tasks = this.getMockTasks();
    const simDateStr = this.getSimulationDate();
    const newTask: Task = {
      id:                  "task_" + Math.random().toString(36).substr(2, 9),
      title:               taskData.title,
      brandId:             taskData.brandId,
      type:                taskData.type,
      status:              "backlog",
      urgency:             taskData.urgency ?? "normal",
      assignedTo:          taskData.assignedTo ?? "Equipo Growth JPE",
      requestDate:         simDateStr,
      estimatedMarketCost: TASK_MARKET_RATES[taskData.type] || 250000,
    };
    tasks.push(newTask);
    localStorage.setItem("almasur_tasks", JSON.stringify(tasks));
    return newTask;
  }

  private updateMockTaskStatus(taskId: string, status: Task["status"]): Task {
    const tasks = this.getMockTasks();
    const simDateStr = this.getSimulationDate();
    let updatedTask: Task | null = null;
    const newTasks = tasks.map((task) => {
      if (task.id === taskId) {
        updatedTask = { ...task, status, completedDate: status === "completed" ? simDateStr : undefined };
        return updatedTask;
      }
      return task;
    });
    localStorage.setItem("almasur_tasks", JSON.stringify(newTasks));
    if (!updatedTask) throw new Error("Task not found");
    return updatedTask;
  }

  private updateMockTaskDetails(updatedTask: Task): Task {
    const tasks = this.getMockTasks();
    const simDateStr = this.getSimulationDate();
    const newTasks = tasks.map((task) => {
      if (task.id === updatedTask.id) {
        return { ...updatedTask, completedDate: updatedTask.status === "completed" ? (updatedTask.completedDate || simDateStr) : undefined };
      }
      return task;
    });
    localStorage.setItem("almasur_tasks", JSON.stringify(newTasks));
    return updatedTask;
  }

  private deleteMockTask(taskId: string): boolean {
    const tasks = this.getMockTasks();
    localStorage.setItem("almasur_tasks", JSON.stringify(tasks.filter((t) => t.id !== taskId)));
    return true;
  }
}

export const apiService = new ApiService();
