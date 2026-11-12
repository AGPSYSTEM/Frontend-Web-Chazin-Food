import { useState, useEffect, useCallback, useMemo } from "react";
import { insumosService } from "../servicios/insumosService";
import { proveedoresService } from "../servicios/proveedoresService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { normalizeFichaWithVersions } from "@/features/fichas-tecnicas/utils/fichaVersionUtils";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { apiClient } from "@/shared/api/apiClient";
import { matchesSmartSearch, formatStatusTokens, rankSearchResults, normalizeSearchText } from "@/shared/utils/searchUtils";

export function useInsumos() {
  const notify = useNotifications();
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [insumosVencidos, setInsumosVencidos] = useState([]);

  // Traceability & Papelera State from backend
  const [eventos, setEventos] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [papeleraInsumos, setPapeleraInsumos] = useState([]);
  const [papeleraPreparados, setPapeleraPreparados] = useState([]);

  const fetchTrazabilidad = useCallback(async () => {
    try {
      const [trazabilidadData, unreadData] = await Promise.all([
        apiClient.get("/trazabilidad").catch(() => []),
        apiClient.get("/trazabilidad/unread-count").catch(() => ({ unreadCount: 0 }))
      ]);
      setEventos(Array.isArray(trazabilidadData) ? trazabilidadData : []);
      setUnreadCount(unreadData?.unreadCount ?? 0);
    } catch (err) {
      console.warn("Error cargando trazabilidad:", err);
    }
  }, []);

  const fetchInsumos = useCallback(async () => {
    try {
      setLoading(true);
      const [insumosData, categoriasData, preparadosData, proveedoresData] = await Promise.all([
        insumosService.getInsumos(),
        insumosService.getCategorias(),
        insumosService.getInsumosPreparados(),
        proveedoresService.getProveedores().catch(() => [])
      ]);

      const baseMapped = (insumosData || []).map(i => ({
        ...i,
        tipo: "Base",
        estado: i.estado === 1 || i.estado === "Activo" || i.estado === "1" ? "Activo" : "Inactivo"
      }));

      const prepMapped = (preparadosData || []).map(p => {
        const fichaNorm = p.fichaTecnica
          ? normalizeFichaWithVersions(p.fichaTecnica, "INSUMO_PREPARADO", p.id)
          : null;
        const ent = fichaNorm?.datosEntidad;
        const resolvedPrecio =
          ent?.precioUnitario !== undefined && Number(ent.precioUnitario) > 0
            ? Number(ent.precioUnitario)
            : (p.precioVenta || p.costoTotal || 0);
        return {
          id: p.id,
          idInsumo: p.id,
          nombre: p.nombre,
          tipo: "Preparado",
          descripcion: ent?.descripcion !== undefined ? ent.descripcion : (p.descripcion || ""),
          precio: resolvedPrecio,
          precioUnitario: resolvedPrecio,
          costo: p.costoTotal || 0,
          unidadMedida: ent?.unidadMedida || p.unidadMedida || "und",
          estado: p.estado === 1 || p.estado === "Activo" || p.estado === "1" ? "Activo" : "Inactivo",
          fichaTecnica: fichaNorm,
          ingredientes: (p.insumos || p.componentes || []).map(d => ({
            id: d.idInsumo,
            nombre: d.insumoNombre || `Insumo #${d.idInsumo}`,
            cantidad: parseFloat(d.cantidad || 0),
            unidadMedida: d.unidadMedida || "und",
            precioUnitario: parseFloat(d.precioUnitario || 0)
          }))
        };
      });

      const allInsumos = [...baseMapped, ...prepMapped];
      setInsumos(allInsumos);
      setCategorias(categoriasData || []);
      setProveedores(proveedoresData || []);

      const todayStr = new Date().toISOString().split("T")[0];
      const vencidos = allInsumos.filter((i) => {
        const tieneLoteVencido = (i.lotes || []).some(
          (l) => l.estado === "VENCIDO" || (l.fechaVencimiento && l.fechaVencimiento <= todayStr)
        );
        const insumoVencido = i.fechaVencimiento && i.fechaVencimiento <= todayStr;
        return (tieneLoteVencido || insumoVencido) && (i.estado === "Inactivo" || i.stock <= 0 || tieneLoteVencido);
      });
      setInsumosVencidos(vencidos);

      await fetchTrazabilidad();
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al obtener insumos o categorías");
    } finally {
      setLoading(false);
    }
  }, [fetchTrazabilidad]);

  // Fetch papelera data from backend API
  const fetchPapelera = useCallback(async () => {
    try {
      const [insumosTrash, preparadosTrash] = await Promise.all([
        insumosService.getPapeleraInsumos(),
        insumosService.getPapeleraPreparados()
      ]);

      const prepTrashMapped = (preparadosTrash || []).map(p => ({
        id: p.id,
        idInsumo: p.id,
        nombre: p.nombre,
        tipo: "Preparado",
        descripcion: p.descripcion || "",
        precio: p.precioVenta || p.costoTotal || 0,
        costo: p.costoTotal || 0,
        unidadMedida: p.unidadMedida || "und",
        estado: p.estado === 1 || p.estado === "Activo" || p.estado === "1" ? "Activo" : "Inactivo",
        fichaTecnica: p.fichaTecnica ? normalizeFichaWithVersions(p.fichaTecnica, "insumo", p.id) : null,
        ingredientes: (p.insumos || p.componentes || []).map(d => ({
          id: d.idInsumo,
          nombre: d.insumoNombre || `Insumo #${d.idInsumo}`,
          cantidad: parseFloat(d.cantidad || 0),
          unidadMedida: d.unidadMedida || "und",
          precioUnitario: parseFloat(d.precioUnitario || 0)
        }))
      }));

      setPapeleraInsumos(insumosTrash || []);
      setPapeleraPreparados(prepTrashMapped);
    } catch (err) {
      console.error("Error al cargar papelera:", err);
    }
  }, []);

  useEffect(() => {
    fetchInsumos();
    fetchPapelera();
  }, [fetchInsumos, fetchPapelera]);

  const filteredInsumos = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const hasSearch = Boolean(searchTerm && searchTerm.trim());

    const baseFiltered = insumos.filter((item) => {
      const isPrep = item.tipo === "Preparado";
      const isAgotado = (item.stock || 0) === 0;
      const isBajo = (item.stock || 0) <= (item.stockMinimo || 0) && (item.stock || 0) > 0;
      const stockStatus = isAgotado
        ? "Agotado agotada stock agotado sin stock sin_stock cero 0 reabastecer"
        : isBajo
          ? "Bajo baja stock bajo alerta stock minimo reabastecer reabastecimiento disponible en stock"
          : "Normal disponible en stock suficiente";
      const esAdicionStr = (item.esAdicion === 1 || item.esAdicion === true || item.esAdicion === "1")
        ? "Adición Adicion adicion es adicion adicionable si sí"
        : "estandar ingrediente base sin adicion";

      // Chequeo profundo de lotes y fechas de vencimiento
      const hasLots = Array.isArray(item.lotes) && item.lotes.length > 0;
      let tieneLoteVencido = false;
      const lotesTokensArr = [];

      if (hasLots) {
        lotesTokensArr.push("lote lotes con lote con lotes");
        item.lotes.forEach((l) => {
          const isLoteVenc = l.estado === "VENCIDO" || (l.fechaVencimiento && l.fechaVencimiento <= todayStr);
          if (isLoteVenc) tieneLoteVencido = true;

          const loteStatusStr = isLoteVenc
            ? "lote vencido lotes vencidos vencido vencida vencitos vencito caducado caducada expirado expirada reabastecer"
            : "lote activo lote vigente lote disponible";

          let fechaLoteFormatted = "";
          if (l.fechaVencimiento) {
            try {
              const parts = String(l.fechaVencimiento).split("-");
              if (parts.length === 3) {
                fechaLoteFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
              }
            } catch { }
          }

          lotesTokensArr.push(
            `lote ${l.numeroLote || ""} #${l.numeroLote || ""} ${l.numeroLote || ""} ` +
            `cant ${l.cantidad || 0} disp ${l.cantidadDisponible ?? l.cantidad ?? 0} ` +
            `${l.fechaVencimiento || ""} ${fechaLoteFormatted} ${l.estado || ""} ${loteStatusStr}`
          );
        });
      } else {
        lotesTokensArr.push("sin lote sin_lote sin lotes sin_lotes");
      }

      const insumoDirectoVencido = item.fechaVencimiento && item.fechaVencimiento <= todayStr;
      const estaVencido = tieneLoteVencido || insumoDirectoVencido;
      const vencimientoKeywords = estaVencido
        ? "lote vencido lotes vencidos vencido vencida vencitos vencito caducado caducada expirado expirada vencimiento inactivado reabastecer reabastecimiento"
        : "vigente fresco al dia buen_estado no vencido";

      let fechaVencFormatted = "";
      if (item.fechaVencimiento) {
        try {
          const parts = String(item.fechaVencimiento).split("-");
          if (parts.length === 3) {
            fechaVencFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        } catch { }
      }

      const lotesTokens = lotesTokensArr.join(" ");

      const ingredientesTokens = (item.ingredientes || [])
        .map((ing) => `${ing.nombre || ""} ${ing.cantidad || ""} ${ing.unidadMedida || ""}`)
        .join(" ");

      // Ficha técnica tokens para insumos preparados
      let fichaTokens = "";
      if (item.fichaTecnica) {
        const f = item.fichaTecnica;
        fichaTokens = [
          f.procedimiento || "",
          f.tiempoPreparacion ? `${f.tiempoPreparacion} min minutos tiempo preparacion` : "",
          f.rendimiento ? `${f.rendimiento} rendimiento porciones` : "",
          f.vidaUtil ? `${f.vidaUtil} vida util almacenamiento` : "",
          f.especificaciones || "",
          f.caracteristicas || "",
          f.condicionesAlmacenamiento || ""
        ].join(" ");
      }

      const precioNum = Number(item.precioUnitario || item.costo || item.precio || 0);
      const precioAdicionNum = Number(item.precioAdicion || 0);

      const hasDesc = Boolean(item.descripcion && String(item.descripcion).trim());
      const descText = hasDesc ? `${item.descripcion} con_descripcion con descripcion` : "sin_descripcion sin descripcion";
      const hasCat = Boolean((item.categoria || item.categoriaNombre) && String(item.categoria || item.categoriaNombre).trim());
      const catText = hasCat ? `${item.categoria || ""} ${item.categoriaNombre || ""} con_categoria con categoria` : "sin_categoria sin categoria";
      const hasProv = Boolean((item.proveedor || item.proveedorNombre) && String(item.proveedor || item.proveedorNombre).trim());
      const provText = hasProv ? `${item.proveedor || ""} ${item.proveedorNombre || ""} con_proveedor con proveedor` : "sin_proveedor sin proveedor";

      const matchSearch = matchesSmartSearch(
        [
          item.nombre,
          item.categoria,
          item.categoriaNombre,
          catText,
          item.categoria?.nombre,
          item.idCategoriaInsumo,
          item.proveedor,
          item.proveedorNombre,
          provText,
          item.proveedor?.nombre,
          item.proveedor?.contacto,
          item.proveedor?.telefono,
          item.proveedor?.email,
          item.proveedor?.nit,
          formatStatusTokens(item.estado),
          item.tipo,
          isPrep ? "Insumo Preparado Preparado receta" : "Insumo Base Base ingrediente",
          descText,
          item.unidadMedida,
          item.id,
          item.idInsumo,
          `#${item.id || item.idInsumo}`,
          item.stock,
          String(item.stock ?? ""),
          item.stock !== undefined && item.stock !== null ? `${item.stock} ${item.unidadMedida || ""}` : "",
          `stock ${item.stock ?? ""}`,
          item.stockMinimo,
          String(item.stockMinimo ?? ""),
          `minimo ${item.stockMinimo ?? ""}`,
          item.stockMaximo,
          String(item.stockMaximo ?? ""),
          `maximo ${item.stockMaximo ?? ""}`,
          precioNum,
          String(precioNum),
          `$${precioNum.toLocaleString("es-CO")}`,
          `$ ${precioNum.toLocaleString("es-CO")}`,
          precioAdicionNum > 0 ? precioAdicionNum : "",
          precioAdicionNum > 0 ? String(precioAdicionNum) : "",
          precioAdicionNum > 0 ? `$${precioAdicionNum.toLocaleString("es-CO")}` : "",
          stockStatus,
          esAdicionStr,
          item.incluyeIva ? "con iva incluye iva gravado" : "exento sin_impuesto no_gravado",
          item.fechaExpedicion || "",
          item.fechaVencimiento || "",
          fechaVencFormatted,
          vencimientoKeywords,
          lotesTokens,
          ingredientesTokens,
          fichaTokens
        ],
        searchTerm
      );

      const isItemActivo = item.estado === "Activo" || item.estado === 1 || item.estado === "1";
      const matchEstadoFiltro =
        filterEstado === "Todos" ||
        (filterEstado === "Activo" && isItemActivo) ||
        (filterEstado === "Inactivo" && !isItemActivo);

      // Si el usuario escribe en el buscador, la búsqueda prevalece para encontrar registros inmediatamente
      const matchEstado = !hasSearch ? matchEstadoFiltro : true;
      const matchCategoria = filterCategoria === "Todas" || item.categoria === filterCategoria || item.categoriaNombre === filterCategoria;

      return matchSearch && matchCategoria && matchEstado;
    });

    if (!hasSearch) {
      return baseFiltered;
    }

    return rankSearchResults(baseFiltered, searchTerm, (item, normQuery, tokens) => {
      let extra = 0;
      const isAdicion = item.esAdicion === 1 || item.esAdicion === true || item.esAdicion === "1";

      // Si busca "adicion", los que sean adiciones salen inmediatamente de primero
      if (tokens.some((t) => t.includes("adicion") || t.includes("adici"))) {
        if (isAdicion) extra += 2500;
        if (item.precioAdicion && Number(item.precioAdicion) > 0) extra += 500;
      }

      // Si busca "vencido" o variantes, los que tengan vencimiento cumplido van primero
      const tieneLoteVencido = (item.lotes || []).some(
        (l) => l.estado === "VENCIDO" || (l.fechaVencimiento && l.fechaVencimiento <= todayStr)
      );
      const vencidoDirecto = item.fechaVencimiento && item.fechaVencimiento <= todayStr;
      const estaVencido = tieneLoteVencido || vencidoDirecto;

      if (tokens.some((t) => t.includes("vencid") || t.includes("vencit") || t.includes("caduc"))) {
        if (estaVencido) extra += 2500;
      }

      // Si busca "lote" o "lotes"
      if (tokens.some((t) => t === "lote" || t === "lotes")) {
        if ((item.lotes || []).length > 0) extra += 800;
      }

      // Coincidencia con número de lote
      (item.lotes || []).forEach((l) => {
        const lotNum = normalizeSearchText(l.numeroLote || "");
        if (lotNum && tokens.some((t) => lotNum.includes(t))) extra += 600;
      });

      // Si busca "preparado" o "base"
      if (tokens.some((t) => t.includes("preparad"))) {
        if (item.tipo === "Preparado") extra += 1200;
      } else if (tokens.some((t) => t === "base")) {
        if (item.tipo !== "Preparado") extra += 1200;
      }

      // Categoría
      const cat = normalizeSearchText(item.categoriaNombre || item.categoria?.nombre || item.categoria || "");
      if (cat) {
        if (cat === normQuery) extra += 600;
        else if (cat.startsWith(normQuery)) extra += 400;
        else if (cat.includes(normQuery)) extra += 200;
      }

      // Proveedor
      const prov = normalizeSearchText(item.proveedorNombre || item.proveedor?.nombre || item.proveedor || "");
      if (prov) {
        if (prov === normQuery) extra += 500;
        else if (prov.startsWith(normQuery)) extra += 300;
        else if (prov.includes(normQuery)) extra += 150;
      }

      return extra;
    });
  }, [insumos, searchTerm, filterCategoria, filterEstado]);

  const createInsumo = async (data) => {
    try {
      const isPrep = data.tipo === "Preparado";
      if (isPrep) {
        const payload = {
          nombre: data.nombre,
          descripcion: data.descripcion || "",
          unidadMedida: data.unidadMedida || "und",
          precioVenta: Number(data.precio) || 0,
          estado: data.estado || "Activo",
          incluyeIva: data.incluyeIva ? 1 : 0,
          insumos: (data.ingredientes || []).map(i => ({
            idInsumo: i.id || i.idInsumo,
            cantidad: i.cantidad,
            unidadMedida: i.unidadMedida || "und"
          })),
          fichaTecnica: data.fichaTecnica || null
        };
        const res = await insumosService.createPreparado(payload);
        const createdId = res?.id || res?.idInsumo || res?.data?.id;
        if (data.fichaTecnica && createdId) {
          try {
            await fichasTecnicasService.saveFichaInsumoPreparado(createdId, data.fichaTecnica);
          } catch (e) {
            console.error("Error guardando ficha técnica del preparado:", e);
          }
        }
      } else {
        const payload = {
          nombre: data.nombre,
          idCategoriaInsumo: data.idCategoriaInsumo || 1,
          stock: Number(data.stock) || 0,
          stockMinimo: Number(data.stockMinimo) || 0,
          unidadMedida: data.unidadMedida || "und",
          precioUnitario: Number(data.precioUnitario) || 0,
          idProveedor: data.idProveedor && String(data.idProveedor).trim() !== "" ? Number(data.idProveedor) : null,
          descripcion: data.descripcion || "",
          esAdicion: data.esAdicion ? 1 : 0,
          precioAdicion: Number(data.precioAdicion) || 0,
          imagen: data.imagen || "",
          incluyeIva: data.incluyeIva ? 1 : 0,
          estado: data.estado || "Activo",
          fechaExpedicion: null, // #62: Eliminada fecha de expedición
          fechaVencimiento: (data.fechaVencimiento && String(data.fechaVencimiento).trim() !== "") ? data.fechaVencimiento : null
        };
        await insumosService.createInsumo(payload);
      }

      await fetchInsumos();

      notify.success(
        isPrep ? "Insumo preparado creado" : "Insumo creado",
        "El registro se realizó exitosamente."
      );
      return true;
    } catch (err) {
      const statusPfx = err?.status ? `[HTTP ${err.status}] ` : "";
      notify.error("Error al registrar insumo", `${statusPfx}${err.message || "Error en el servidor"}`);
      return false;
    }
  };

  const updateInsumo = async (id, data) => {
    try {
      const isPrep = data.tipo === "Preparado";
      if (isPrep) {
        if (data.fichaTecnica && id) {
          try {
            await fichasTecnicasService.saveFichaInsumoPreparado(id, data.fichaTecnica);
          } catch (e) {
            console.error("Error guardando ficha técnica del preparado:", e);
          }
        }
        const payload = {
          nombre: data.nombre,
          descripcion: data.descripcion || "",
          unidadMedida: data.unidadMedida || "und",
          precioVenta: Number(data.precio) || 0,
          estado: data.estado !== undefined ? data.estado : "Activo",
          insumos: (data.ingredientes || []).map(i => ({
            idInsumo: i.id || i.idInsumo,
            cantidad: i.cantidad,
            unidadMedida: i.unidadMedida || "und"
          }))
        };
        await insumosService.updatePreparado(id, payload);
      } else {
        const payload = {
          nombre: data.nombre,
          idCategoriaInsumo: data.idCategoriaInsumo,
          stock: Number(data.stock),
          stockMinimo: Number(data.stockMinimo),
          unidadMedida: data.unidadMedida,
          precioUnitario: Number(data.precioUnitario),
          idProveedor: data.idProveedor && String(data.idProveedor).trim() !== "" ? Number(data.idProveedor) : null,
          descripcion: data.descripcion,
          esAdicion: data.esAdicion ? 1 : 0,
          precioAdicion: Number(data.precioAdicion) || 0,
          imagen: data.imagen || "",
          incluyeIva: data.incluyeIva !== undefined ? (data.incluyeIva ? 1 : 0) : undefined,
          porcentajeIva: data.incluyeIva ? (parseFloat(data.porcentajeIva) || 19) : 0,
          estado: data.estado !== undefined ? data.estado : "Activo",
          fechaExpedicion: null, // #62: Eliminada fecha de expedición
          fechaVencimiento: (data.fechaVencimiento && String(data.fechaVencimiento).trim() !== "") ? data.fechaVencimiento : null
        };
        await insumosService.updateInsumo(id, payload);
      }

      await fetchInsumos();

      notify.success("Insumo actualizado", "Los datos fueron guardados exitosamente.");
      return true;
    } catch (err) {
      const statusPfx = err?.status ? `[HTTP ${err.status}] ` : "";
      notify.error("Error al actualizar insumo", `${statusPfx}${err.message || "Error en el servidor"}`);
      return false;
    }
  };

  const toggleEstadoInsumo = async (item) => {
    const id = item.id || item.idInsumo;
    const nuevoEstado = item.estado === "Activo" ? "Inactivo" : "Activo";

    if (nuevoEstado === "Inactivo") {
      const confirmed = await notify.confirmAction(
        "¿Inactivar insumo?",
        `¿Estás seguro de que deseas inactivar "${item.nombre}"? Este insumo no estará disponible para recetas ni compras hasta que sea activado nuevamente.`,
        "Sí, inactivar"
      );
      if (!confirmed) return false;
    }

    try {
      if (item.tipo === "Preparado") {
        await insumosService.updatePreparado(id, {
          ...item,
          estado: nuevoEstado
        });
      } else {
        await insumosService.updateInsumo(id, {
          ...item,
          estado: nuevoEstado
        });
      }
      await fetchInsumos();
      notify.success(
        nuevoEstado === "Activo" ? "Insumo activado" : "Insumo inactivado",
        `"${item.nombre}" ahora está ${nuevoEstado}.`
      );
      return true;
    } catch (err) {
      notify.error("Error al cambiar estado", err.message || "No se pudo actualizar el estado del insumo");
      return false;
    }
  };

  // Soft delete — moves base insumo to papelera (sets estado = 0 in backend)
  const deleteInsumo = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Mover a la papelera?",
      `¿Deseas mover "${nombre}" a la papelera de reciclaje?`
    );
    if (!confirmed) return false;

    try {
      await insumosService.deleteInsumo(id);
      await fetchInsumos();
      await fetchPapelera();

      notify.success("Movido a papelera", `"${nombre}" fue enviado a la papelera.`);
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar");
      return false;
    }
  };

  // Soft delete for insumos preparados — moves prepared insumo to papelera
  const deletePreparado = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Mover a la papelera?",
      `¿Deseas mover el preparado "${nombre}" a la papelera de reciclaje?`
    );
    if (!confirmed) return false;

    try {
      await insumosService.deletePreparado(id);
      await fetchInsumos();
      await fetchPapelera();

      notify.success("Movido a papelera", `"${nombre}" fue enviado a la papelera.`);
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar el preparado");
      return false;
    }
  };

  // Restore from papelera — calls backend API to set estado = 1
  const restoreInsumo = async (item) => {
    try {
      const isPreparado = item.tipo === "Preparado" || item.componentes || item.ingredientes;

      if (isPreparado) {
        await insumosService.restorePreparado(item.id || item.idInsumo);
      } else {
        await insumosService.restoreInsumo(item.id || item.idInsumo);
      }

      await fetchInsumos();
      await fetchPapelera();

      notify.success("Insumo restaurado", `"${item.nombre}" volvió a estar activo.`);
    } catch (err) {
      notify.error("Error", err.message || "No se pudo restaurar");
    }
  };

  // Hard delete — permanent elimination from database
  const deleteDefinitivoInsumo = async (id, nombre, isPreparado) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar definitivamente?",
      `Esta acción eliminará permanentemente "${nombre}" y no se podrá recuperar.`
    );
    if (!confirmed) return;

    try {
      if (isPreparado) {
        await insumosService.hardDeletePreparado(id);
      } else {
        await insumosService.hardDeleteInsumo(id);
      }

      await fetchPapelera();
      await fetchTrazabilidad();

      notify.success("Eliminado permanente", `"${nombre}" fue eliminado por completo.`);
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar permanentemente");
    }
  };

  const clearEventos = async () => {
    try {
      await apiClient.delete("/trazabilidad/clear");
      setEventos([]);
      setUnreadCount(0);
      notify.success("Trazabilidad limpia", "Se borró el historial de eventos.");
    } catch (err) {
      console.error("Error al limpiar eventos:", err);
    }
  };

  const resetUnreadCount = async () => {
    try {
      await apiClient.put("/trazabilidad/read-all");
      setUnreadCount(0);
    } catch (err) {
      console.error("Error al marcar como leídos:", err);
    }
  };

  return {
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
    insumosVencidos,
    eventos,
    unreadCount,
    papeleraInsumos,
    papeleraPreparados,
    refetch: fetchInsumos,
    refetchPapelera: fetchPapelera,
    createInsumo,
    updateInsumo,
    toggleEstadoInsumo,
    deleteInsumo,
    deletePreparado,
    restoreInsumo,
    deleteDefinitivoInsumo,
    clearEventos,
    resetUnreadCount
  };
}
