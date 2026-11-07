import { useState } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Layers,
  ShoppingBag,
  DollarSign,
  UserCheck
} from "lucide-react";

export function ClientesBuscadorMulticriterio({
  searchTerm,
  setSearchTerm,
  filterTipo,
  setFilterTipo,
  filterEstado,
  setFilterEstado,
  comprasMin,
  setComprasMin,
  montoMin,
  setMontoMin,
  montoMax,
  setMontoMax,
  clearAllFilters,
  hasActiveFilters,
  activeFiltersCount,
  totalRecords = 0,
  filteredRecords = 0
}) {
  const [panelOpen, setPanelOpen] = useState(false);

  const quickFilters = [
    {
      label: "Todos",
      isActive: filterTipo === "Todos" && filterEstado === "Todos" && comprasMin === "",
      apply: () => {
        setFilterTipo("Todos");
        setFilterEstado("Todos");
        setComprasMin("");
      }
    },
    {
      label: "VIP",
      isActive: filterTipo === "VIP",
      apply: () => setFilterTipo(filterTipo === "VIP" ? "Todos" : "VIP")
    },
    {
      label: "Frecuentes",
      isActive: filterTipo === "Frecuente",
      apply: () => setFilterTipo(filterTipo === "Frecuente" ? "Todos" : "Frecuente")
    },
    {
      label: "Regulares",
      isActive: filterTipo === "Regular",
      apply: () => setFilterTipo(filterTipo === "Regular" ? "Todos" : "Regular")
    },
    {
      label: "Nuevos",
      isActive: filterTipo === "Nuevo",
      apply: () => setFilterTipo(filterTipo === "Nuevo" ? "Todos" : "Nuevo")
    },
    {
      label: "Compras mayores a 0",
      isActive: comprasMin === "1",
      apply: () => setComprasMin(comprasMin === "1" ? "" : "1")
    },
    {
      label: "Activos",
      isActive: filterEstado === "Activo",
      apply: () => setFilterEstado(filterEstado === "Activo" ? "Todos" : "Activo")
    }
  ];

  return (
    <div className="space-y-3 w-full">
      {/* Barra de Búsqueda Principal */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Input Inteligente */}
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, documento, teléfono, email, compras, producto comprado..."
            className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all placeholder:text-gray-400 text-gray-900 dark:text-gray-100 shadow-2xs"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              title="Borrar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Botón Filtros Multicriterio */}
        <button
          type="button"
          onClick={() => setPanelOpen(!panelOpen)}
          className={`px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer border shrink-0 ${
            panelOpen || activeFiltersCount > 0
              ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750"
          }`}
        >
          <Filter className={`w-4 h-4 ${activeFiltersCount > 0 ? "text-red-500" : "text-gray-500"}`} />
          <span>Filtros Multicriterio</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              panelOpen ? "rotate-180 text-red-500" : ""
            }`}
          />
        </button>

        {/* Botón Restablecer rápido */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-gray-200 dark:border-gray-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            title="Restablecer todos los criterios"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Quick Chips Fila */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-red-500" />
          Filtro Rápido:
        </span>
        {quickFilters.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={q.apply}
            className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              q.isActive
                ? "bg-red-500 text-white border-red-500 shadow-2xs font-semibold"
                : "bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border-gray-200/80 dark:border-gray-700/80 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Panel Desplegable Multicriterio Completo */}
      {panelOpen && (
        <div className="bg-white dark:bg-gray-850 rounded-3xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-750 shadow-lg space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-750 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Criterios Específicos de Clientes
              </h3>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer todo</span>
              </button>
            )}
          </div>

          {/* Grid de Criterios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Categoría / Fidelidad */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                <span>Nivel de Fidelidad</span>
              </label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/40 cursor-pointer"
              >
                <option value="Todos">Todos los niveles</option>
                <option value="VIP">VIP (15% desc.)</option>
                <option value="Frecuente">Frecuente (10% desc.)</option>
                <option value="Regular">Regular (5% desc.)</option>
                <option value="Nuevo">Nuevo</option>
              </select>
            </div>

            {/* 2. Estado de la Cuenta */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                <span>Estado del Cliente</span>
              </label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/40 cursor-pointer"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            {/* 3. Compras Realizadas Mínimas */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                <span>Compras Mínimas</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ej: 3 compras"
                value={comprasMin}
                onChange={(e) => setComprasMin(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/40"
              />
            </div>

            {/* 4. Total Consumido Mínimo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                <span>Consumo Total Mínimo (COP)</span>
              </label>
              <input
                type="number"
                placeholder="Ej: 50000"
                value={montoMin}
                onChange={(e) => setMontoMin(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/40"
              />
            </div>
          </div>

          {/* Footer del panel */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-750 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filteredRecords} de {totalRecords} clientes encontrados
            </span>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="px-4 py-1.5 rounded-xl bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 text-xs font-bold transition-colors cursor-pointer"
            >
              Aplicar y cerrar
            </button>
          </div>
        </div>
      )}

      {/* Badges de Filtros Activos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-gray-400 dark:text-gray-500 font-bold text-[11px] uppercase tracking-wider">
            Filtros activos:
          </span>

          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 shadow-2xs">
              <span>Búsqueda: &ldquo;{searchTerm}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="hover:text-red-800 cursor-pointer"
                title="Quitar"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterTipo !== "Todos" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 shadow-2xs">
              <span>Fidelidad: {filterTipo}</span>
              <button
                type="button"
                onClick={() => setFilterTipo("Todos")}
                className="hover:text-amber-900 cursor-pointer"
                title="Quitar"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterEstado !== "Todos" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 shadow-2xs">
              <span>Estado: {filterEstado}</span>
              <button
                type="button"
                onClick={() => setFilterEstado("Todos")}
                className="hover:text-blue-900 cursor-pointer"
                title="Quitar"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {comprasMin !== "" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
              <span>{comprasMin === "1" ? "Compras mayores a 0" : `Compras: ≥ ${comprasMin}`}</span>
              <button
                type="button"
                onClick={() => setComprasMin("")}
                className="hover:text-emerald-900 cursor-pointer"
                title="Quitar"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {montoMin !== "" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-lime-50 dark:bg-lime-950/40 text-lime-800 dark:text-lime-300 border border-lime-200 dark:border-lime-900/60 shadow-2xs">
              <span>Consumo: &ge; ${Number(montoMin).toLocaleString("es-CO")}</span>
              <button
                type="button"
                onClick={() => setMontoMin("")}
                className="hover:text-lime-950 cursor-pointer"
                title="Quitar"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-bold text-red-500 hover:underline cursor-pointer ml-1"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Contador de Resultados Dinámico */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-0.5">
        <span>
          Mostrando <strong className="text-gray-900 dark:text-gray-100">{filteredRecords}</strong> de {totalRecords} clientes
          {hasActiveFilters && " (filtrados)"}
        </span>
      </div>
    </div>
  );
}
