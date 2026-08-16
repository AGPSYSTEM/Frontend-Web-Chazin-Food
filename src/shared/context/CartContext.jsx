import { createContext, useContext, useState } from "react";
export const IVA_RATE = 0.19;
const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    const existingItem = cart.find(
      (cartItem) => cartItem.id === item.id && JSON.stringify(cartItem.adiciones) === JSON.stringify(item.adiciones)
    );
    if (existingItem) {
      setCart(cart.map(
        (cartItem) => cartItem.id === item.id && JSON.stringify(cartItem.adiciones) === JSON.stringify(item.adiciones)
          ? { ...cartItem, cantidad: cartItem.cantidad + item.cantidad }
          : cartItem
      ));
    } else {
      setCart([...cart, item]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map((item) => {
      if (item.id === id) {
        const newQuantity = item.cantidad + delta;
        return newQuantity > 0 ? { ...item, cantidad: newQuantity } : item;
      }
      return item;
    }).filter((item) => item.cantidad > 0));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const adicionesTotal = (item.adiciones || []).reduce((sum, adicion) => sum + (Number(adicion.precio) || 0) * (Number(adicion.cantidad) || 1), 0);
      return total + ((Number(item.precio) || 0) + adicionesTotal) * (Number(item.cantidad) || 1);
    }, 0);
  };

  const getIVA = () => Math.round(getSubtotal() * IVA_RATE);
  const getTotal = () => getSubtotal() + getIVA();

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getSubtotal,
      getIVA,
      getTotal
    }}>
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
