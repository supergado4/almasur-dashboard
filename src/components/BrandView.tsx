import React from "react";
import { type DailyData, BRANDS } from "../data/mockData";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import { TrendingUp, Users, ArrowUpRight, DollarSign, Clock, Landmark, ShieldCheck, Activity } from "lucide-react";

interface BrandViewProps {
  brandId: string;
  data: DailyData[]; // Daily data for this brand
  dateRange: { start: string; end: string };
  activeTab: "overview" | "performance" | "economics" | "tasks";
}

export const BrandView: React.FC<BrandViewProps> = ({
  brandId,
  data,
  activeTab,
}) => {
  const brand = BRANDS.find((b) => b.id === brandId)!;

  // ── CALCULAR MÉTRICAS ──
  const calculateChannelMetrics = (platform: "google" | "meta" | "total") => {
    let spend = 0;
    let leads = 0;
    let contacted = 0;
    let qualified = 0;
    let closed = 0;
    let revenue = 0;

    data.forEach((day) => {
      if (platform === "google" || platform === "total") {
        spend += Number(day.spendGoogle);
        leads += Number(day.leadsGoogle);
        contacted += Number(day.contactedGoogle);
        qualified += Number(day.qualifiedGoogle);
        closed += Number(day.closedGoogle);
        revenue += Number(day.revenueGoogle);
      }
      if (platform === "meta" || platform === "total") {
        spend += Number(day.spendMeta);
        leads += Number(day.leadsMeta);
        contacted += Number(day.contactedMeta);
        qualified += Number(day.qualifiedMeta);
        closed += Number(day.closedMeta);
        revenue += Number(day.revenueMeta);
      }
    });

    const cpl = leads > 0 ? Math.round(spend / leads) : 0;
    const contactedRate = leads > 0 ? Math.round((contacted / leads) * 100) : 0;
    const qualificationRate = contacted > 0 ? Math.round((qualified / contacted) * 100) : 0;
    const cac = closed > 0 ? Math.round(spend / closed) : 0;
    const roas = spend > 0 ? parseFloat((revenue / spend).toFixed(2)) : 0;
    const roi = spend > 0 ? Math.round(((revenue - spend) / spend) * 100) : 0;

    return {
      spend,
      leads,
      contacted,
      contactedRate,
      qualified,
      qualificationRate,
      closed,
      revenue,
      cpl,
      cac,
      roas,
      roi,
    };
  };

  const google = calculateChannelMetrics("google");
  const meta = calculateChannelMetrics("meta");
  const total = calculateChannelMetrics("total");

  // Value Economics Scorecard values
  const ltv = brand.ltv;
  const cacRatio = total.cac > 0 ? parseFloat((ltv / total.cac).toFixed(1)) : 0;
  const netProfit = total.revenue - total.spend;
  
  // Payback period (CAC / Average Contract Value)
  const paybackPeriodMonths = brand.avgContractValue > 0 ? parseFloat((total.cac / brand.avgContractValue).toFixed(1)) : 0;
  // Margen neto estimado
  const netMarginPercent = total.revenue > 0 ? Math.round((netProfit / total.revenue) * 100) : 0;

  const fmtCLP = (val: number) => {
    return "$" + Math.round(val).toLocaleString("es-CL");
  };

  const customTooltipFormat = (value: any) => [fmtCLP(Number(value)), ""];

  // ── PREPARAR DATOS GRÁFICOS DE RENDIMIENTO ──
  const trendData = data.map((day) => ({
    fecha: day.date.substring(5),
    "Google Ads": Number(day.spendGoogle),
    "Meta Ads": Number(day.spendMeta),
    Inversión: Number(day.spendGoogle) + Number(day.spendMeta),
    Revenue: Number(day.revenueGoogle) + Number(day.revenueMeta),
  }));

  // ── PREPARAR CURVA DE RETORNO (PAYBACK) PARA VALUE ECONOMICS ──
  const paybackCurveData = [];
  const monthlyFee = brand.avgContractValue;
  const paybackCAC = total.cac;
  for (let m = 0; m <= 12; m++) {
    paybackCurveData.push({
      mes: `Mes ${m}`,
      "Costo CAC": paybackCAC,
      "Retorno Neto Acumulado": Math.round((m * monthlyFee) - paybackCAC),
    });
  }

  // Si el tab activo es Value Economics
  if (activeTab === "economics") {
    return (
      <div className="p-6 space-y-6 fade-in bg-google-gray50">
        {/* HEADER BRAND */}
        <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-google-blueLight text-google-blue text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Análisis Financiero · {brand.vertical}
            </span>
            <h2 className="text-lg font-medium text-google-gray800 mt-1">Value Economics · {brand.name}</h2>
            <p className="text-xs text-google-gray600 mt-0.5">Métricas de rentabilidad y amortización de adquisición de clientes a largo plazo.</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-google-gray600 border-l border-google-gray300 pl-4">
            <div>
              <span className="block text-[10px] text-google-gray500 uppercase font-semibold">Valor Contrato Mensual</span>
              <span className="font-semibold text-google-gray800 text-sm">{fmtCLP(brand.avgContractValue)}</span>
            </div>
            <div>
              <span className="block text-[10px] text-google-gray500 uppercase font-semibold">LTV Teórico Estimado</span>
              <span className="font-semibold text-google-green text-sm">{fmtCLP(brand.ltv)}</span>
            </div>
          </div>
        </div>

        {/* CORE FINANCIAL scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* LTV */}
          <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-google-gray600 uppercase tracking-wider block">Customer Lifetime Value</span>
              <span className="text-xl font-semibold text-google-green block mt-1">{fmtCLP(ltv)}</span>
            </div>
            <span className="text-[10px] text-google-gray500 mt-2 block">
              Valor estimado de vida de un contrato
            </span>
          </div>

          {/* CAC Promedio */}
          <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-google-gray600 uppercase tracking-wider block">CAC Real Promedio</span>
              <span className="text-xl font-semibold text-google-gray800 block mt-1">{fmtCLP(total.cac)}</span>
            </div>
            <span className="text-[10px] text-google-gray500 mt-2 block">
              Inversión total / cierres reales
            </span>
          </div>

          {/* LTV:CAC Ratio */}
          <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-google-gray600 uppercase tracking-wider block">Relación LTV : CAC</span>
              <span className="text-xl font-semibold text-google-blue block mt-1">{cacRatio} : 1</span>
            </div>
            <span className={`text-[10px] font-medium mt-2 block ${cacRatio >= 3 ? "text-google-green" : "text-google-yellow"}`}>
              {cacRatio >= 3 ? "✓ Relación Saludable (>3:1)" : "⚠ Ajustar eficiencia"}
            </span>
          </div>

          {/* Payback period */}
          <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-google-gray600 uppercase tracking-wider block">Período Recuperación</span>
              <span className="text-xl font-semibold text-google-gray800 block mt-1">{paybackPeriodMonths} meses</span>
            </div>
            <span className="text-[10px] text-google-gray500 mt-2 block">
              Tiempo para amortizar el CAC
            </span>
          </div>

          {/* Margen de Contribución */}
          <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-google-gray600 uppercase tracking-wider block">Margen Neto de Campaña</span>
              <span className={`text-xl font-semibold block mt-1 ${netProfit >= 0 ? "text-google-green" : "text-google-red"}`}>
                {netMarginPercent}%
              </span>
            </div>
            <span className="text-[10px] text-google-gray500 mt-2 block">
              Porcentaje de rentabilidad directa
            </span>
          </div>
        </div>

        {/* PAYBACK ANALYSIS CURVE & RECOMMENDATION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Curve chart */}
          <div className="bg-white border border-google-gray300 rounded p-5 lg:col-span-2">
            <h3 className="text-sm font-medium text-google-gray800 mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-google-blue" />
              <span>Curva de Retorno del CAC & Punto de Equilibrio (Break-Even)</span>
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paybackCurveData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
                  <XAxis dataKey="mes" stroke="#9aa0a6" fontSize={10} />
                  <YAxis stroke="#9aa0a6" fontSize={10} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip formatter={customTooltipFormat} contentStyle={{ fontSize: "11px", borderColor: "#dadce0" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <ReferenceLine y={0} stroke="#ea4335" strokeDasharray="3 3" label={{ value: 'Equilibrio ($0)', fill: '#ea4335', fontSize: 9, position: 'top' }} />
                  <Area name="Retorno Neto Acumulado" type="monotone" dataKey="Retorno Neto Acumulado" stroke="#1e8e3e" fill="#e6f4ea" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analysis box */}
          <div className="bg-white border border-google-gray300 rounded p-5 space-y-4">
            <h3 className="text-sm font-semibold text-google-gray800 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-google-blue" />
              <span>Diagnóstico de Viabilidad</span>
            </h3>
            
            <div className="space-y-3 text-xs text-google-gray650">
              <div className="p-3 bg-google-gray50 rounded border border-google-gray200">
                <span className="font-bold text-google-gray800 block mb-1">Costo Adquisición vs LTV:</span>
                El costo de adquirir un cliente nuevo es de <span className="font-semibold text-google-gray800">{fmtCLP(total.cac)}</span>, mientras que el valor proyectado de vida del contrato (LTV) es de <span className="font-semibold text-google-green">{fmtCLP(brand.ltv)}</span>. Esto genera un retorno neto a largo plazo de <span className="font-semibold text-google-green">{fmtCLP(brand.ltv - total.cac)}</span> por cliente.
              </div>

              <div className="p-3 bg-google-gray50 rounded border border-google-gray200">
                <span className="font-bold text-google-gray800 block mb-1">Análisis de Amortización:</span>
                Dado un cobro mensual promedio de <span className="font-semibold text-google-gray800">{fmtCLP(brand.avgContractValue)}</span>, la empresa recupera completamente la inversión publicitaria de captación en el **mes {paybackPeriodMonths}** del contrato.
              </div>

              <div className="p-3 bg-google-gray50 rounded border border-google-gray200">
                <span className="font-bold text-google-gray800 block mb-1">Ratio de Salud:</span>
                La relación LTV:CAC es de <span className="font-bold text-google-blue">{cacRatio}x</span>. 
                {cacRatio >= 3 ? (
                  <span className="text-google-green block mt-1 font-medium">✓ Excelente: supera el estándar de la industria (3:1), indicando alta rentabilidad y escalabilidad del canal.</span>
                ) : (
                  <span className="text-google-yellow block mt-1 font-medium">⚠ Ajustar: por debajo del estándar (3:1). Se recomienda optimizar el costo por lead o buscar renovaciones de contratos más extensas.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado por defecto (Visión General y Rendimiento)
  return (
    <div className="p-6 space-y-6 fade-in bg-google-gray50">
      {/* HEADER BRAND */}
      <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-google-blueLight text-google-blue text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            Vertical: {brand.vertical}
          </span>
          <h2 className="text-lg font-medium text-google-gray800 mt-1">{brand.name}</h2>
          <p className="text-xs text-google-gray600 mt-0.5">{brand.description}</p>
        </div>

        <div className="flex items-center gap-4 text-xs text-google-gray600 border-l border-google-gray300 pl-4">
          <div>
            <span className="block text-[10px] text-google-gray500 uppercase font-semibold">Valor Contrato Prom.</span>
            <span className="font-semibold text-google-gray800 text-sm">{fmtCLP(brand.avgContractValue)}</span>
          </div>
          <div>
            <span className="block text-[10px] text-google-gray500 uppercase font-semibold">LTV Estimado</span>
            <span className="font-semibold text-google-green text-sm">{fmtCLP(brand.ltv)}</span>
          </div>
        </div>
      </div>

      {/* CORE ECONOMIC METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LTV:CAC Ratio */}
        <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-google-gray600 uppercase tracking-wider block">Relación LTV : CAC</span>
            <span className="text-2xl font-semibold text-google-gray800 block mt-1">{cacRatio} : 1</span>
          </div>
          <div className="mt-3 text-[11px]">
            {cacRatio >= 3 ? (
              <span className="text-google-green font-medium">✓ Relación saludable (&gt; 3:1)</span>
            ) : (
              <span className="text-google-yellow font-medium">⚠ Ajustar eficiencia de captación</span>
            )}
          </div>
        </div>

        {/* CAC Real Promedio */}
        <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-google-gray600 uppercase tracking-wider block">Costo de Adquisición (CAC)</span>
            <span className="text-2xl font-semibold text-google-gray800 block mt-1">{fmtCLP(total.cac)}</span>
          </div>
          <div className="mt-3 text-[11px] text-google-gray500">
            <span>Inversión total / contratos firmados</span>
          </div>
        </div>

        {/* Retorno Neto */}
        <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-google-gray600 uppercase tracking-wider block">Retorno Comercial Neto</span>
            <span className={`text-2xl font-semibold block mt-1 ${netProfit >= 0 ? "text-google-green" : "text-google-red"}`}>
              {fmtCLP(netProfit)}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-google-gray500">
            <span>Ingresos atribuibles menos inversión</span>
          </div>
        </div>

        {/* ROAS Combinado */}
        <div className="bg-white border border-google-gray300 rounded p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-google-gray600 uppercase tracking-wider block">ROAS Combinado</span>
            <span className="text-2xl font-semibold text-google-blue block mt-1">{total.roas}x</span>
          </div>
          <div className="mt-3 text-[11px]">
            <span className={`font-semibold ${total.roi >= 0 ? "text-google-green" : "text-google-red"}`}>
              ROI: {total.roi >= 0 ? `+${total.roi}%` : `${total.roi}%`}
            </span>
          </div>
        </div>
      </div>

      {/* CHANNEL SPLIT: Google vs Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Ads Card */}
        <div className="bg-white border border-google-gray300 rounded overflow-hidden">
          <div className="px-5 py-3.5 border-b border-google-gray300 bg-white flex items-center justify-between">
            <h3 className="text-sm font-semibold text-google-gray800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-google-blue" />
              <span>Google Ads (Búsqueda Activa)</span>
            </h3>
            <span className="text-[10px] font-medium bg-google-blueLight text-google-blue rounded px-2 py-0.5">Google Search</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-google-gray500 block uppercase">Inversión</span>
                <span className="text-lg font-medium text-google-gray800">{fmtCLP(google.spend)}</span>
              </div>
              <div>
                <span className="text-[10px] text-google-gray500 block uppercase">Ingresos Atribuibles</span>
                <span className="text-lg font-medium text-google-green">{fmtCLP(google.revenue)}</span>
              </div>
              <div>
                <span className="text-[10px] text-google-gray500 block uppercase">Conversiones (Contratos)</span>
                <span className="text-lg font-medium text-google-gray800">{google.closed}</span>
              </div>
              <div>
                <span className="text-[10px] text-google-gray500 block uppercase">ROAS</span>
                <span className="text-lg font-bold text-google-blue">{google.roas}x</span>
              </div>
            </div>

            <div className="border-t border-google-gray200 pt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-google-gray50 rounded p-1.5">
                <span className="text-[9px] text-google-gray500 block">CPL</span>
                <span className="font-semibold">{fmtCLP(google.cpl)}</span>
              </div>
              <div className="bg-google-gray50 rounded p-1.5">
                <span className="text-[9px] text-google-gray500 block">CAC</span>
                <span className="font-semibold">{fmtCLP(google.cac)}</span>
              </div>
              <div className="bg-google-gray50 rounded p-1.5">
                <span className="text-[9px] text-google-gray500 block">ROI</span>
                <span className={`font-semibold ${google.roi >= 0 ? "text-google-green" : "text-google-red"}`}>
                  {google.roi}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Meta Ads Card */}
        <div className="bg-white border border-google-gray300 rounded overflow-hidden">
          <div className="px-5 py-3.5 border-b border-google-gray300 bg-white flex items-center justify-between">
            <h3 className="text-sm font-semibold text-google-gray800 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Meta Ads (Social & Retargeting)</span>
            </h3>
            <span className="text-[10px] font-medium bg-purple-100 text-purple-700 rounded px-2 py-0.5">Meta Campaign</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-google-gray500 block uppercase">Inversión</span>
                <span className="text-lg font-medium text-google-gray800">{fmtCLP(meta.spend)}</span>
              </div>
              <div>
                <span className="text-[10px] text-google-gray500 block uppercase">Ingresos Atribuibles</span>
                <span className="text-lg font-medium text-google-green">{fmtCLP(meta.revenue)}</span>
              </div>
              <div>
                <span className="text-[10px] text-google-gray500 block uppercase">Conversiones (Contratos)</span>
                <span className="text-lg font-medium text-google-gray800">{meta.closed}</span>
              </div>
              <div>
                <span className="text-[10px] text-google-gray500 block uppercase">ROAS</span>
                <span className="text-lg font-bold text-google-blue">{meta.roas}x</span>
              </div>
            </div>

            <div className="border-t border-google-gray200 pt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-google-gray50 rounded p-1.5">
                <span className="text-[9px] text-google-gray500 block">CPL</span>
                <span className="font-semibold">{fmtCLP(meta.cpl)}</span>
              </div>
              <div className="bg-google-gray50 rounded p-1.5">
                <span className="text-[9px] text-google-gray500 block">CAC</span>
                <span className="font-semibold">{fmtCLP(meta.cac)}</span>
              </div>
              <div className="bg-google-gray50 rounded p-1.5">
                <span className="text-[9px] text-google-gray500 block">ROI</span>
                <span className={`font-semibold ${meta.roi >= 0 ? "text-google-green" : "text-google-red"}`}>
                  {meta.roi}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HERMES PIPELINE FUNNEL (CRM CONTROL) */}
      <div className="bg-white border border-google-gray300 rounded p-5">
        <h3 className="text-sm font-medium text-google-gray800 mb-4 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-google-blue" />
          <span>Trazabilidad Comercial y Tasa de Contacto (Sistema HERMES)</span>
        </h3>
        
        {/* Horizontal Pipeline Steps */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          {/* Step 1: Leads */}
          <div className="w-full md:w-1/4 text-center bg-google-gray50 border border-google-gray300 rounded p-4 relative">
            <span className="text-xs font-semibold text-google-gray650 uppercase">1. Leads Entrantes</span>
            <span className="text-2xl font-bold block text-google-gray800 mt-1">{total.leads}</span>
            <span className="text-[10px] text-google-gray500 block mt-1">Meta + Google Ads</span>
            
            {/* Visual connecting Arrow */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-google-gray300 rounded-full p-1 z-10 shadow-sm text-google-gray500 text-[10px] font-bold">
              →
            </div>
          </div>

          {/* Step 2: Contacted */}
          <div className="w-full md:w-1/4 text-center bg-google-gray50 border border-google-gray300 rounded p-4 relative">
            <span className="text-xs font-semibold text-google-gray655 uppercase">2. Contacto Efectivo</span>
            <span className="text-2xl font-bold block text-google-blue mt-1">
              {google.contacted + meta.contacted}
            </span>
            <span className="text-xs font-semibold text-google-green block mt-1">
              Velocidad: {total.contactedRate}%
            </span>
            <span className="text-[9px] text-google-green font-medium block">SLA &lt; 5 min de respuesta</span>

            {/* Visual connecting Arrow */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-google-gray300 rounded-full p-1 z-10 shadow-sm text-google-gray500 text-[10px] font-bold">
              →
            </div>
          </div>

          {/* Step 3: Qualified */}
          <div className="w-full md:w-1/4 text-center bg-google-gray50 border border-google-gray300 rounded p-4 relative">
            <span className="text-xs font-semibold text-google-gray650 uppercase">3. Leads Calificados</span>
            <span className="text-2xl font-bold block text-google-gray800 mt-1">
              {google.qualified + meta.qualified}
            </span>
            <span className="text-xs font-semibold text-google-gray700 block mt-1">
              Calificación: {total.qualificationRate}%
            </span>
            <span className="text-[9px] text-google-gray500 block">Filtro de perfil de compra</span>

            {/* Visual connecting Arrow */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-google-gray300 rounded-full p-1 z-10 shadow-sm text-google-gray500 text-[10px] font-bold">
              →
            </div>
          </div>

          {/* Step 4: Closed */}
          <div className="w-full md:w-1/4 text-center bg-google-gray50 border border-google-blue rounded p-4 relative ring-1 ring-google-blue ring-opacity-50">
            <span className="text-xs font-semibold text-google-blue uppercase">4. Cierres Firmados</span>
            <span className="text-2xl font-bold block text-google-green mt-1">{total.closed}</span>
            <span className="text-xs font-semibold text-google-blue block mt-1">
              Conversión Final: {total.leads > 0 ? ((total.closed / total.leads) * 100).toFixed(1) : 0}%
            </span>
            <span className="text-[9px] text-google-blue block">Retorno: {fmtCLP(total.revenue)}</span>
          </div>
        </div>
      </div>

      {/* TREND CHART */}
      <div className="bg-white border border-google-gray300 rounded p-5">
        <h3 className="text-sm font-medium text-google-gray800 mb-4 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-google-blue" />
          <span>Desglose de Inversión Ads Diaria</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
              <XAxis dataKey="fecha" stroke="#9aa0a6" fontSize={10} />
              <YAxis stroke="#9aa0a6" fontSize={10} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={customTooltipFormat} contentStyle={{ fontSize: "11px", borderColor: "#dadce0" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area name="Google Ads" type="monotone" dataKey="Google Ads" stroke="#1a73e8" fill="#e8f0fe" strokeWidth={2} />
              <Area name="Meta Ads" type="monotone" dataKey="Meta Ads" stroke="#9333ea" fill="#faf5ff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default BrandView;
