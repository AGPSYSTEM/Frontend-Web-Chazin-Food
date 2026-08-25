import { createContext, useContext, useState, useEffect } from "react";

export const IVA_RATE = 0.19;
const CartContext = createContext(undefined);

/**
 * Generates a unique, deterministic ID for an item in the cart based on:
 * - Product ID
 * - Selected additions (id and quantity)
 * - Any special instructions
 */
export function generateCartItemId(item) {
  const prodId = item.id || item.idProducto;
  const adicionesKey = (item.adiciones || [])
    .map((a) => `${a.idAdicion || a.id}:${a.cantidad || 1}`)
    .sort()
    .join(",");
  const obsKey = (item.observaciones || item.instrucciones || "").trim().toLowerCase();
  return `${prodId}__ads[${adicionesKey}]__obs[${obsKey}]`;
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
    return cart
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

  const addToCart = (item) => {
    const cartItemId = item.cartItemId || generateCartItemId(item);
    const prodId = item.id || item.idProducto;
    const stock = Number(item.stock !== undefined ? item.stock : (item.stockActual !== undefined ? item.stockActual : 9999));
    const qtyToAdd = Number(item.cantidad || 1);

    // Calculate current total for this product in cart excluding the exact same line item if we are re-adding
    const otherLinesQty = cart
      .filter((it) => String(it.id || it.idProducto) === String(prodId) && it.cartItemId !== cartItemId)
      .reduce((sum, it) => sum + Number(it.cantidad || 0), 0);

    const existingItem = cart.find((it) => it.cartItemId === cartItemId);
    const currentLineQty = existingItem ? Number(existingItem.cantidad || 0) : 0;
    const newLineQty = currentLineQty + qtyToAdd;

    if (otherLinesQty + newLineQty > stock) {
      const allowedForThisLine = Math.max(0, stock - otherLinesQty - currentLineQty);
      return {
        success: false,
        message: `Solo hay ${stock} unidades disponibles en stock de ${item.nombre}. Ya tienes ${otherLinesQty + currentLineQty} en tu carrito.`,
        allowedForThisLine
      };
    }

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.cartItemId === cartItemId
            ? { ...cartItem, cantidad: newLineQty, stock: stock }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...item,
          cartItemId,
          cantidad: qtyToAdd,
          stock: stock
        }
      ]);
    }

    return { success: true };
  };

  const removeFromCart = (cartItemIdOrId) => {
    setCart((prev) =>
      prev.filter(
        (item) => item.cartItemId !== cartItemIdOrId && String(item.id || item.idProducto) !== String(cartItemIdOrId)
      )
    );
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

      return prev
        .map((item) => {
          if (item.cartItemId === target.cartItemId) {
            const newQuantity = item.cantidad + delta;
            return newQuantity > 0 ? { ...item, cantidad: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.cantidad > 0);
    });
  };

  const clearCart = () => {
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
