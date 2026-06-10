import React, { useState } from "react";
import { BRANDS } from "../data/mockData";
import { Calendar, Play, RefreshCw, Layers, CheckCircle2 } from "lucide-react";

interface DashboardHeaderProps {
  activeBrandId: string | "holding";
  setActiveBrandId: (id: string | "holding") => void;
  dateRange: { start: string; end: string; label: string };
  setDateRange: (range: { start: string; end: string; label: string }) => void;
  simulationDate: string;
  onAdvanceDay: () => void;
  isRealApi: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeBrandId,
  setActiveBrandId,
  dateRange,
  setDateRange,
  simulationDate,
  onAdvanceDay,
  isRealApi,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);

  // Formatear la fecha de simulación
  const formatSimDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-CL", options);
  };

  const dateOptions = [
    { label: "Hoy", getRange: (simDate: string) => ({ start: simDate, end: simDate }) },
    {
      label: "Ayer",
      getRange: (simDate: string) => {
        const d = new Date(simDate + "T00:00:00");
        d.setDate(d.getDate() - 1);
        const yest = d.toISOString().split("T")[0];
        return { start: yest, end: yest };
      },
    },
    {
      label: "Últimos 7 días",
      getRange: (simDate: string) => {
        const d = new Date(simDate + "T00:00:00");
        d.setDate(d.getDate() - 6);
        const start = d.toISOString().split("T")[0];
        return { start, end: simDate };
      },
    },
    {
      label: "Últimos 30 días",
      getRange: (simDate: string) => {
        const d = new Date(simDate + "T00:00:00");
        d.setDate(d.getDate() - 29);
        const start = d.toISOString().split("T")[0];
        return { start, end: simDate };
      },
    },
  ];

  const handleSelectRange = (opt: typeof dateOptions[0]) => {
    const range = opt.getRange(simulationDate);
    setDateRange({
      start: range.start,
      end: range.end,
      label: opt.label,
    });
    setShowDatePicker(false);
  };

  const getActiveBrandName = () => {
    if (activeBrandId === "holding") return "Consolidado Holding";
    return BRANDS.find((b) => b.id === activeBrandId)?.name || "";
  };

  return (
    <div className="bg-white border-b border-google-gray300 px-6 py-4 no-print fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Breadcrumb / Brand Swapper */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-google-gray600">
            <span>Inversiones Almasur</span>
            <span>/</span>
            <span className="text-google-gray700 font-medium">Paneles de control</span>
          </div>

          <div className="relative mt-1">
            <button
              onClick={() => setShowBrandPicker(!showBrandPicker)}
              className="text-xl font-medium text-google-gray800 flex items-center gap-2 hover:bg-google-gray50 px-2 py-1 -ml-2 rounded transition-colors"
            >
              <span>{getActiveBrandName()}</span>
              <span className="text-[10px] text-google-gray500">▼</span>
            </button>

            {showBrandPicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowBrandPicker(false)}></div>
                <div className="absolute left-0 mt-1 w-64 bg-white border border-google-gray300 rounded shadow-google z-20 py-1">
                  <button
                    onClick={() => {
                      setActiveBrandId("holding");
                      setShowBrandPicker(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                      activeBrandId === "holding"
                        ? "bg-google-blueLight text-google-blue font-medium"
                        : "text-google-gray700 hover:bg-google-gray100"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Consolidado Holding</span>
                  </button>

                  <div className="border-t border-google-gray200 my-1"></div>

                  {BRANDS.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => {
                        setActiveBrandId(brand.id);
                        setShowBrandPicker(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex flex-col ${
                        activeBrandId === brand.id
                          ? "bg-google-blueLight text-google-blue font-medium"
                          : "text-google-gray700 hover:bg-google-gray100"
                      }`}
                    >
                      <span className="font-medium">{brand.name}</span>
                      <span className="text-[10px] text-google-gray500">{brand.vertical}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Simulation Calendar Status */}
          <div className="bg-google-gray50 border border-google-gray300 rounded px-3 py-1.5 flex items-center gap-2 text-xs text-google-gray700">
            <span className="w-2.5 h-2.5 rounded-full bg-google-green animate-pulse"></span>
            <span className="font-semibold text-google-gray800">Fecha Simulación:</span>
            <span className="capitalize">{formatSimDate(simulationDate)}</span>
          </div>

          {/* Date Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="bg-white border border-google-gray300 rounded px-3 py-1.5 flex items-center gap-2 hover:bg-google-gray50 transition-colors text-xs text-google-gray700 font-medium"
            >
              <Calendar className="w-4 h-4 text-google-gray600" />
              <span>{dateRange.label}</span>
              <span className="text-google-gray500 text-[10px]">▼</span>
            </button>

            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDatePicker(false)}></div>
                <div className="absolute right-0 mt-1 w-48 bg-white border border-google-gray300 rounded shadow-google z-20 py-1">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleSelectRange(opt)}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-google-gray100 ${
                        dateRange.label === opt.label ? "text-google-blue font-semibold" : "text-google-gray700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Simulator Action Button */}
          {!isRealApi ? (
            <button
              onClick={onAdvanceDay}
              className="bg-google-blue text-white rounded px-4 py-1.5 text-xs font-medium hover:bg-google-blueHover transition-colors flex items-center gap-1.5 shadow-sm"
              title="Avanza 1 día en el calendario de simulación y genera nuevos datos"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Avanzar 1 Día</span>
            </button>
          ) : (
            <div className="bg-google-blueLight border border-google-blue text-google-blue rounded px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>API Conectada</span>
            </div>
          )}
        </div>
      </div>

      {/* Selector de Fechas Rango Detail */}
      <div className="mt-3 text-[11px] text-google-gray600">
        Rango activo: <span className="font-semibold text-google-gray700">{dateRange.start}</span> al <span className="font-semibold text-google-gray700">{dateRange.end}</span>
      </div>
    </div>
  );
};
