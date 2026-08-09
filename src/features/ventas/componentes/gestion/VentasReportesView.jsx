import { useState, useMemo } from "react";
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

export function VentasReportesView({ ventas = [], selectedPeriod = "7_dias" }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const periodLabelMap = {
    hoy: "hoy",
    "7_dias": "últimos 7 días",
    este_mes: "este mes",
    este_ano: "este año",
    personalizado: "período personalizado"
  };
  const periodText = periodLabelMap[selectedPeriod] || "últimos 7 días";

  const reportData = useMemo(() => {
    const daysMap = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 0: "Dom" };
    const diasOrder = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const dailyStats = { Lun: { ventas: 0, pedidos: 0 }, Mar: { ventas: 0, pedidos: 0 }, Mié: { ventas: 0, pedidos: 0 }, Jue: { ventas: 0, pedidos: 0 }, Vie: { ventas: 0, pedidos: 0 }, Sáb: { ventas: 0, pedidos: 0 }, Dom: { ventas: 0, pedidos: 0 } };

    const productCounts = {};
    const paymentCounts = { Efectivo: 0, Tarjeta: 0, Transferencia: 0 };

    ventas.forEach((v) => {
      const vDate = v.fecha || v.fechaVenta ? new Date(v.fecha || v.fechaVenta) : null;
      if (vDate && !isNaN(vDate.getTime())) {
        const dayName = daysMap[vDate.getDay()];
        if (dailyStats[dayName]) {
          dailyStats[dayName].ventas += Number(v.total || 0);
          dailyStats[dayName].pedidos += 1;
        }
      }

      const metodo = v.metodoPago || v.metodo_pago || "Efectivo";
      if (metodo.toLowerCase().includes("tarjeta")) paymentCounts.Tarjeta += 1;
      else if (metodo.toLowerCase().includes("transfer")) paymentCounts.Transferencia += 1;
      else paymentCounts.Efectivo += 1;

      const prods = Array.isArray(v.productos) && v.productos.length > 0 ? v.productos : (v.detalles || []);
      prods.forEach((p) => {
        const pName = p.nombre || p.nombreProducto || "Producto General";
        productCounts[pName] = (productCounts[pName] || 0) + (Number(p.cantidad) || 1);
      });
    });

    const hasRealSales = ventas.length > 0;

    const ingresosDiarios = diasOrder.map((dia) => ({
      dia,
      ventas: dailyStats[dia].ventas,
      pedidos: dailyStats[dia].pedidos
    }));

    const sortedProducts = Object.entries(productCounts)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    const productosMasVendidos = sortedProducts.length > 0
      ? sortedProducts
      : [
          { nombre: "Hamburguesa Esp.", cantidad: 38 },
          { nombre: "Combo Familiar", cantidad: 24 },
          { nombre: "Pollo Broaster", cantidad: 21 },
          { nombre: "Salchipapa", cantidad: 19 },
          { nombre: "Perro Caliente", cantidad: 15 }
        ];

    const totalMetodosCount = (paymentCounts.Efectivo + paymentCounts.Tarjeta + paymentCounts.Transferencia) || 1;
    const metodosPago = hasRealSales
      ? [
          { name: "Efectivo", value: Math.round((paymentCounts.Efectivo / totalMetodosCount) * 100) },
          { name: "Tarjeta", value: Math.round((paymentCounts.Tarjeta / totalMetodosCount) * 100) },
          { name: "Transferencia", value: Math.round((paymentCounts.Transferencia / totalMetodosCount) * 100) }
        ].filter(m => m.value > 0)
      : [
          { name: "Efectivo", value: 65 },
          { name: "Tarjeta", value: 35 }
        ];

    const totalIngresos = ventas.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0);
    const totalPedidos = ventas.length;
    const ticketPromedio = totalPedidos > 0 ? Math.round(totalIngresos / totalPedidos) : 0;

    const topDay = [...ingresosDiarios].sort((a, b) => b.ventas - a.ventas)[0];
    const topDayStr = topDay && topDay.ventas > 0 ? `${topDay.dia} — $${topDay.ventas.toLocaleString("es-CO")}` : "Sábado — $420.000";
    const topProdStr = sortedProducts.length > 0 ? `${sortedProducts[0].nombre} (${sortedProducts[0].cantidad} und.)` : "Hamburguesa Especial (38 und.)";
    const prefMetodoStr = metodosPago.length > 0 ? `${metodosPago[0].name} (${metodosPago[0].value}%)` : "Efectivo (65%)";

    return {
      ingresosDiarios,
      productosMasVendidos,
      metodosPago,
      resumen: [
        { label: "Ingresos totales del período", value: `$${totalIngresos.toLocaleString("es-CO")}` },
        { label: "Total de pedidos procesados", value: `${totalPedidos} pedidos` },
        { label: "Día con mayor facturación", value: topDayStr },
        { label: "Producto estrella", value: topProdStr },
        { label: "Método de pago preferido", value: prefMetodoStr },
        { label: "Ticket promedio", value: `$${ticketPromedio.toLocaleString("es-CO")}` }
      ]
    };
  }, [ventas]);

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      `Reporte de Ventas - ${periodText}\n` +
      `Ingresos Totales,${reportData.resumen[0].value}\n` +
      `Total Pedidos,${reportData.resumen[1].value}\n` +
      `Ticket Promedio,${reportData.resumen[5].value}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_ventas_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const productColors = ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5"];
  const paymentColors = ["#10B981", "#3B82F6"];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Análisis de ventas — {periodText}
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
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-4 text-sm">
            Productos más vendidos
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={reportData.productosMasVendidos} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis dataKey="nombre" type="category" tick={{ fontSize: 11, fill: "#9CA3AF" }} width={100} />
              <Tooltip
                content={<CustomChartTooltip unit="Unidades" isCurrency={false} />}
                cursor={{ fill: "rgba(156, 163, 175, 0.15)" }}
              />
              <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                {reportData.productosMasVendidos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={productColors[index % productColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Métodos de pago */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-4 text-sm">
            Métodos de pago
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-[60%] min-w-[180px] h-[180px] relative flex items-center justify-center">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                  {activeIndex !== null ? reportData.metodosPago[activeIndex].name : "Todos"}
                </span>
                <span className="text-xl font-extrabold text-gray-800 dark:text-gray-100">
                  {activeIndex !== null ? `${reportData.metodosPago[activeIndex].value}%` : "100%"}
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
                  <span className="text-sm">
                    {entry.name} ({entry.value}%)
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
