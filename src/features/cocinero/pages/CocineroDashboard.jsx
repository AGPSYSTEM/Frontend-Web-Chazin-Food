import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, ChefHat, Clock, CheckCircle, AlertCircle, Package, User, Sun, Moon, BookOpen, X, ChevronDown, FileText, Search } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { useNotifications } from "@/shared/hooks/useNotifications";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";

export function CocineroDashboard() {
  const { user, logout } = useAuth();
  const [darkMode, toggleDarkMode] = useDarkMode();
  const { success, confirmAction, confirmLogout } = useNotifications();
  const [pedidos, setPedidos] = useState([
    {
      id: 101,
      cliente: "María García",
      productos: [
        {
          nombre: "Hamburguesa Especial",
          cantidad: 2,
          observaciones: "Sin cebolla",
          receta: {
            ingredientes: [
              { nombre: "Pan de hamburguesa", cantidad: "2 unidades" },
              { nombre: "Carne de res molida", cantidad: "200g" },
              { nombre: "Queso cheddar", cantidad: "2 lonchas" },
              { nombre: "Lechuga", cantidad: "30g" },
              { nombre: "Tomate", cantidad: "2 rodajas" },
              { nombre: "Salsa especial", cantidad: "30ml" },
              { nombre: "Pepinillos", cantidad: "4 rodajas" }
            ],
            pasos: [
              "Calentar la plancha a fuego medio-alto",
              "Formar las hamburguesas de 100g cada una",
              "Cocinar las hamburguesas 4 minutos por lado",
              "Agregar el queso en los últimos 2 minutos",
              "Tostar el pan ligeramente",
              "Montar: pan, salsa, lechuga, tomate, carne con queso, pepinillos, pan"
            ],
            tiempoPreparacion: "12 min"
          }
        },
        {
          nombre: "Papas Fritas",
          cantidad: 1,
          receta: {
            ingredientes: [
              { nombre: "Papas", cantidad: "200g" },
              { nombre: "Aceite vegetal", cantidad: "Para freír" },
              { nombre: "Sal", cantidad: "Al gusto" }
            ],
            pasos: [
              "Pelar y cortar las papas en tiras",
              "Remojar en agua fría por 10 minutos",
              "Secar bien las papas",
              "Freír a 180°C hasta dorar",
              "Escurrir y salar inmediatamente"
            ],
            tiempoPreparacion: "8 min"
          }
        }
      ],
      estado: "Pendiente",
      hora: "12:30 PM",
      mesa: "Mesa 4",
      tipo: "Para mesa"
    },
    {
      id: 102,
      cliente: "Juan Pérez",
      productos: [
        {
          nombre: "Perro Caliente Especial",
          cantidad: 1,
          observaciones: "Extra salsa queso",
          receta: {
            ingredientes: [
              { nombre: "Pan de perro", cantidad: "1 unidad" },
              { nombre: "Salchicha americana", cantidad: "1 unidad" },
              { nombre: "Queso fundido", cantidad: "50ml" },
              { nombre: "Tocineta picada", cantidad: "20g" },
              { nombre: "Papas fosforito", cantidad: "15g" }
            ],
            pasos: [
              "Cocinar la salchicha a la plancha",
              "Dorar la tocineta hasta que esté crujiente",
              "Calentar el pan al vapor 1 minuto",
              "Colocar la salchicha en el pan",
              "Bañar con queso fundido, tocineta y papas fosforito"
            ],
            tiempoPreparacion: "7 min"
          }
        }
      ],
      estado: "En Preparación",
      hora: "12:35 PM",
      tipo: "Para llevar"
    }
  ]);

  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [pedidoReceta, setPedidoReceta] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const cambiarEstado = async (id, nuevoEstado) => {
    const confirmed = await confirmAction(
      "¿Cambiar estado?",
      `¿Deseas marcar el pedido #${id} como "${nuevoEstado}"?`
    );
    if (confirmed) {
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)));
      success("Estado actualizado", `Pedido #${id} marcado como ${nuevoEstado}`);
    }
  };

  const verReceta = (pedido, producto) => {
    setPedidoReceta(pedido);
    setProductoSeleccionado(producto);
  };

  const handleLogout = async () => {
    const confirmed = await confirmLogout();
    if (confirmed) {
      logout();
      success("Sesión cerrada", "Has salido del sistema correctamente");
    }
  };

  const pedidosFiltrados = pedidos.filter(
    (p) => filtroEstado === "Todos" || p.estado === filtroEstado
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 shrink-0 border border-gray-200 dark:border-gray-700">
              <img src={logoImg} alt="Chazin Food" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#F05454]" />
                Cocina Chazin Food
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Panel Interactivo de Preparación
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ventas/fichas-tecnicas"
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-[#F05454] rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors"
            >
              <FileText className="w-4 h-4" /> Recetas
            </Link>

            <button
              onClick={() => toggleDarkMode()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto">
            {["Todos", "Pendiente", "En Preparación", "Listo"].map((st) => (
              <button
                key={st}
                onClick={() => setFiltroEstado(st)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filtroEstado === st
                    ? "bg-[#F05454] text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Pedidos Activos: {pedidosFiltrados.length}
          </span>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidosFiltrados.map((ped) => (
            <div
              key={ped.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                      Pedido #{ped.id}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {ped.cliente} • {ped.hora}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      ped.estado === "Listo"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : ped.estado === "En Preparación"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {ped.estado}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {ped.productos.map((prod, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                          {prod.cantidad}x {prod.nombre}
                        </p>
                        {prod.observaciones && (
                          <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 font-medium">
                            * {prod.observaciones}
                          </p>
                        )}
                      </div>

                      {prod.receta && (
                        <button
                          onClick={() => verReceta(ped, prod)}
                          className="px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-[#F05454] rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors shrink-0 flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Ver Receta
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                {ped.estado === "Pendiente" && (
                  <button
                    onClick={() => cambiarEstado(ped.id, "En Preparación")}
                    className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Iniciar Preparación
                  </button>
                )}
                {ped.estado === "En Preparación" && (
                  <button
                    onClick={() => cambiarEstado(ped.id, "Listo")}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Marcar como Listo
                  </button>
                )}
                {ped.estado === "Listo" && (
                  <div className="w-full text-center text-xs font-semibold text-green-600 dark:text-green-400 py-1">
                    ✓ Completado y entregado
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Receta */}
        {productoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                    Receta: {productoSeleccionado.nombre}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tiempo est.: {productoSeleccionado.receta?.tiempoPreparacion || "10 min"}
                  </p>
                </div>
                <button
                  onClick={() => setProductoSeleccionado(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Ingredientes Necesarios:
                  </h4>
                  <ul className="space-y-1.5">
                    {productoSeleccionado.receta?.ingredientes.map((ing, i) => (
                      <li
                        key={i}
                        className="text-sm flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-200"
                      >
                        <span>{ing.nombre}</span>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          {ing.cantidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Pasos de Preparación:
                  </h4>
                  <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700 dark:text-gray-300">
                    {productoSeleccionado.receta?.pasos.map((paso, i) => (
                      <li key={i} className="leading-relaxed">
                        {paso}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
