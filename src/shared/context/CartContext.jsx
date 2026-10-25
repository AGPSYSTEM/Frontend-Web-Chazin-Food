import { createContext, useContext, useState, useEffect, useRef } from "react";

export const IVA_RATE = 0.19;
const CartContext = createContext(undefined);

/**
 * Generates a unique, deterministic ID for an item in the cart based on:
 * - Product ID / Variant ID / Sabor
 * - Selected additions (id and quantity)
 * - Any special instructions
 */
export function generateCartItemId(item) {
  const prodId = item.id || item.idProducto;
  const varKey = item.idVariante && String(item.idVariante) !== String(prodId) ? `_var[${item.idVariante}]` : '';
  const saborKey = item.sabor ? `_sabor[${String(item.sabor).toLowerCase().trim()}]` : '';
  const evtKey = item.eventoInfo?.idEvento || (item.isEvento ? 'evt' : '');
  const adicionesKey = (item.adiciones || [])
    .map((a) => `${a.idAdicion || a.id}:${a.cantidad || 1}`)
    .sort()
    .join(",");
  const obsKey = (item.observaciones || item.instrucciones || item.observacion || "").trim().toLowerCase();
  return `${prodId}${varKey}${saborKey}__evt[${evtKey}]__ads[${adicionesKey}]__obs[${obsKey}]`;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("chazin_cart");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((it) => ({
          ...it,
          cartItemId: it.cartItemId || generateCartItemId(it)
        }));
      }
      return [];
    } catch (e) {
      console.warn("Error rehidratando carrito de compras:", e);
      return [];
    }
  });

  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Persist cart on changes
  useEffect(() => {
    try {
      localStorage.setItem("chazin_cart", JSON.stringify(cart));
    } catch (e) {
      console.warn("Error guardando carrito en localStorage:", e);
    }
  }, [cart]);

  /**
   * Returns the total units of a given product currently in the cart
   */
  const getProductQuantityInCart = (productId) => {
    return (cartRef.current || cart)
      .filter((it) => String(it.id || it.idProducto) === String(productId))
      .reduce((sum, it) => sum + Number(it.cantidad || 0), 0);
  };

  /**
   * Checks if an addition of `qty` units is allowed according to product stock
   * Returns { allowed: boolean, maxAvailable: number, currentInCart: number }
   */
  const checkStockAvailability = (item, qtyToAdd = 1) => {
    const prodId = item.id || item.idProducto;
    const stock = Number(item.stock !== undefined ? item.stock : (item.stockActual !== undefined ? item.stockActual : 9999));
    const inCart = getProductQuantityInCart(prodId);
    const maxAvailable = Math.max(0, stock - inCart);
    return {
      allowed: inCart + qtyToAdd <= stock,
      stock,
      currentInCart: inCart,
      maxAvailable
    };
  };

  /**
   * Adds one item or an array of items to the cart atomically without race conditions or state overwriting.
   */
  const addToCart = (itemOrItems) => {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    if (items.length === 0) return { success: true, addedCount: 0 };

    let currentCart = [...(cartRef.current || cart)];
    let lastError = null;
    let addedCount = 0;

    for (const item of items) {
      if (!item) continue;
      const cartItemId = item.cartItemId || generateCartItemId(item);
      const prodId = item.id || item.idProducto;
      const stock = Number(item.stock !== undefined ? item.stock : (item.stockActual !== undefined ? item.stockActual : 9999));
      const qtyToAdd = Number(item.cantidad || 1);

      // Calculate current total for this product in cart excluding the exact same line item if we are re-adding
      const otherLinesQty = currentCart
        .filter((it) => String(it.id || it.idProducto) === String(prodId) && it.cartItemId !== cartItemId)
        .reduce((sum, it) => sum + Number(it.cantidad || 0), 0);

      const existingIndex = currentCart.findIndex((it) => it.cartItemId === cartItemId);
      const currentLineQty = existingIndex >= 0 ? Number(currentCart[existingIndex].cantidad || 0) : 0;
      const newLineQty = currentLineQty + qtyToAdd;

      if (otherLinesQty + newLineQty > stock) {
        const allowedForThisLine = Math.max(0, stock - otherLinesQty - currentLineQty);
        lastError = {
          success: false,
          message: `Solo hay ${stock} unidades disponibles en stock de ${item.nombre}. Ya tienes ${otherLinesQty + currentLineQty} en tu carrito.`,
          allowedForThisLine
        };
        continue;
      }

      if (existingIndex >= 0) {
        currentCart[existingIndex] = {
          ...currentCart[existingIndex],
          ...item,
          cantidad: newLineQty,
          stock: stock
        };
      } else {
        currentCart.push({
          ...item,
          cartItemId,
          cantidad: qtyToAdd,
          stock: stock
        });
      }
      addedCount++;
    }

    if (addedCount > 0) {
      cartRef.current = currentCart;
      setCart(currentCart);
    }

    if (lastError && addedCount === 0) {
      return lastError;
    }

    return { success: true, addedCount };
  };

  const removeFromCart = (cartItemIdOrId) => {
    setCart((prev) => {
      const next = prev.filter(
        (item) => item.cartItemId !== cartItemIdOrId && String(item.id || item.idProducto) !== String(cartItemIdOrId)
      );
      cartRef.current = next;
      return next;
    });
  };

  const updateQuantity = (cartItemIdOrId, delta) => {
    setCart((prev) => {
      const target = prev.find(
        (it) => it.cartItemId === cartItemIdOrId || String(it.id || it.idProducto) === String(cartItemIdOrId)
      );
      if (!target) return prev;

      const prodId = target.id || target.idProducto;
      const stock = Number(target.stock !== undefined ? target.stock : (target.stockActual !== undefined ? target.stockActual : 9999));
      
      if (delta > 0) {
        const otherLinesQty = prev
          .filter((it) => String(it.id || it.idProducto) === String(prodId) && it.cartItemId !== target.cartItemId)
          .reduce((sum, it) => sum + Number(it.cantidad || 0), 0);

        if (otherLinesQty + target.cantidad + delta > stock) {
          // Exceeds stock limit
          return prev;
        }
      }

      const next = prev
        .map((item) => {
          if (item.cartItemId === target.cartItemId) {
            const newQuantity = item.cantidad + delta;
            return newQuantity > 0 ? { ...item, cantidad: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.cantidad > 0);

      cartRef.current = next;
      return next;
    });
  };

  const clearCart = () => {
    cartRef.current = [];
    setCart([]);
    try {
      localStorage.removeItem("chazin_cart");
    } catch (e) {}
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + Number(item.cantidad || 0), 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const adicionesTotal = (item.adiciones || []).reduce(
        (sum, adicion) => sum + (Number(adicion.precio) || 0) * (Number(adicion.cantidad) || 1),
        0
      );
      return total + ((Number(item.precio) || 0) + adicionesTotal) * (Number(item.cantidad) || 1);
    }, 0);
  };

  const getIVA = () => Math.round(getSubtotal() * IVA_RATE);
  const getTotal = () => getSubtotal() + getIVA();

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addMultipleToCart: addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getSubtotal,
        getIVA,
        getTotal,
        getProductQuantityInCart,
        checkStockAvailability,
        generateCartItemId
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
