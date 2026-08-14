import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { posService } from "../servicios/posService";

function findCartItemIndex(cart, productoId, varianteId, adicionIds) {
  return cart.findIndex((it) => {
    if (it.productoId !== productoId) return false;
    if (it.varianteId !== varianteId) return false;
    const existingAdIds = (it.adiciones || []).map((a) => a.id).sort().join(',');
    const newAdIds = (adicionIds || []).slice().sort().join(',');
    return existingAdIds === newAdIds;
  });
}

export function usePOS({ initialClienteId = null } = {}) {
  const { user } = useAuth();
  const authenticatedUserId = user?.idUsuario ?? user?.id ?? null;

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [clienteId, setClienteId] = useState(initialClienteId);
  const [observacionOrden, setObservacionOrden] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resCategorias = await posService.getCategorias();
        console.log('Respuesta Categorías:', resCategorias);

        const rawList = Array.isArray(resCategorias)
          ? resCategorias
          : (Array.isArray(resCategorias?.data) ? resCategorias.data : (resCategorias?.data?.data || resCategorias?.data?.categorias || []));

        const activeCategorias = rawList.filter(c =>
          (c.estado === 'Activo' || c.estado === 1) &&
          c.id !== 0 &&
          c.idCategoriaProducto !== 0 &&
          !c.nombre?.startsWith('__SISTEMA')
        );

        setCategorias(activeCategorias);
      } catch (e) {
        console.error('Error al cargar categorías:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resProductos = await posService.getProductos();
        console.log('Respuesta Productos:', resProductos);

        const rawList = Array.isArray(resProductos)
          ? resProductos
          : (Array.isArray(resProductos?.data) ? resProductos.data : (resProductos?.data?.data || resProductos?.data?.productos || []));

        const activeProductos = rawList.filter(p =>
          (p.estado === 'Activo' || p.estado === 1) &&
          p.id !== 0 &&
          p.idProducto !== 0 &&
          !p.nombre?.startsWith('__SISTEMA')
        );

        setProductos(activeProductos);
      } catch (e) {
        console.error('Error al cargar productos:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, it) => {
      const base = (it.precio || 0) * (it.cantidad || 1);
      const adds = (it.adiciones || []).reduce((a, b) => a + (b.precio || 0), 0) * (it.cantidad || 1);
      return acc + base + adds;
    }, 0);
  }, [cart]);

  const descuento = 0; // placeholder for business rules

  const total = subtotal - descuento;

  function addProduct({ productoId, varianteId, nombre, precio, adiciones = [], observacion = "" }) {
    setCart((prev) => {
      const adicionIds = (adiciones || []).map((a) => a.id || a).slice();
      const idx = findCartItemIndex(prev, productoId, varianteId, adicionIds);
      if (idx >= 0) {
        const newCart = [...prev];
        newCart[idx] = { ...newCart[idx], cantidad: (newCart[idx].cantidad || 0) + 1 };
        return newCart;
      }
      return [...prev, { productoId, varianteId, nombre, precio, adiciones, cantidad: 1, observacion }];
    });
  }

  function increment(index) {
    setCart((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], cantidad: (next[index].cantidad || 0) + 1 };
      return next;
    });
  }

  function decrement(index) {
    setCart((prev) => {
      const next = [...prev];
      const newQty = (next[index].cantidad || 1) - 1;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index] = { ...next[index], cantidad: newQty };
      }
      return next;
    });
  }

  function setItemObservacion(index, text) {
    setCart((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], observacion: text };
      return next;
    });
  }

  function toggleAdicion(index, adicion) {
    setCart((prev) => {
      const next = [...prev];
      const item = next[index];
      const exists = (item.adiciones || []).some((a) => a.id === adicion.id);
      if (exists) {
        item.adiciones = (item.adiciones || []).filter((a) => a.id !== adicion.id);
      } else {
        item.adiciones = [...(item.adiciones || []), adicion];
      }
      next[index] = { ...item };
      return next;
    });
  }

  async function submitOrder({ idUsuario = authenticatedUserId } = {}) {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        idUsuario: idUsuario ?? authenticatedUserId,
        idCliente: clienteId,
        observacion: observacionOrden,
        estado: "PENDIENTE",
        items: cart.map((it) => ({
          idVariante: it.varianteId,
          cantidad: it.cantidad,
          idAdiciones: (it.adiciones || []).map((a) => a.id),
          observacion: it.observacion || ""
        }))
      };
      const res = await posService.createVenta(payload);
      setCart([]);
      return res;
    } catch (e) {
      console.error(e);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    categorias,
    productos,
    categoriaActiva,
    setCategoriaActiva,
    searchTerm,
    setSearchTerm,
    cart,
    addProduct,
    increment,
    decrement,
    toggleAdicion,
    setItemObservacion,
    subtotal,
    descuento,
    total,
    clienteId,
    setClienteId,
    observacionOrden,
    setObservacionOrden,
    submitOrder,
    loading,
    error
  };
}

export default usePOS;
