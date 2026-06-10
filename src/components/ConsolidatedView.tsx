import React from "react";
import { type DailyData, BRANDS } from "../data/mockData";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Layers, DollarSign, Target, Landmark, Percent, Table } from "lucide-react";

interface ConsolidatedViewProps {
  data: DailyData[]; // Consolidated daily data
  allBrandsData: Record<string, DailyData[]>; // Daily data per brand
  dateRange: { start: string; end: string };
  activeTab: "overview" | "performance" | "economics" | "tasks";
}

export const ConsolidatedView: React.FC<ConsolidatedViewProps> = ({
  data,
  allBrandsData,
  dateRange,
  activeTab,
}) => {
  // 1. Calcular KPIs Consolidados
  const totalSpendGoogle = data.reduce((sum, day) => sum + Number(day.spendGoogle), 0);
  const totalSpendMeta = data.reduce((sum, day) => sum + Number(day.spendMeta), 0);
  const totalSpend = totalSpendGoogle + totalSpendMeta;

  const totalLeads = data.reduce((sum, day) => sum + Number(day.leadsGoogle) + Number(day.leadsMeta), 0);
  const totalClosed = data.reduce((sum, day) => sum + Number(day.closedGoogle) + Number(day.closedMeta), 0);
  const totalRevenue = data.reduce((sum, day) => sum + Number(day.revenueGoogle) + Number(day.revenueMeta), 0);

  const avgCac = totalClosed > 0 ? Math.round(totalSpend / totalClosed) : 0;
  const consolidatedRoas = totalSpend > 0 ? parseFloat((totalRevenue / totalSpend).toFixed(2)) : 0;
  const roi = totalSpend > 0 ? Math.round(((totalRevenue - totalSpend) / totalSpend) * 100) : 0;

  // Formatear CLP
  const fmtCLP = (val: number) => {
    return "$" + Math.round(val).toLocaleString("es-CL");
  };

  const customTooltipFormat = (value: any) => [fmtCLP(Number(value)), ""];

  // 2. Desglose por Marca con métricas financieras extendidas para Value Economics
  const brandCards = BRANDS.map((brand) => {
    const brandDays = allBrandsData[brand.id] || [];
    const filteredDays = brandDays.filter((day) => {
      const d = day.date;
      return d >= dateRange.start && d <= dateRange.end;
    });

    const bSpend = filteredDays.reduce((sum, day) => sum + Number(day.spendGoogle) + Number(day.spendMeta), 0);
    const bRevenue = filteredDays.reduce((sum, day) => sum + Number(day.revenueGoogle) + Number(day.revenueMeta), 0);
    const bClosed = filteredDays.reduce((sum, day) => sum + Number(day.closedGoogle) + Number(day.closedMeta), 0);
    const bCac = bClosed > 0 ? Math.round(bSpend / bClosed) : 0;
    const bRoas = bSpend > 0 ? parseFloat((bRevenue / bSpend).toFixed(2)) : 0;
    const bRoi = bSpend > 0 ? Math.round(((bRevenue - bSpend) / bSpend) * 100) : 0;

    // Métricas financieras extendidas
    const bLtv = brand.ltv;
    const bLtvTotal = bClosed * bLtv;
    const bCacRatio = bCac > 0 ? parseFloat((bLtv / bCac).toFixed(1)) : 0;
    const bPayback = brand.avgContractValue > 0 ? parseFloat((bCac / brand.avgContractValue).toFixed(1)) : 0;

    return {
      id: brand.id,
      name: brand.name,
      vertical: brand.vertical,
      spend: bSpend,
      revenue: bRevenue,
      closed: bClosed,
      cac: bCac,
      roas: bRoas,
      roi: bRoi,
      ltv: bLtv,
      ltvTotal: bLtvTotal,
      cacRatio: bCacRatio,
      payback: bPayback,
    };
  });

  // Totales financieros agregados
  const totalLtvGenerated = brandCards.reduce((sum, b) => sum + b.ltvTotal, 0);
  const weightedAvgPayback = totalClosed > 0
    ? parseFloat((brandCards.reduce((sum, b) => sum + (b.payback * b.closed), 0) / totalClosed).toFixed(1))
    : 0;
  const consolidatedLtvCacRatio = totalSpend > 0 ? parseFloat((totalLtvGenerated / totalSpend).toFixed(1)) : 0;

  // ── RENDERIZAR VISTA DE VALUE ECONOMICS ──
  if (activeTab === "economics") {
    return (
      <div className="p-6 space-y-6 fade-in bg-google-gray50">
        {/* SECTION TITLE */}
        <div className="flex items-center gap-2 pb-2 border-b border-google-gray300">
          <DollarSign className="w-5 h-5 text-google-blue" />
          <h2 className="text-lg font-medium text-google-gray800">Value Economics Consolidado del Holding</h2>
        </div>

        {/* FINANCIAL scorecards GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* LTV Total Creado */}
          <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-google-gray600 uppercase tracking-wider block">LTV Total Generado</span>
              <span className="text-2xl font-semibold text-google-green block mt-1">{fmtCLP(totalLtvGenerated)}</span>
            </div>
            <div className="mt-3 text-[11px] text-google-green font-medium">
              <span>Valor a largo plazo de contratos</span>
            </div>
          </div>

          {/* Inversión total */}
          <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-google-gray600 uppercase tracking-wider block">Inversión Ads Total</span>
              <span className="text-2xl font-semibold text-google-gray800 block mt-1">{fmtCLP(totalSpend)}</span>
            </div>
            <div className="mt-3 text-[11px] text-google-gray500">
              <span>Costo total de adquisición</span>
            </div>
          </div>

          {/* CAC Promedio Consolidado */}
          <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-google-gray600 uppercase tracking-wider block">CAC Promedio</span>
              <span className="text-2xl font-semibold text-google-gray800 block mt-1">{fmtCLP(avgCac)}</span>
            </div>
            <div className="mt-3 text-[11px] text-google-gray500">
              <span>Clientes firmados: {totalClosed}</span>
            </div>
          </div>

          {/* LTV:CAC Ratio Consolidado */}
          <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-google-gray600 uppercase tracking-wider block">Relación LTV : CAC</span>
              <span className="text-2xl font-semibold text-google-blue block mt-1">{consolidatedLtvCacRatio} : 1</span>
            </div>
            <div className="mt-3 text-[11px]">
              <span className={`font-semibold ${consolidatedLtvCacRatio >= 3 ? "text-google-green" : "text-google-yellow"}`}>
                {consolidatedLtvCacRatio >= 3 ? "✓ Consolidado Saludable (>3:1)" : "⚠ Ajustar rentabilidad"}
              </span>
            </div>
          </div>

          {/* Payback Period Promedio */}
          <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-google-gray600 uppercase tracking-wider block">Amortización Promedio</span>
              <span className="text-2xl font-semibold text-google-gray800 block mt-1">{weightedAvgPayback} meses</span>
            </div>
            <div className="mt-3 text-[11px] text-google-gray500">
              <span>Tiempo de break-even ponderado</span>
            </div>
          </div>
        </div>

        {/* COMPARATIVE VALUE CREATION CHART */}
        <div className="bg-white border border-google-gray300 rounded p-5">
          <h3 className="text-sm font-medium text-google-gray800 mb-4">Eficiencia Financiera: Inversión Ads vs. LTV Total Generado por Marca</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandCards} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                <XAxis dataKey="name" stroke="#9aa0a6" fontSize={10} />
                <YAxis stroke="#9aa0a6" fontSize={10} tickFormatter={(v) => `$${v/1000000}M`} />
                <Tooltip formatter={customTooltipFormat} contentStyle={{ fontSize: "11px", borderColor: "#dadce0" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar name="Inversión Ads" dataKey="spend" fill="#1a73e8" radius={[2, 2, 0, 0]} />
                <Bar name="LTV Total Generado" dataKey="ltvTotal" fill="#1e8e3e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DETAILED VALUE ECONOMICS TABLE */}
        <div className="bg-white border border-google-gray300 rounded overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-google-gray300 bg-white flex items-center gap-2">
            <Table className="w-4 h-4 text-google-gray600" />
            <h3 className="text-sm font-medium text-google-gray800">Matriz de Rendimiento Financiero y Amortización (Unit Economics)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-google-gray50 text-google-gray600 border-b border-google-gray300 font-medium uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Marca / vertical</th>
                  <th className="px-6 py-3 font-medium text-right">Inversión publicitaria</th>
                  <th className="px-6 py-3 font-medium text-right">Contratos</th>
                  <th className="px-6 py-3 font-medium text-right">CAC Unitario</th>
                  <th className="px-6 py-3 font-medium text-right">LTV Estimado (Unitario)</th>
                  <th className="px-6 py-3 font-medium text-right">LTV Total Creado</th>
                  <th className="px-6 py-3 font-medium text-right">Payback (Meses)</th>
                  <th className="px-6 py-3 font-medium text-right">LTV : CAC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-google-gray200 text-google-gray800">
                {brandCards.map((b) => (
                  <tr key={b.id} className="hover:bg-google-gray50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium block text-google-gray800">{b.name}</span>
                      <span className="text-[10px] text-google-gray500">{b.vertical}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{fmtCLP(b.spend)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-google-blue">{b.closed}</td>
                    <td className="px-6 py-4 text-right">{fmtCLP(b.cac)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-google-gray600">{fmtCLP(b.ltv)}</td>
                    <td className="px-6 py-4 text-right font-bold text-google-green">{fmtCLP(b.ltvTotal)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-google-gray800">{b.payback} meses</td>
                    <td className={`px-6 py-4 text-right font-bold ${b.cacRatio >= 3 ? "text-google-green" : "text-google-yellow"}`}>
                      {b.cacRatio}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado por defecto (Visión General y Rendimiento)
  const trendChartData = data.map((day) => ({
    fecha: day.date.substring(5),
    Inversión: Number(day.spendGoogle) + Number(day.spendMeta),
    Ingresos: Number(day.revenueGoogle) + Number(day.revenueMeta),
  }));

  return (
    <div className="p-6 space-y-6 fade-in bg-google-gray50">
      {/* SECTION TITLE */}
      <div className="flex items-center gap-2 pb-2 border-b border-google-gray300">
        <Layers className="w-5 h-5 text-google-blue" />
        <h2 className="text-lg font-medium text-google-gray800">Resumen Consolidado de Negocio</h2>
      </div>

      {/* KPI SCORING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI: Inversión */}
        <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-google-gray600 uppercase tracking-wider block">Inversión Consolidada</span>
            <span className="text-2xl font-semibold text-google-gray800 block mt-1">{fmtCLP(totalSpend)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-google-gray500">Google: {fmtCLP(totalSpendGoogle)}</span>
            <span className="text-google-gray500">Meta: {fmtCLP(totalSpendMeta)}</span>
          </div>
        </div>

        {/* KPI: Ingresos */}
        <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-google-gray600 uppercase tracking-wider block">Ingresos Atribuibles</span>
            <span className="text-2xl font-semibold text-google-green block mt-1">{fmtCLP(totalRevenue)}</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-google-green font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Retorno de publicidad directo</span>
          </div>
        </div>

        {/* KPI: ROAS */}
        <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-google-gray600 uppercase tracking-wider block">ROAS Promedio</span>
            <span className="text-2xl font-semibold text-google-blue block mt-1">{consolidatedRoas}x</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-google-blue">
            <span>Retorno de inversión en Ads</span>
          </div>
        </div>

        {/* KPI: CAC */}
        <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-google-gray600 uppercase tracking-wider block">CAC Promedio</span>
            <span className="text-2xl font-semibold text-google-gray800 block mt-1">{fmtCLP(avgCac)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-google-gray600">
            <span>Contratos: {totalClosed}</span>
            <span>Leads: {totalLeads}</span>
          </div>
        </div>

        {/* KPI: ROI */}
        <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-google-gray600 uppercase tracking-wider block">ROI de Marketing</span>
            <span className={`text-2xl font-semibold block mt-1 ${roi >= 0 ? "text-google-green" : "text-google-red"}`}>
              {roi}%
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-medium">
            {roi >= 0 ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5 text-google-green" />
                <span className="text-google-green">Rentable</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-3.5 h-3.5 text-google-red" />
                <span className="text-google-red">Pérdida</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TREND CHART (Spend vs Revenue) */}
      <div className="bg-white border border-google-gray300 rounded p-5">
        <h3 className="text-sm font-medium text-google-gray800 mb-4 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-google-blue" />
          <span>Tendencia Histórica Diaria · Inversión vs. Ingresos del Holding</span>
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1a73e8" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e8e3e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1e8e3e" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
              <XAxis dataKey="fecha" stroke="#9aa0a6" fontSize={10} />
              <YAxis stroke="#9aa0a6" fontSize={10} tickFormatter={(v) => `$${(v/1000)}k`} />
              <Tooltip formatter={customTooltipFormat} contentStyle={{ fontSize: "11px", borderColor: "#dadce0" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area name="Inversión" type="monotone" dataKey="Inversión" stroke="#1a73e8" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={2} />
              <Area name="Ingresos" type="monotone" dataKey="Ingresos" stroke="#1e8e3e" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COMPARATIVE GRAPHS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Investment & Return Bar Chart */}
        <div className="bg-white border border-google-gray300 rounded p-5">
          <h3 className="text-sm font-medium text-google-gray800 mb-4">Inversión vs. Retorno por Marca</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandCards} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                <XAxis dataKey="name" stroke="#9aa0a6" fontSize={9} />
                <YAxis stroke="#9aa0a6" fontSize={9} tickFormatter={(v) => `$${(v/1000000)}M`} />
                <Tooltip formatter={customTooltipFormat} contentStyle={{ fontSize: "11px", borderColor: "#dadce0" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar name="Inversión" dataKey="spend" fill="#1a73e8" radius={[2, 2, 0, 0]} />
                <Bar name="Ingresos" dataKey="revenue" fill="#1e8e3e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand ROAS comparisons */}
        <div className="bg-white border border-google-gray300 rounded p-5">
          <h3 className="text-sm font-medium text-google-gray800 mb-4">Comparativa de ROAS por Marca</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandCards} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                <XAxis type="number" stroke="#9aa0a6" fontSize={10} tickFormatter={(v) => `${v}x`} />
                <YAxis dataKey="name" type="category" stroke="#9aa0a6" fontSize={9} width={100} />
                <Tooltip formatter={(v) => [`${v}x`, "ROAS"]} contentStyle={{ fontSize: "11px", borderColor: "#dadce0" }} />
                <Bar name="ROAS Atribuido" dataKey="roas" fill="#f9ab00" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* COMPARATIVE BRANDS PERFORMANCE TABLE */}
      <div className="bg-white border border-google-gray300 rounded overflow-hidden">
        <div className="px-5 py-4 border-b border-google-gray300 bg-white">
          <h3 className="text-sm font-medium text-google-gray800">Desglose de Rendimiento por Unidad de Negocio</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-google-gray50 text-google-gray600 border-b border-google-gray300 font-medium uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Marca / Vertical</th>
                <th className="px-6 py-3 font-medium text-right">Inversión Ads</th>
                <th className="px-6 py-3 font-medium text-right">Cierres Realizados</th>
                <th className="px-6 py-3 font-medium text-right">Costo Adquisición (CAC)</th>
                <th className="px-6 py-3 font-medium text-right">Ingresos Atribuibles</th>
                <th className="px-6 py-3 font-medium text-right">ROAS</th>
                <th className="px-6 py-3 font-medium text-right">ROI Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-google-gray200 text-google-gray800">
              {brandCards.map((b) => (
                <tr key={b.id} className="hover:bg-google-gray50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium block text-google-gray800">{b.name}</span>
                    <span className="text-[10px] text-google-gray500">{b.vertical}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{fmtCLP(b.spend)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-google-blue">{b.closed}</td>
                  <td className="px-6 py-4 text-right">{fmtCLP(b.cac)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-google-green">{fmtCLP(b.revenue)}</td>
                  <td className="px-6 py-4 text-right font-bold text-google-gray800">{b.roas}x</td>
                  <td className={`px-6 py-4 text-right font-semibold ${b.roi >= 0 ? "text-google-green" : "text-google-red"}`}>
                    {b.roi >= 0 ? `+${b.roi}%` : `${b.roi}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ConsolidatedView;
