import { X, User, Package, TrendingUp, Award, Flame } from "lucide-react";

export function ClientePerfilModal({ isOpen, onClose, user, pedidos = [] }) {
  if (!isOpen) return null;

  // Calculate stats dynamically if available, otherwise use default mock stats matching the mockup
  const totalPedidosCount = pedidos.length > 0 ? pedidos.length : 2;
  const totalProductosCount = pedidos.length > 0 
    ? pedidos.reduce((acc, p) => acc + (p.items || []).reduce((iAcc, item) => iAcc + (item.cantidad || 1), 0), 0)
    : 5;
  const totalGastado = pedidos.length > 0
    ? pedidos.reduce((acc, p) => acc + (p.total || 0), 0)
    : 81000;

  const userName = user?.nombre
    ? `${user.nombre} ${user.apellidos || ''}`.trim()
    : "María García";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#f05454] p-6 text-white relative flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
            <User className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Mi Perfil</h2>
            <p className="text-sm text-white/90 font-medium">{userName}</p>
          </div>
          <button
            onClick={onClose}
            title="Cerrar modal"
            className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
          {/* Section 1: Estadísticas de Compras */}
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">
              Estadísticas de Compras
            </h3>
            <div className="grid grid-cols-2 gap-3.5">
              {/* Card 1: Productos Comprados */}
              <div className="bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#f05454] text-white flex items-center justify-center mb-3 shadow-xs">
                    <Package className="w-5.5 h-5.5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Productos Comprados
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-extrabold text-[#f05454]">
                    {totalProductosCount}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    unidades en total
                  </p>
                </div>
              </div>

              {/* Card 2: Pedidos Realizados */}
              <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-3 shadow-xs">
                    <TrendingUp className="w-5.5 h-5.5" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Pedidos Realizados
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {totalPedidosCount}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    total de pedidos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Producto Favorito */}
          <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 rounded-2xl p-4.5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  Producto Favorito
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  El más pedido por ti
                </p>
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-xl font-extrabold text-amber-900 dark:text-amber-300">
                Hamburguesa Especial
              </h4>
              <p className="text-xs font-semibold text-amber-700/90 dark:text-amber-400 mt-1">
                Lo has pedido 2 veces
              </p>
            </div>
          </div>

          {/* Section 3: Racha de Fidelidad */}
          <div className="bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-4.5 space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Flame className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  Racha de Fidelidad
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Recompensa cada 3 compras
                </p>
              </div>
            </div>

            {/* Segmented Progress Bars */}
            <div className="grid grid-cols-3 gap-2 my-2.5">
              <div className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-xs"></div>
              <div className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-xs"></div>
              <div className="h-3 rounded-full bg-amber-100 dark:bg-gray-800"></div>
            </div>

            <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
              Te falta 1 compra para tu próxima recompensa 🎁
            </p>
          </div>

          {/* Section 4: Total de Compra */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Total de Compra
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                en Chazin Food
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${totalGastado.toLocaleString("es-CO")}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50/80 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-colors text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
