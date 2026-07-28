import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDarkMode } from "@/shared/hooks/useDarkMode";

const ventasData = [
  { mes: "Ene", ventas: 12500, compras: 8000 },
  { mes: "Feb", ventas: 15200, compras: 9500 },
  { mes: "Mar", ventas: 18800, compras: 11000 },
  { mes: "Abr", ventas: 22100, compras: 13500 },
  { mes: "May", ventas: 25600, compras: 15000 },
  { mes: "Jun", ventas: 28400, compras: 16800 }
];

const productosPopulares = [
  { nombre: "Hamburguesa", ventas: 245 },
  { nombre: "Salchipapa", ventas: 198 },
  { nombre: "Perro Caliente", ventas: 167 },
  { nombre: "Pollo Broaster", ventas: 142 },
  { nombre: "Papas Fritas", ventas: 124 }
];

export function DashboardCharts() {
  const [darkMode] = useDarkMode();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Ventas vs Compras Area Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Comportamiento Mensual: Ventas vs Compras ($ USD)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ventasData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F05454" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F05454" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#30475E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#30475E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
              <XAxis dataKey="mes" stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
              <YAxis stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                  borderColor: darkMode ? "#374151" : "#E5E7EB",
                  color: darkMode ? "#F3F4F6" : "#111827",
                  borderRadius: "0.75rem"
                }}
              />
              <Area type="monotone" dataKey="ventas" stroke="#F05454" fillOpacity={1} fill="url(#colorVentas)" name="Ventas" />
              <Area type="monotone" dataKey="compras" stroke="#30475E" fillOpacity={1} fill="url(#colorCompras)" name="Compras" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Bar Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Productos Más Vendidos
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productosPopulares} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#E5E7EB"} />
              <XAxis type="number" stroke={darkMode ? "#9CA3AF" : "#6B7280"} />
              <YAxis type="category" dataKey="nombre" stroke={darkMode ? "#9CA3AF" : "#6B7280"} width={90} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                  borderColor: darkMode ? "#374151" : "#E5E7EB",
                  color: darkMode ? "#F3F4F6" : "#111827",
                  borderRadius: "0.75rem"
                }}
              />
              <Bar dataKey="ventas" fill="#F05454" radius={[0, 8, 8, 0]} name="Unidades" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
