import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
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
    const formatted = isCurrency ? `$${Number(val).toLocaleString("es-CO")}` : val;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-xl shadow-xl text-xs">
        <p className="font-semibold text-gray-400 dark:text-gray-400 mb-1">{label}</p>
        <p className="font-bold text-[#10B981] text-sm">
          {unit} : {formatted}
        </p>
      </div>
    );
  }
  return null;
};

export function VentasReportesView({ ventas = [] }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const reportData = useMemo(() => {
    const daysMap = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 0: "Dom" };
    const diasOrder = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const dailyStats = { Lun: { ventas: 0, pedidos: 0 }, Mar: { ventas: 0, pedidos: 0 }, Mié: { ventas: 0, pedidos: 0 }, Jue: { ventas: 0, pedidos: 0 }, Vie: { ventas: 0, pedidos: 0 }, Sáb: { ventas: 0, pedidos: 0 }, Dom: { ventas: 0, pedidos: 0 } };

    const productCounts = {};
    const paymentCounts = { "Efectivo (Punto Físico)": 0, Tarjeta: 0, Transferencia: 0 };

    ventas.forEach((v) => {
      const vDate = v.fecha || v.fechaVenta ? new Date(v.fecha || v.fechaVenta) : null;
      if (vDate && !isNaN(vDate.getTime())) {
        const dayName = daysMap[vDate.getDay()];
        if (dailyStats[dayName]) {
          dailyStats[dayName].ventas += Number(v.total || 0);
          dailyStats[dayName].pedidos += 1;
        }
      }

      const metodo = String(v.metodoPago || v.metodo_pago || "Efectivo").toLowerCase();
      if (metodo.includes("tarjeta") || metodo.includes("wompi") || metodo.includes("online")) {
        paymentCounts.Tarjeta += 1;
      } else if (metodo.includes("transfer") || metodo.includes("nequi") || metodo.includes("davi") || metodo.includes("pse")) {
        paymentCounts.Transferencia += 1;
      } else {
        paymentCounts["Efectivo (Punto Físico)"] += 1;
      }

      // Priorizar detalles relacionales si existen, ya que contienen los nombres oficiales del catálogo
      const prods = (Array.isArray(v.detalles) && v.detalles.length > 0)
        ? v.detalles.map(d => ({
            nombre: d.variante?.producto?.nombre || d.variante?.nombre || "Producto",
            nombreProducto: d.variante?.producto?.nombre,
            nombreVariante: d.variante?.nombre,
            cantidad: d.cantidad
          }))
        : (Array.isArray(v.productos) && v.productos.length > 0 ? v.productos : []);

      // Diccionario para normalizar nombres de variantes sueltas a su producto oficial del menú
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
        // Obtener nombre real del producto
        let rawName = p.nombreProducto || p.variante?.producto?.nombre || p.nombre || p.variante?.nombre || null;
        if (rawName && (rawName === "Producto" || rawName === "Producto General" || rawName.startsWith("Producto #"))) {
          rawName = p.variante?.producto?.nombre || p.variante?.nombre || null;
        }

        // Excluir entradas sin nombre, ficticias, de prueba ("tester", "test") o de sistema
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

        // Limpiar adiciones o promociones entre paréntesis (ej: "Hamburguesa Clásica Chazin (Jueves 2x1...)" -> "Hamburguesa Clásica Chazin")
        let nombreLimpio = rawName.replace(/\s*\(.*?\)/g, "").replace(/\s*-\s*base/i, "").trim();
        if (!nombreLimpio || nombreLimpio === "Producto" || nombreLimpio === "Pedido de Venta" || nombreLimpio === "Producto General") return;

        // Si el nombre resultante coincide con una variante conocida, normalizarlo a su producto oficial
        const cleanLow = nombreLimpio.toLowerCase();
        if (variantToProductMap[cleanLow]) {
          nombreLimpio = variantToProductMap[cleanLow];
        }

        // Agrupar usando el nombre limpio en minúsculas como clave única
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
      pedidos: dailyStats[dia].pedidos
    }));

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
    
    // Cálculo de porcentaje exacto con redondeo que siempre suma exactamente 100%
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

      // Distribuir el residuo a los de mayor parte decimal para garantizar suma de 100%
      let remainder = 100 - allocatedSum;
      const sortedByDecimal = [...metodosPago].sort((a, b) => b.decimal - a.decimal);
      for (let i = 0; i < remainder; i++) {
        const item = metodosPago.find(m => m.name === sortedByDecimal[i]?.name);
        if (item) item.value += 1;
      }
      metodosPago.sort((a, b) => b.count - a.count);
    }

    const totalIngresos = ventas.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0);
    const totalPedidos = ventas.length;
    const ticketPromedio = totalPedidos > 0 ? Math.round(totalIngresos / totalPedidos) : 0;

    const topDay = [...ingresosDiarios].sort((a, b) => b.ventas - a.ventas)[0];
    const topDayStr = topDay && topDay.ventas > 0 ? `${topDay.dia} — $${topDay.ventas.toLocaleString("es-CO")} COP` : "N/A";
    const topProdStr = sortedProducts.length > 0 ? `${sortedProducts[0].nombreLimpio} (${sortedProducts[0].cantidad} und.)` : "N/A";
    const prefMetodoStr = metodosPago.length > 0 ? `${metodosPago[0].name} (${metodosPago[0].value}% · ${metodosPago[0].count} ped.)` : "N/A";

    return {
      ingresosDiarios,
      productosMasVendidos,
      metodosPago,
      totalMetodosCount,
      resumen: [
        { label: "Ingresos totales acumulados", value: `$${totalIngresos.toLocaleString("es-CO")} COP` },
        { label: "Total de pedidos procesados", value: `${totalPedidos} pedidos` },
        { label: "Día con mayor facturación", value: topDayStr },
        { label: "Producto estrella", value: topProdStr },
        { label: "Método de pago preferido", value: prefMetodoStr },
        { label: "Ticket promedio", value: `$${ticketPromedio.toLocaleString("es-CO")} COP` }
      ]
    };
  }, [ventas]);

  const handleExport = () => {
    const data = [
      ["Reporte General de Ventas - Chazin Food"],
      ["Generado el", new Date().toLocaleString("es-CO")],
      [],
      ["Métrica / Indicador", "Valor"],
      ...reportData.resumen.map((r) => [r.label, r.value]),
      [],
      ["Productos Más Vendidos"],
      ["Producto", "Cantidad Vendida"],
      ...reportData.productosMasVendidos.map((p) => [p.nombreLimpio || p.nombre, `${p.cantidad} unidades`]),
      [],
      ["Distribución por Método de Pago"],
      ["Método", "N° Pedidos", "Porcentaje (%)"],
      ...reportData.metodosPago.map((m) => [m.name, m.count, `${m.value}%`])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = [{ wch: 32 }, { wch: 26 }, { wch: 18 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Ventas");
    XLSX.writeFile(
      workbook,
      `Reporte_Ventas_General_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const productColors = ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5"];
  const paymentColors = ["#10B981", "#3B82F6", "#F59E0B"];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Análisis de ventas acumuladas
        </h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 shadow-2xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span>Exportar</span>
        </button>
      </div>

      {/* CHART 1: Ingresos diarios (COP) */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-4 text-sm">
          Ingresos diarios (COP)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={reportData.ingresosDiarios} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
            <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
            <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <Tooltip
              content={<CustomChartTooltip unit="Ingresos" isCurrency={true} />}
              cursor={{ fill: "rgba(156, 163, 175, 0.15)" }}
            />
            <Bar dataKey="ventas" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CHART 2: Número de pedidos por día */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-4 text-sm">
          Número de pedidos por día
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={reportData.ingresosDiarios} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
            <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <Tooltip
              content={<CustomChartTooltip unit="Pedidos" isCurrency={false} />}
              cursor={{ stroke: "rgba(59, 130, 246, 0.4)", strokeWidth: 1.5 }}
            />
            <Line type="monotone" dataKey="pedidos" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: "#3B82F6" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* GRID: Productos más vendidos & Métodos de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vendidos */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
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
              {/* Eje X Etiquetado claramente */}
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
              {/* Eje Y con ancho ampliado y etiquetado claramente */}
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
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
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
                  {activeIndex !== null ? `${reportData.metodosPago[activeIndex].count} ped.` : "pedidos"}
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
                    <span className="text-[11px] text-gray-400 block sm:inline sm:ml-1">· {entry.count} {entry.count === 1 ? 'pedido' : 'pedidos'}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY TABLE */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3">
          <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
            Resumen ejecutivo del período
          </p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {reportData.resumen.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
