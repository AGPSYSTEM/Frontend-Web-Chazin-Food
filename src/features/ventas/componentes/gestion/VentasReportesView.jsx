import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Download, TrendingUp, Calendar, History, BarChart2, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const CustomChartTooltip = ({ active, payload, label, unit = "Ingresos", isCurrency = true }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const formatted = isCurrency ? `$${Number(val).toLocaleString("es-CO")}` : `${val} ${val === 1 ? 'venta' : 'ventas'}`;
    const payloadData = payload[0].payload;
    const titleLabel = payloadData?.mesCompleto || payloadData?.fechaCompleta || payloadData?.dia || label;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-gray-700 dark:text-gray-200 mb-0.5">{titleLabel}</p>
        <p className="font-extrabold text-[#10B981] text-sm">
          {unit} : {formatted}
        </p>
        {payloadData?.cantidadVentas !== undefined && isCurrency && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Volumen: {payloadData.cantidadVentas} {payloadData.cantidadVentas === 1 ? 'venta' : 'ventas'}
          </p>
        )}
        {payloadData?.ventas !== undefined && !isCurrency && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Facturado: $${Number(payloadData.ventas).toLocaleString("es-CO")} COP
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function VentasReportesView({ ventas = [], selectedPeriod = "personalizado" }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [vistaTemporal, setVistaTemporal] = useState("historico"); // "historico" | "semanal" | "fechas"

  // Sincronizar automáticamente la vista del gráfico según el período global seleccionado
  useMemo(() => {
    if (selectedPeriod === "7_dias" || selectedPeriod === "hoy") {
      setVistaTemporal("semanal");
    } else if (selectedPeriod === "este_mes") {
      setVistaTemporal("fechas");
    } else {
      setVistaTemporal("historico");
    }
  }, [selectedPeriod]);

  const reportData = useMemo(() => {
    const daysMap = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 0: "Dom" };
    const diasOrder = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const dailyStats = { Lun: { ventas: 0, pedidos: 0 }, Mar: { ventas: 0, pedidos: 0 }, Mié: { ventas: 0, pedidos: 0 }, Jue: { ventas: 0, pedidos: 0 }, Vie: { ventas: 0, pedidos: 0 }, Sáb: { ventas: 0, pedidos: 0 }, Dom: { ventas: 0, pedidos: 0 } };

    // Meses del año para histórico mensual
    const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const mesesCompletos = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const monthlyStats = mesesNombres.map((mes, idx) => ({
      mes,
      mesCompleto: mesesCompletos[idx],
      ventas: 0,
      cantidadVentas: 0
    }));

    // Fechas históricas para agrupación cronológica
    const fechasMap = {};

    const productCounts = {};
    const paymentCounts = { "Efectivo (Punto Físico)": 0, Tarjeta: 0, Transferencia: 0 };

    ventas.forEach((v) => {
      const vDate = v.fecha || v.fechaVenta ? new Date(v.fecha || v.fechaVenta) : null;
      if (vDate && !isNaN(vDate.getTime())) {
        // Agrupación por día de la semana
        const dayName = daysMap[vDate.getDay()];
        if (dailyStats[dayName]) {
          dailyStats[dayName].ventas += Number(v.total || 0);
          dailyStats[dayName].pedidos += 1;
        }

        // Agrupación por mes (Histórico Mensual)
        const monthIdx = vDate.getMonth();
        if (monthIdx >= 0 && monthIdx < 12) {
          monthlyStats[monthIdx].ventas += Number(v.total || 0);
          monthlyStats[monthIdx].cantidadVentas += 1;
        }

        // Agrupación cronológica por fecha
        const dateKey = vDate.toISOString().split("T")[0];
        if (!fechasMap[dateKey]) {
          const displayDate = `${vDate.getDate().toString().padStart(2, "0")}/${(vDate.getMonth() + 1).toString().padStart(2, "0")}`;
          fechasMap[dateKey] = {
            fechaKey: dateKey,
            fecha: displayDate,
            fechaCompleta: `${displayDate}/${vDate.getFullYear()}`,
            ventas: 0,
            cantidadVentas: 0
          };
        }
        fechasMap[dateKey].ventas += Number(v.total || 0);
        fechasMap[dateKey].cantidadVentas += 1;
      }

      const metodo = String(v.metodoPago || v.metodo_pago || "Efectivo").toLowerCase();
      if (metodo.includes("tarjeta") || metodo.includes("wompi") || metodo.includes("online")) {
        paymentCounts.Tarjeta += 1;
      } else if (metodo.includes("transfer") || metodo.includes("nequi") || metodo.includes("davi") || metodo.includes("pse")) {
        paymentCounts.Transferencia += 1;
      } else {
        paymentCounts["Efectivo (Punto Físico)"] += 1;
      }

      // Priorizar detalles relacionales si existen
      const prods = (Array.isArray(v.detalles) && v.detalles.length > 0)
        ? v.detalles.map(d => ({
            nombre: d.variante?.producto?.nombre || d.variante?.nombre || "Producto",
            nombreProducto: d.variante?.producto?.nombre,
            nombreVariante: d.variante?.nombre,
            cantidad: d.cantidad
          }))
        : (Array.isArray(v.productos) && v.productos.length > 0 ? v.productos : []);

      const variantToProductMap = {
        "clásica 150g": "Hamburguesa Clásica Chazin",
        "doble carne 300g": "Hamburguesa Doble Carne & Tocineta",
        "pollo crispy 180g": "Hamburguesa Pollo Crispy Gourmet",
        "individual bbq bacon 150g": "Hamburguesa BBQ Bacon Chazin",
        "doble carne bbq bacon 300g": "Hamburguesa BBQ Bacon Chazin",
        "mexicana clásica": "Hamburguesa Mexicana Chazin",
        "extra picante con doble jalapeño": "Hamburguesa Mexicana Chazin",
        "individual campesina": "Hamburguesa Campesina Chazin",
        "perro especial": "Perro Caliente Especial Americano",
        "perro suizo gourmet": "Perro Suizo Chazin",
        "salchipapa personal grande": "Salchipapa Salvaje Gourmet",
        "combo pareja completo": "Combo Pareja Chazin",
        "perro mexicano clásico": "Perro Caliente Mexicano",
        "perro criollo gourmet": "Perro Criollo Especial Chazin",
        "porción personal grande": "Salchipapa Criolla Chazin",
        "familiar para compartir (2 personas)": "Salchipapa Criolla Chazin",
        "porción costeña grande": "Salchipapa Costeña Chazin",
        "porción individual 150g": "Porción Papas a la Francesa (150g)",
        "porción individual": "Papas Corral Grandes",
        "sin azúcar / light 400ml": "Gaseosa Coca-Cola 400ml",
        "botella 1.5 litros": "Gaseosa Manzana Postobón 400ml"
      };

      prods.forEach((p) => {
        let rawName = p.nombreProducto || p.variante?.producto?.nombre || p.nombre || p.variante?.nombre || null;
        if (rawName && (rawName === "Producto" || rawName === "Producto General" || rawName.startsWith("Producto #"))) {
          rawName = p.variante?.producto?.nombre || p.variante?.nombre || null;
        }

        const low = String(rawName || "").toLowerCase().trim();
        if (
          !rawName ||
          rawName === "Producto" ||
          rawName === "Pedido de Venta" ||
          rawName === "Producto General" ||
          rawName.startsWith("Producto #") ||
          low.startsWith("sin ") ||
          low === "tester" ||
          low.startsWith("test") ||
          low.startsWith("prueba") ||
          low.startsWith("dummy")
        ) return;

        let nombreLimpio = rawName.replace(/\s*\(.*?\)/g, "").replace(/\s*-\s*base/i, "").trim();
        if (!nombreLimpio || nombreLimpio === "Producto" || nombreLimpio === "Pedido de Venta" || nombreLimpio === "Producto General") return;

        const cleanLow = nombreLimpio.toLowerCase();
        if (variantToProductMap[cleanLow]) {
          nombreLimpio = variantToProductMap[cleanLow];
        }

        const groupKey = nombreLimpio.toLowerCase();
        if (!productCounts[groupKey]) {
          productCounts[groupKey] = { nombre: nombreLimpio, cantidad: 0 };
        }
        productCounts[groupKey].cantidad += (Number(p.cantidad) || 1);
      });
    });

    const hasRealSales = ventas.length > 0;

    const ingresosDiarios = diasOrder.map((dia) => ({
      dia,
      ventas: dailyStats[dia].ventas,
      cantidadVentas: dailyStats[dia].pedidos,
      pedidos: dailyStats[dia].pedidos
    }));

    const historicoFechas = Object.keys(fechasMap)
      .sort()
      .map(key => fechasMap[key]);

    const sortedProducts = Object.values(productCounts)
      .map(({ nombre, cantidad }) => ({
        nombre,
        nombreLimpio: nombre.replace(/\s*\(.*?\)/g, "").trim(),
        cantidad
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    const productosMasVendidos = sortedProducts;

    const totalMetodosCount = (paymentCounts["Efectivo (Punto Físico)"] + paymentCounts.Tarjeta + paymentCounts.Transferencia) || 0;
    
    let metodosPago = [];
    if (hasRealSales && totalMetodosCount > 0) {
      const rawMethods = [
        { name: "Efectivo (Punto Físico)", count: paymentCounts["Efectivo (Punto Físico)"] },
        { name: "Tarjeta", count: paymentCounts.Tarjeta },
        { name: "Transferencia", count: paymentCounts.Transferencia }
      ].filter(m => m.count > 0);

      let allocatedSum = 0;
      metodosPago = rawMethods.map(m => {
        const exactPct = (m.count / totalMetodosCount) * 100;
        const floorPct = Math.floor(exactPct);
        allocatedSum += floorPct;
        return {
          name: m.name,
          count: m.count,
          value: floorPct,
          decimal: exactPct - floorPct
        };
      });

      let remainder = 100 - allocatedSum;
      const sortedByDecimal = [...metodosPago].sort((a, b) => b.decimal - a.decimal);
      for (let i = 0; i < remainder; i++) {
        const item = metodosPago.find(m => m.name === sortedByDecimal[i]?.name);
        if (item) item.value += 1;
      }
      metodosPago.sort((a, b) => b.count - a.count);
    }

    const totalIngresos = ventas.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0);
    const totalVentasCount = ventas.length;
    const ticketPromedio = totalVentasCount > 0 ? Math.round(totalIngresos / totalVentasCount) : 0;

    const topMonth = [...monthlyStats].sort((a, b) => b.ventas - a.ventas)[0];
    const topMonthStr = topMonth && topMonth.ventas > 0 ? `${topMonth.mesCompleto} — $${topMonth.ventas.toLocaleString("es-CO")} COP (${topMonth.cantidadVentas} ventas)` : "N/A";

    const topDay = [...ingresosDiarios].sort((a, b) => b.ventas - a.ventas)[0];
    const topDayStr = topDay && topDay.ventas > 0 ? `${topDay.dia} — $${topDay.ventas.toLocaleString("es-CO")} COP` : "N/A";
    const topProdStr = sortedProducts.length > 0 ? `${sortedProducts[0].nombreLimpio} (${sortedProducts[0].cantidad} und.)` : "N/A";
    const prefMetodoStr = metodosPago.length > 0 ? `${metodosPago[0].name} (${metodosPago[0].value}% · ${metodosPago[0].count} vnt.)` : "N/A";

    return {
      ingresosDiarios,
      historicoMensual: monthlyStats,
      historicoFechas,
      productosMasVendidos,
      metodosPago,
      totalMetodosCount,
      resumen: [
        { label: "Ingresos totales históricos acumulados", value: `$${totalIngresos.toLocaleString("es-CO")} COP` },
        { label: "Total de ventas procesadas", value: `${totalVentasCount} ventas` },
        { label: "Mejor mes histórico", value: topMonthStr },
        { label: "Día de mayor facturación semanal", value: topDayStr },
        { label: "Producto estrella más vendido", value: topProdStr },
        { label: "Método de pago preferido", value: prefMetodoStr },
        { label: "Ticket promedio por venta", value: `$${ticketPromedio.toLocaleString("es-CO")} COP` }
      ]
    };
  }, [ventas]);

  // Selección dinámica de datos según la vista temporal activa (Histórico Mensual, Semanal, Fechas)
  const chartConfig = useMemo(() => {
    if (vistaTemporal === "historico") {
      return {
        data: reportData.historicoMensual,
        xKey: "mes",
        barKey: "ventas",
        lineKey: "cantidadVentas",
        barTitle: "Ingresos históricos por mes (COP)",
        lineTitle: "Número de ventas histórico por mes",
        tooltipUnit: "Ingresos",
        lineUnit: "Ventas"
      };
    }
    if (vistaTemporal === "fechas") {
      return {
        data: reportData.historicoFechas,
        xKey: "fecha",
        barKey: "ventas",
        lineKey: "cantidadVentas",
        barTitle: "Ingresos históricos cronológicos por fecha (COP)",
        lineTitle: "Número de ventas histórico por fecha",
        tooltipUnit: "Ingresos",
        lineUnit: "Ventas"
      };
    }
    // semanal
    return {
      data: reportData.ingresosDiarios,
      xKey: "dia",
      barKey: "ventas",
      lineKey: "cantidadVentas",
      barTitle: "Ingresos por día de la semana (COP)",
      lineTitle: "Número de ventas por día de la semana",
      tooltipUnit: "Ingresos",
      lineUnit: "Ventas"
    };
  }, [vistaTemporal, reportData]);

  const handleExport = () => {
    const data = [
      ["Reporte General y Estadísticas Históricas de Ventas - Chazin Food"],
      ["Generado el", new Date().toLocaleString("es-CO")],
      [],
      ["Métrica / Indicador", "Valor"],
      ...reportData.resumen.map((r) => [r.label, r.value]),
      [],
      ["Histórico Mensual de Ventas"],
      ["Mes", "Facturación (COP)", "Cantidad de Ventas"],
      ...reportData.historicoMensual.map((m) => [m.mesCompleto, m.ventas, m.cantidadVentas]),
      [],
      ["Productos Más Vendidos"],
      ["Producto", "Cantidad Vendida"],
      ...reportData.productosMasVendidos.map((p) => [p.nombreLimpio || p.nombre, `${p.cantidad} unidades`]),
      [],
      ["Distribución por Método de Pago"],
      ["Método", "N° Ventas", "Porcentaje (%)"],
      ...reportData.metodosPago.map((m) => [m.name, m.count, `${m.value}%`])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = [{ wch: 32 }, { wch: 26 }, { wch: 18 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Histórico");
    XLSX.writeFile(
      workbook,
      `Reporte_Ventas_Historico_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const productColors = ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5"];
  const paymentColors = ["#10B981", "#3B82F6", "#F59E0B"];

  return (
    <div className="space-y-6">
      {/* Header Row con Segmented Control de Histórico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Análisis de ventas acumuladas
            </h2>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {selectedPeriod === "personalizado" || selectedPeriod === "todos"
                ? "HISTÓRICO COMPLETO"
                : selectedPeriod === "este_mes"
                ? "ESTE MES"
                : selectedPeriod === "7_dias"
                ? "ÚLTIMOS 7 DÍAS"
                : selectedPeriod === "este_ano"
                ? "ESTE AÑO"
                : "HOY"}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Visualización de ingresos, tendencias temporales y evolución histórica de ventas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Selector de Vista: Histórico Mensual | Semanal | Fechas */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setVistaTemporal("historico")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                vistaTemporal === "historico"
                  ? "bg-white dark:bg-gray-700 text-[#F05454] shadow-xs"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Histórico Mensual</span>
            </button>

            <button
              type="button"
              onClick={() => setVistaTemporal("semanal")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                vistaTemporal === "semanal"
                  ? "bg-white dark:bg-gray-700 text-[#F05454] shadow-xs"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Días de Semana</span>
            </button>

            <button
              type="button"
              onClick={() => setVistaTemporal("fechas")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                vistaTemporal === "fechas"
                  ? "bg-white dark:bg-gray-700 text-[#F05454] shadow-xs"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Histórico Fechas</span>
            </button>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* CHART 1: Ingresos (Mensual / Semanal / Cronológico) */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
              {chartConfig.barTitle}
            </p>
            <p className="text-[11px] text-gray-400">
              {vistaTemporal === "historico" ? "Distribución mensual de ingresos brutos" : vistaTemporal === "fechas" ? "Evolución cronológica por fechas registradas" : "Facturación agregada por día de la semana"}
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
            COP ($)
          </span>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartConfig.data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
            <XAxis dataKey={chartConfig.xKey} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <Tooltip
              content={<CustomChartTooltip unit={chartConfig.tooltipUnit} isCurrency={true} />}
              cursor={{ fill: "rgba(156, 163, 175, 0.15)" }}
            />
            <Bar dataKey={chartConfig.barKey} fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CHART 2: Número de ventas (Mensual / Semanal / Cronológico) */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
              {chartConfig.lineTitle}
            </p>
            <p className="text-[11px] text-gray-400">
              {vistaTemporal === "historico" ? "Volumen mensual de transacciones" : vistaTemporal === "fechas" ? "Transacciones por día registrado" : "Cantidad de ventas por día de la semana"}
            </p>
          </div>
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800/60">
            Transacciones
          </span>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={chartConfig.data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
            <XAxis dataKey={chartConfig.xKey} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} allowDecimals={false} />
            <Tooltip
              content={<CustomChartTooltip unit={chartConfig.lineUnit} isCurrency={false} />}
              cursor={{ stroke: "rgba(59, 130, 246, 0.4)", strokeWidth: 1.5 }}
            />
            <Line
              type="monotone"
              dataKey={chartConfig.lineKey}
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#3B82F6" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* GRID: Productos más vendidos & Métodos de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vendidos */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
              Productos más vendidos
            </p>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              Unidades Vendidas
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              layout="vertical"
              data={reportData.productosMasVendidos}
              margin={{ top: 5, right: 25, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                label={{
                  value: "Cantidad de unidades vendidas",
                  position: "insideBottom",
                  offset: -12,
                  fill: "#9CA3AF",
                  fontSize: 11,
                  fontWeight: 600
                }}
              />
              <YAxis
                dataKey="nombreLimpio"
                type="category"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                width={195}
                tickLine={false}
                tickFormatter={(val) => (val && val.length > 28 ? `${val.substring(0, 26)}...` : val)}
                label={{
                  value: "Productos",
                  angle: -90,
                  position: "insideLeft",
                  offset: -5,
                  fill: "#9CA3AF",
                  fontSize: 11,
                  fontWeight: 600
                }}
              />
              <Tooltip
                content={<CustomChartTooltip unit="Unidades" isCurrency={false} />}
                cursor={{ fill: "rgba(156, 163, 175, 0.15)" }}
              />
              <Bar dataKey="cantidad" radius={[0, 4, 4, 0]} barSize={18}>
                {reportData.productosMasVendidos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={productColors[index % productColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Métodos de pago */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
              Métodos de pago
            </p>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-800 px-2 py-0.5 rounded-md">
              Distribución 100%
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-[60%] min-w-[180px] h-[190px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.metodosPago}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {reportData.metodosPago.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={paymentColors[index % paymentColors.length]}
                        style={{
                          filter: activeIndex === index ? "drop-shadow(0px 4px 6px rgba(0,0,0,0.15))" : "none",
                          transition: "all 0.2s ease",
                          cursor: "pointer"
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider truncate max-w-[110px]">
                  {activeIndex !== null ? reportData.metodosPago[activeIndex].name : "Total Ventas"}
                </span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                  {activeIndex !== null ? `${reportData.metodosPago[activeIndex].value}%` : `${reportData.totalMetodosCount}`}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {activeIndex !== null ? `${reportData.metodosPago[activeIndex].count} vnt.` : "ventas"}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 w-full sm:w-auto">
              {reportData.metodosPago.map((entry, index) => (
                <div
                  key={entry.name}
                  className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${
                    activeIndex === index ? "font-bold text-gray-800 dark:text-gray-100 scale-105" : "text-gray-600 dark:text-gray-400"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <span
                    className="w-3 h-3 rounded-full inline-block shrink-0"
                    style={{
                      backgroundColor: paymentColors[index % paymentColors.length],
                      transform: activeIndex === index ? "scale(1.2)" : "scale(1)",
                      transition: "all 0.2s ease"
                    }}
                  />
                  <span className="text-xs sm:text-sm">
                    {entry.name} <span className="font-bold">({entry.value}%)</span>
                    <span className="text-[11px] text-gray-400 block sm:inline sm:ml-1">· {entry.count} {entry.count === 1 ? 'venta' : 'ventas'}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY TABLE CON INDICADORES HISTÓRICOS */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-gray-100/80 dark:bg-gray-800/80 px-4 py-3 flex items-center justify-between">
          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">
            Resumen ejecutivo del período e histórico
          </p>
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            Chazin Food Analytics
          </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-750 bg-white dark:bg-gray-900">
          {reportData.resumen.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
