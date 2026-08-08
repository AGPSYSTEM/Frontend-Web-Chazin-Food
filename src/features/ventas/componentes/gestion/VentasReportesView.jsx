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
    const defaultIngresosDiarios = [
      { dia: "Lun", ventas: 180000, pedidos: 6 },
      { dia: "Mar", ventas: 210000, pedidos: 7 },
      { dia: "Mié", ventas: 160000, pedidos: 5 },
      { dia: "Jue", ventas: 290000, pedidos: 9 },
      { dia: "Vie", ventas: 340000, pedidos: 11 },
      { dia: "Sáb", ventas: 420000, pedidos: 14 },
      { dia: "Dom", ventas: 390000, pedidos: 12 }
    ];

    const defaultProductosMasVendidos = [
      { nombre: "Hamburguesa Esp.", cantidad: 38 },
      { nombre: "Combo Familiar", cantidad: 24 },
      { nombre: "Pollo Broaster", cantidad: 21 },
      { nombre: "Salchipapa", cantidad: 19 },
      { nombre: "Perro Caliente", cantidad: 15 }
    ];

    const defaultMetodosPago = [
      { name: "Efectivo", value: 65 },
      { name: "Tarjeta", value: 35 }
    ];

    const totalIngresos = ventas.length > 0
      ? ventas.reduce((acc, v) => acc + (parseFloat(v.total) || 0), 0)
      : defaultIngresosDiarios.reduce((acc, d) => acc + d.ventas, 0);

    const totalPedidos = ventas.length > 0
      ? ventas.length
      : defaultIngresosDiarios.reduce((acc, d) => acc + d.pedidos, 0);

    const ticketPromedio = totalPedidos > 0 ? Math.round(totalIngresos / totalPedidos) : 29640;

    return {
      ingresosDiarios: defaultIngresosDiarios,
      productosMasVendidos: defaultProductosMasVendidos,
      metodosPago: defaultMetodosPago,
      resumen: [
        { label: "Ingresos totales del período", value: `$${totalIngresos.toLocaleString("es-CO")}` },
        { label: "Total de pedidos procesados", value: `${totalPedidos} pedidos` },
        { label: "Día con mayor facturación", value: "Sábado — $420.000" },
        { label: "Producto estrella", value: "Hamburguesa Especial (38 und.)" },
        { label: "Método de pago preferido", value: "Efectivo (62%)" },
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(val) => [`$${val.toLocaleString("es-CO")}`, "Ingresos"]} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(val) => [val, "Pedidos"]} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="nombre" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(val) => [val, "Unidades"]} />
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
