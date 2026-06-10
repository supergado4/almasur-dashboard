import React, { useState } from "react";
import { users } from "../data/credentials";
import { BRANDS } from "../data/mockData";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  KanbanSquare,
  LogOut,
  Search,
  Bell,
  HelpCircle,
  FolderKanban,
  DollarSign,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  user: typeof users[0];
  onLogout: () => void;
  activeTab: "overview" | "performance" | "economics" | "tasks";
  setActiveTab: (tab: "overview" | "performance" | "economics" | "tasks") => void;
  activeBrandId: string | "holding";
  setActiveBrandId: (brandId: string | "holding") => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  onLogout,
  activeTab,
  setActiveTab,
  activeBrandId,
  setActiveBrandId,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAdsExpanded, setIsAdsExpanded] = useState(true);
  const [isEconomicsExpanded, setIsEconomicsExpanded] = useState(true);


  return (
    <div className="flex h-screen overflow-hidden bg-google-gray50">
      {/* ── SIDEBAR ── */}
      <aside
        className={`bg-white border-r border-google-gray300 flex flex-col transition-all duration-200 no-print z-20 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo and Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-google-gray300">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <img
                src="https://jpedesign.cl/wp-content/uploads/2026/04/657703961_18039370931716598_5734186209565692188_n-Photoroom.png"
                alt="JPEdesign Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="font-bold text-google-gray800 text-sm tracking-wide">JPEdesign</span>
            </div>
          )}
          {sidebarCollapsed && (
            <img
              src="https://jpedesign.cl/wp-content/uploads/2026/04/657703961_18039370931716598_5734186209565692188_n-Photoroom.png"
              alt="Logo"
              className="h-7 w-auto object-contain mx-auto"
            />
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-google-gray100 rounded text-google-gray600 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {/* SLA · Plan 2026 — PRIMERA POSICIÓN */}
          <button
            onClick={() => setActiveTab("tasks")}
            className={`w-full flex items-center rounded transition-colors py-2 px-3 text-sm font-medium ${
              activeTab === "tasks"
                ? "bg-google-blueLight text-google-blue border-l-4 border-google-blue -ml-[4px]"
                : "text-google-gray700 hover:bg-google-gray100"
            }`}
          >
            <KanbanSquare className={`w-5 h-5 flex-shrink-0 ${activeTab === "tasks" ? "text-google-blue" : "text-google-gray600"}`} />
            {!sidebarCollapsed && <span className="ml-3 truncate font-semibold">SLA · Plan 2026</span>}
          </button>

          {/* Visión General */}
          <button
            onClick={() => {
              setActiveTab("overview");
              setActiveBrandId("holding");
            }}
            className={`w-full flex items-center rounded transition-colors py-2 px-3 text-sm font-medium ${
              activeTab === "overview"
                ? "bg-google-blueLight text-google-blue border-l-4 border-google-blue -ml-[4px]"
                : "text-google-gray700 hover:bg-google-gray100"
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 flex-shrink-0 ${activeTab === "overview" ? "text-google-blue" : "text-google-gray600"}`} />
            {!sidebarCollapsed && <span className="ml-3 truncate">Visión General</span>}
          </button>

          {/* Rendimiento Ads (Desplegable) */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (sidebarCollapsed) {
                  setActiveTab("performance");
                  setActiveBrandId("holding");
                } else {
                  setIsAdsExpanded(!isAdsExpanded);
                  setActiveTab("performance");
                }
              }}
              className={`w-full flex items-center justify-between rounded transition-colors py-2 px-3 text-sm font-medium ${
                activeTab === "performance" && sidebarCollapsed
                  ? "bg-google-blueLight text-google-blue border-l-4 border-google-blue -ml-[4px]"
                  : "text-google-gray700 hover:bg-google-gray100"
              }`}
            >
              <div className="flex items-center">
                <TrendingUp className={`w-5 h-5 flex-shrink-0 ${activeTab === "performance" ? "text-google-blue" : "text-google-gray600"}`} />
                {!sidebarCollapsed && <span className="ml-3 truncate font-medium">Rendimiento Ads</span>}
              </div>
              {!sidebarCollapsed && (
                isAdsExpanded ? <ChevronUp className="w-4 h-4 text-google-gray500" /> : <ChevronDown className="w-4 h-4 text-google-gray500" />
              )}
            </button>

            {/* Submenú de marcas para Rendimiento Ads */}
            {!sidebarCollapsed && isAdsExpanded && (
              <div className="pl-4 ml-4 border-l border-google-gray300 space-y-0.5 transition-all duration-200">
                {/* Opción Holding */}
                <button
                  onClick={() => {
                    setActiveTab("performance");
                    setActiveBrandId("holding");
                  }}
                  className={`w-full text-left py-1.5 px-3 rounded text-xs font-medium transition-colors truncate ${
                    activeTab === "performance" && activeBrandId === "holding"
                      ? "bg-google-blueLight text-google-blue font-semibold"
                      : "text-google-gray600 hover:bg-google-gray100"
                  }`}
                >
                  Holding (Consolidado)
                </button>
                {/* Opción por marcas */}
                {BRANDS.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      setActiveTab("performance");
                      setActiveBrandId(brand.id);
                    }}
                    className={`w-full text-left py-1.5 px-3 rounded text-xs font-medium transition-colors truncate ${
                      activeTab === "performance" && activeBrandId === brand.id
                        ? "bg-google-blueLight text-google-blue font-semibold"
                        : "text-google-gray600 hover:bg-google-gray100"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Value Economics (Desplegable) */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (sidebarCollapsed) {
                  setActiveTab("economics");
                  setActiveBrandId("holding");
                } else {
                  setIsEconomicsExpanded(!isEconomicsExpanded);
                  setActiveTab("economics");
                }
              }}
              className={`w-full flex items-center justify-between rounded transition-colors py-2 px-3 text-sm font-medium ${
                activeTab === "economics" && sidebarCollapsed
                  ? "bg-google-blueLight text-google-blue border-l-4 border-google-blue -ml-[4px]"
                  : "text-google-gray700 hover:bg-google-gray100"
              }`}
            >
              <div className="flex items-center">
                <DollarSign className={`w-5 h-5 flex-shrink-0 ${activeTab === "economics" ? "text-google-blue" : "text-google-gray600"}`} />
                {!sidebarCollapsed && <span className="ml-3 truncate font-medium">Value Economics</span>}
              </div>
              {!sidebarCollapsed && (
                isEconomicsExpanded ? <ChevronUp className="w-4 h-4 text-google-gray500" /> : <ChevronDown className="w-4 h-4 text-google-gray500" />
              )}
            </button>

            {/* Submenú de marcas para Value Economics */}
            {!sidebarCollapsed && isEconomicsExpanded && (
              <div className="pl-4 ml-4 border-l border-google-gray300 space-y-0.5 transition-all duration-200">
                {/* Opción Holding */}
                <button
                  onClick={() => {
                    setActiveTab("economics");
                    setActiveBrandId("holding");
                  }}
                  className={`w-full text-left py-1.5 px-3 rounded text-xs font-medium transition-colors truncate ${
                    activeTab === "economics" && activeBrandId === "holding"
                      ? "bg-google-blueLight text-google-blue font-semibold"
                      : "text-google-gray600 hover:bg-google-gray100"
                  }`}
                >
                  Holding (Consolidado)
                </button>
                {/* Opción por marcas */}
                {BRANDS.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      setActiveTab("economics");
                      setActiveBrandId(brand.id);
                    }}
                    className={`w-full text-left py-1.5 px-3 rounded text-xs font-medium transition-colors truncate ${
                      activeTab === "economics" && activeBrandId === brand.id
                        ? "bg-google-blueLight text-google-blue font-semibold"
                        : "text-google-gray600 hover:bg-google-gray100"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            )}
          </div>

        </nav>

        {/* User Info / Logout */}
        <div className="p-3 border-t border-google-gray300 bg-google-gray50">
          {!sidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-google-blue text-white font-bold flex items-center justify-center text-sm shadow-inner">
                  {user.avatar}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-google-gray800 truncate">{user.name}</div>
                  <div className="text-[10px] text-google-gray600 truncate">{user.role}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 border border-google-gray300 rounded bg-white text-xs font-medium text-google-gray700 hover:bg-google-redLight hover:text-google-red hover:border-google-red transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogout}
              className="w-full py-2 flex items-center justify-center rounded hover:bg-google-redLight text-google-gray600 hover:text-google-red transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-google-gray300 flex items-center justify-between px-6 no-print">
          {/* Top Search bar */}
          <div className="relative w-80 hidden md:block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-google-gray500" />
            </span>
            <input
              type="text"
              placeholder="Buscar en el Centro de Mando..."
              className="w-full pl-9 pr-3 py-1.5 bg-google-gray50 border border-google-gray300 rounded focus:outline-none focus:ring-1 focus:ring-google-blue focus:border-google-blue text-xs text-google-gray800 placeholder-google-gray500 transition-all"
            />
          </div>

          {/* Icons & Utility */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Real API Status Badge */}
            <div className="text-[10px] text-google-gray600 bg-google-gray100 border border-google-gray300 rounded px-2 py-0.5">
              Refresco: <span className="font-semibold text-google-blue">Diario</span>
            </div>

            <button
              className="p-1.5 text-google-gray600 hover:bg-google-gray100 rounded transition-colors"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5" />
            </button>

            <button
              className="p-1.5 text-google-gray600 hover:bg-google-gray100 rounded transition-colors"
              title="Ayuda / Soporte"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded-full bg-google-blueLight text-google-blue font-bold flex items-center justify-center text-xs border border-google-blue">
              {user.avatar}
            </div>
          </div>
        </header>

        {/* Content Mount Point */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
