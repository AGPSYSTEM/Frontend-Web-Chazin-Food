import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Plus, Search, Bell, Download, FileSpreadsheet, FileText, AlertTriangle, ShoppingCart, Filter } from "lucide-react";
import { useInsumos } from "../hooks/useInsumos";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { hasPrivilege } from "@/features/configuracion/utils/privilegiosUtils";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { InsumosStatsCards } from "../componentes/insumos/InsumosStatsCards";
import { InsumosTable } from "../componentes/insumos/InsumosTable";
import { InsumoModal } from "../componentes/insumos/InsumoModal";
import { TrazabilidadModal } from "../componentes/insumos/TrazabilidadModal";
import { PapeleraReciclajeView } from "../componentes/insumos/PapeleraReciclajeView";
import { VerInsumoModal } from "../componentes/insumos/VerInsumoModal";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

export function Insumos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useNotifications();
  const canCreate = hasPrivilege(user, "Insumos", "crear");
  const canEdit = hasPrivilege(user, "Insumos", "editar");
  const canDelete = hasPrivilege(user, "Insumos", "eliminar");

  const {
    insumos,
    filteredInsumos,
    categorias,
    proveedores,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    filterEstado,
    setFilterEstado,
    insumosVencidos = [],
    eventos,
    unreadCount,
    papeleraInsumos,
    papeleraPreparados,
    createInsumo,
    updateInsumo,
    deleteInsumo,
    deletePreparado,
    restoreInsumo,
    deleteDefinitivoInsumo,
    clearEventos,
    resetUnreadCount,
    toggleEstadoInsumo
  } = useInsumos();

  const alertShownRef = useRef(false);
  useEffect(() => {
    if (insumosVencidos && insumosVencidos.length > 0 && !alertShownRef.current) {
      alertShownRef.current = true;
      notify.warning(
        "Alerta de Vencimiento de Lote",
        `${insumosVencidos.length === 1 ? `"${insumosVencidos[0].nombre}"` : `${insumosVencidos.length} insumos`} tienen lote(s) vencido(s) y se han inactivado. Dirígete a Compras para registrar la compra.`
      );
    }
  }, [insumosVencidos, notify]);

  const [viewMode, setViewMode] = useState("activos"); // "activos" | "papelera"
  const [filterTipo, setFilterTipo] = useState("Todos los tipos");
  const [trazabilidadOpen, setTrazabilidadOpen] = useState(false);
  const [modalInsumoOpen, setModalInsumoOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState(null);
  const [viewingInsumo, setViewingInsumo] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exportarExcel = () => {
    const rows = filteredInsumos;
    if (rows.length === 0) return;

    const headers = [
      "ID",
      "Nombre",
      "Tipo",
      "Categoría",
      "Stock Actual",
      "Unidad de Medida",
      "Stock Mínimo",
      "Stock Máximo",
      "Precio / Costo",
      "Es Adición",
      "Precio Adición",
      "Estado"
    ];

    const data = rows.map((i, index) => [
      i.id || i.idInsumo || index + 1,
      i.nombre || "",
      i.tipo === "Preparado" ? "Insumo Preparado" : "Insumo Base",
      i.categoriaNombre || (typeof i.categoria === "string" ? i.categoria : i.categoria?.nombre) || "Sin categoría",
      i.stock ?? 0,
      i.unidadMedida || "und",
      i.stockMinimo ?? 0,
      i.stockMaximo ?? 100,
      Number(i.precioUnitario || i.costo || 0),
      (i.esAdicion === 1 || i.esAdicion === true) ? "Sí" : "No",
      Number(i.precioAdicion || 0),
      i.estado || "Activo"
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 28 },
      { wch: 18 },
      { wch: 20 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 12 },
      { wch: 16 },
      { wch: 12 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Insumos");
    XLSX.writeFile(workbook, `reporte_insumos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setExportMenuOpen(false);
  };

  const exportarPDF = () => {
    const rows = filteredInsumos;
    if (rows.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const tableRows = rows
      .map(
        (i, idx) => `
      <tr>
        <td>${i.id || i.idInsumo || idx + 1}</td>
        <td><strong>${i.nombre || ""}</strong></td>
        <td>${i.tipo === "Preparado" ? "Insumo Preparado" : "Insumo Base"}</td>
        <td>${i.categoriaNombre || (typeof i.categoria === "string" ? i.categoria : i.categoria?.nombre) || "Sin categoría"}</td>
        <td>${i.stock ?? 0} ${i.unidadMedida || "und"}</td>
        <td>${i.stockMinimo ?? 0} ${i.unidadMedida || "und"}</td>
        <td>${Number(i.precioUnitario || i.costo || 0).toLocaleString("es-CO")}</td>
        <td>${i.estado || "Activo"}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de Insumos - Chazin Food</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #f05454; font-size: 20px; margin-bottom: 4px; }
            p { font-size: 12px; color: #666; margin-top: 0; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-weight: bold; }
            td { border: 1px solid #e2e8f0; padding: 6px 8px; }
            tr:nth-child(even) { background: #fdfdfd; }
          </style>
        </head>
        <body>
          <h1>Chazin Food — Reporte de Insumos</h1>
          <p>Generado el ${new Date().toLocaleString("es-CO")} | Total registros: ${rows.length}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Stock Mín.</th>
                <th>Precio / Costo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setExportMenuOpen(false);
  };


  // Filter unified insumos (base + prepared) according to selected type filter
  const itemsToShow = filteredInsumos.filter((item) => {
    if (searchTerm && searchTerm.trim() !== "") return true;
    if (filterTipo === "Base") return item.tipo !== "Preparado";
    if (filterTipo === "Preparado") return item.tipo === "Preparado";
    return true;
  });

  const handleOpenTrazabilidad = () => {
    resetUnreadCount();
    setTrazabilidadOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingInsumo(null);
    setModalInsumoOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingInsumo(item);
    setModalInsumoOpen(true);
  };

  const handleDeleteItem = async (id, nombre, tipo, bloqueoInfo) => {
    // Buscar si el insumo tiene stock o compras
    const insumoTarget = insumos.find((ins) => (ins.id || ins.idInsumo) === id);
    const stockVal = insumoTarget ? Number(insumoTarget.stock || 0) : 0;
    const tieneCompras = insumoTarget ? Boolean(insumoTarget.tieneCompras || (insumoTarget.totalCompras && insumoTarget.totalCompras > 0)) : false;

    if (bloqueoInfo?.noSePuedeEliminar || stockVal > 0 || tieneCompras) {
      const msg = stockVal > 0
        ? `No se puede eliminar el insumo "${nombre}" porque cuenta con un stock activo de ${stockVal} ${insumoTarget?.unidadMedida || 'und'}. Para eliminarlo, su stock debe ser 0.`
        : `No se puede eliminar el insumo "${nombre}" porque ya fue asociado a compras registradas en el historial.`;
      notify.warning("Acción no permitida", msg);
      return;
    }

    if (tipo === "Preparado") {
      await deletePreparado(id, nombre);
    } else {
      await deleteInsumo(id, nombre);
    }
  };

  const handleSaveInsumo = async (form) => {
    let ok = false;
    if (editingInsumo) {
      ok = await updateInsumo(editingInsumo.id || editingInsumo.idInsumo, form);
    } else {
      ok = await createInsumo(form);
    }
    if (ok) {
      setModalInsumoOpen(false);
      setEditingInsumo(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Insumos
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Administra el inventario de insumos del negocio y sus adiciones disponibles
        </p>
      </div>

      {/* 4 Stat Cards Grid */}
      <InsumosStatsCards insumos={insumos} />

      {/* Alerta de Lotes Vencidos / Insumos Inactivados (#5) */}
      {insumosVencidos && insumosVencidos.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span>¡Alerta de Vencimiento de Lote!</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                  {insumosVencidos.length} {insumosVencidos.length === 1 ? "insumo inactivado" : "insumos inactivados"}
                </span>
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                {insumosVencidos.length === 1 ? (
                  <>
                    El insumo <strong className="font-bold underline">{insumosVencidos[0].nombre}</strong> ha cumplido la fecha de vencimiento de su lote y fue inactivado automáticamente. Debe registrarse una compra en el módulo de compras.
                  </>
                ) : (
                  <>
                    Los insumos <strong className="font-bold">{insumosVencidos.map((i) => i.nombre).slice(0, 3).join(", ")}{insumosVencidos.length > 3 ? ` y ${insumosVencidos.length - 3} más` : ""}</strong> han cumplido la fecha de vencimiento de su lote y fueron inactivados automáticamente. Debe registrarse una compra en el módulo de compras.
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              navigate("/compras/gestion", {
                state: {
                  openNuevaCompra: true,
                  initialInsumo: insumosVencidos[0]
                }
              });
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-[#F05454] hover:from-red-600 hover:to-[#d84343] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer w-full sm:w-auto"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            <span>Registrar compra</span>
          </button>
        </div>
      )}

      {/* VIEW MODE: PAPELERA */}
      {viewMode === "papelera" ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar insumo en papelera..."
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode("activos")}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs sm:text-sm rounded-2xl transition-colors cursor-pointer"
              >
                Volver a Insumos Activos
              </button>
            </div>
          </div>

          <PapeleraReciclajeView
            papeleraInsumos={papeleraInsumos}
            papeleraPreparados={papeleraPreparados}
            onVolverActivos={() => setViewMode("activos")}
            onRestaurarInsumo={restoreInsumo}
            onEliminarDefinitivoInsumo={deleteDefinitivoInsumo}
          />
        </div>
      ) : (
        /* VIEW MODE: ACTIVOS */
        <div className="space-y-6">
          {/* Filter and Action Bar Box - En una sola línea */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar insumo por nombre, categoría, lote, estado, código o precio..."
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
              />
            </div>

            {/* Filter Dropdowns, Trazabilidad & Primary Action Button */}
            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
              </select>

              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
              >
                <option value="Todas">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id || c.nombre} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
              >
                <option value="Todos los tipos">Todos los tipos</option>
                <option value="Base">Insumo Base</option>
                <option value="Preparado">Insumo Preparado</option>
              </select>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleOpenTrazabilidad}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-slate-700 dark:text-gray-200 font-medium text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer shrink-0"
                >
                  <Bell className="w-4 h-4 text-slate-600 dark:text-gray-300" />
                  <span>Trazabilidad</span>
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#F05454] text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>

              {canCreate && (
                <button
                  onClick={handleOpenCreate}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nuevo Insumo</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Badges / Identificación de Filtros (#55) */}
          {(filterEstado !== "Todos" || (filterTipo !== "Todos los tipos" && filterTipo !== "Todos") || filterCategoria !== "Todas" || (searchTerm && searchTerm.trim() !== "")) && (
            <div className="flex items-center gap-2 flex-wrap text-xs px-2 py-1">
              <span className="text-gray-500 dark:text-gray-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filtros activos:
              </span>
              {filterEstado !== "Todos" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                  <span>Estado: {filterEstado}</span>
                  <button
                    type="button"
                    onClick={() => setFilterEstado("Todos")}
                    className="hover:text-emerald-900 cursor-pointer font-bold ml-0.5"
                    title="Quitar filtro"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterTipo !== "Todos los tipos" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-[#F05454] border border-red-200 dark:border-red-900/60 font-medium">
                  <span>Tipo: {filterTipo}</span>
                  <button
                    type="button"
                    onClick={() => setFilterTipo("Todos los tipos")}
                    className="hover:text-red-700 cursor-pointer font-bold ml-0.5"
                    title="Quitar filtro"
                  >
                    ×
                  </button>
                </span>
              )}
              {filterCategoria !== "Todas" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 font-medium">
                  <span>Categoría: {filterCategoria}</span>
                  <button
                    type="button"
                    onClick={() => setFilterCategoria("Todas")}
                    className="hover:text-blue-800 cursor-pointer font-bold ml-0.5"
                    title="Quitar filtro"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm.trim() !== "" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-medium">
                  <span>Búsqueda: &quot;{searchTerm}&quot;</span>
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="hover:text-gray-900 cursor-pointer font-bold ml-0.5"
                    title="Quitar filtro"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setFilterEstado("Todos");
                  setFilterTipo("Todos los tipos");
                  setFilterCategoria("Todas");
                  setSearchTerm("");
                }}
                className="text-xs text-gray-500 hover:text-red-500 underline ml-2 cursor-pointer font-medium"
              >
                Limpiar todos
              </button>
            </div>
          )}

          {/* Unified Table: Base + Preparados */}
          {loading ? (
            <ChazinLoader text="CARGANDO INSUMOS" size="md" />
          ) : (
            <InsumosTable
              insumos={itemsToShow}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteItem}
              onView={(item) => setViewingInsumo(item)}
              onToggleEstado={toggleEstadoInsumo}
              onRegistrarCompra={(item) =>
                navigate("/compras/gestion", {
                  state: { openNuevaCompra: true, initialInsumo: item }
                })
              }
              onReabastecer={(item) =>
                navigate("/compras/gestion", {
                  state: { openNuevaCompra: true, initialInsumo: item }
                })
              }
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}
        </div>
      )}

      {/* Unified Insumo Modal (Base + Preparado + Adición) */}
      <InsumoModal
        isOpen={modalInsumoOpen}
        onClose={() => {
          setModalInsumoOpen(false);
          setEditingInsumo(null);
        }}
        onSave={handleSaveInsumo}
        insumo={editingInsumo}
        categorias={categorias}
        proveedores={proveedores}
        insumosDisponibles={insumos.filter((i) => i.tipo !== "Preparado")}
      />

      {/* Detail View Modal */}
      <VerInsumoModal
        isOpen={!!viewingInsumo}
        onClose={() => setViewingInsumo(null)}
        insumo={viewingInsumo}
        onEdit={
          canEdit
            ? (ins) => {
              setViewingInsumo(null);
              handleOpenEdit(ins);
            }
            : undefined
        }
      />

      {/* Trazabilidad Modal */}
      <TrazabilidadModal
        isOpen={trazabilidadOpen}
        onClose={() => setTrazabilidadOpen(false)}
        eventos={eventos}
        onClearAll={clearEventos}
        onOpenPapelera={() => {
          setTrazabilidadOpen(false);
          setViewMode("papelera");
        }}
      />
    </div>
  );
}

export default Insumos;
