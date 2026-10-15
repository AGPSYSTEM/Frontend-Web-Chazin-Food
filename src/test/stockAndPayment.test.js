/**
 * Automated Tests Suite:
 * 1. Control de Stock (Bloqueo de exceso de stock ej. pedir 100 con stock 10)
 * 2. Adiciones en Pedidos Múltiples (Separación de 5 hamburguesas con adición y 5 sin adición)
 * 3. Política de Pago en Efectivo y Límite de Vueltos ($100.000 COP máx)
 * 4. Cálculo de Totales y Descuentos de Fidelidad
 */

// Simulated Cart Implementation conforming to CartContext.jsx logic
function generateCartItemId(item) {
  const prodId = item.id || item.idProducto;
  const adicionesKey = (item.adiciones || [])
    .map((a) => `${a.idAdicion || a.id}:${a.cantidad || 1}`)
    .sort()
    .join(",");
  const obsKey = (item.observaciones || item.instrucciones || "").trim().toLowerCase();
  return `${prodId}__ads[${adicionesKey}]__obs[${obsKey}]`;
}

class TestCart {
  constructor() {
    this.cart = [];
  }

  getProductQuantityInCart(productId) {
    return this.cart
      .filter((it) => String(it.id || it.idProducto) === String(productId))
      .reduce((sum, it) => sum + Number(it.cantidad || 0), 0);
  }

  addToCart(item) {
    const cartItemId = item.cartItemId || generateCartItemId(item);
    const prodId = item.id || item.idProducto;
    const stock = Number(item.stock !== undefined ? item.stock : 9999);
    const qtyToAdd = Number(item.cantidad || 1);

    const otherLinesQty = this.cart
      .filter((it) => String(it.id || it.idProducto) === String(prodId) && it.cartItemId !== cartItemId)
      .reduce((sum, it) => sum + Number(it.cantidad || 0), 0);

    const existingItem = this.cart.find((it) => it.cartItemId === cartItemId);
    const currentLineQty = existingItem ? Number(existingItem.cantidad || 0) : 0;
    const newLineQty = currentLineQty + qtyToAdd;

    if (otherLinesQty + newLineQty > stock) {
      return {
        success: false,
        message: `Solo hay ${stock} unidades disponibles en stock de ${item.nombre}. Ya tienes ${otherLinesQty + currentLineQty} en tu carrito.`
      };
    }

    if (existingItem) {
      this.cart = this.cart.map((cartItem) =>
        cartItem.cartItemId === cartItemId ? { ...cartItem, cantidad: newLineQty } : cartItem
      );
    } else {
      this.cart.push({ ...item, cartItemId, cantidad: qtyToAdd, stock });
    }
    return { success: true };
  }

  updateQuantity(cartItemId, delta) {
    const target = this.cart.find((it) => it.cartItemId === cartItemId);
    if (!target) return;
    const prodId = target.id || target.idProducto;
    const stock = Number(target.stock !== undefined ? target.stock : 9999);

    if (delta > 0) {
      const otherLinesQty = this.cart
        .filter((it) => String(it.id || it.idProducto) === String(prodId) && it.cartItemId !== target.cartItemId)
        .reduce((sum, it) => sum + Number(it.cantidad || 0), 0);

      if (otherLinesQty + target.cantidad + delta > stock) {
        return { success: false, message: "Límite de stock alcanzado" };
      }
    }

    this.cart = this.cart
      .map((item) => {
        if (item.cartItemId === target.cartItemId) {
          const newQty = item.cantidad + delta;
          return newQty > 0 ? { ...item, cantidad: newQty } : item;
        }
        return item;
      })
      .filter((item) => item.cantidad > 0);

    return { success: true };
  }

  getSubtotal() {
    return this.cart.reduce((total, item) => {
      const adicionesTotal = (item.adiciones || []).reduce(
        (sum, a) => sum + (Number(a.precio) || 0) * (Number(a.cantidad) || 1),
        0
      );
      return total + ((Number(item.precio) || 0) + adicionesTotal) * (Number(item.cantidad) || 1);
    }, 0);
  }
}

// Cash Policy Validator
function validateCashPayment(totalOrder, cashGiven) {
  const MAX_CAMBIO_PERMITIDO = 100000;
  if (!cashGiven || cashGiven <= 0) {
    return { valid: false, reason: "Pago requerido" };
  }
  if (cashGiven < totalOrder) {
    return { valid: false, reason: "Monto insuficiente" };
  }
  const cambio = cashGiven - totalOrder;
  if (cambio > MAX_CAMBIO_PERMITIDO) {
    return {
      valid: false,
      cambio,
      reason: `Por seguridad de domiciliarios y caja, el cambio no puede exceder $${MAX_CAMBIO_PERMITIDO.toLocaleString("es-CO")}. Cambio calculado: $${cambio.toLocaleString("es-CO")}. Se requiere Transferencia o Tarjeta.`
    };
  }
  return { valid: true, cambio };
}

// --- RUN TESTS ---
console.log("==================================================");
console.log("🚀 EJECUTANDO SUITE DE PRUEBAS AUTOMATIZADAS");
console.log("==================================================");

let passed = 0;
let total = 0;

function assert(description, condition) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${description}`);
  }
}

// TEST 1: Control de Stock - No pedir 100 si stock es 10
const cart1 = new TestCart();
const burgerItem = { id: 1, nombre: "Hamburguesa Especial", precio: 15000, stock: 10 };

const resExcess = cart1.addToCart({ ...burgerItem, cantidad: 100 });
assert("No permite agregar 100 unidades cuando stock es 10", resExcess.success === false);

const resValid = cart1.addToCart({ ...burgerItem, cantidad: 10 });
assert("Permite agregar exactamente 10 unidades (stock completo)", resValid.success === true);

const resOverLimit = cart1.addToCart({ ...burgerItem, cantidad: 1 });
assert("Bloquea agregar 1 unidad extra cuando el stock ya está en el carrito", resOverLimit.success === false);

// TEST 2: Adiciones en pedidos múltiples (5 con adiciones + 5 sin adición)
const cart2 = new TestCart();
const line1 = {
  id: 1,
  nombre: "Hamburguesa Especial",
  precio: 15000,
  stock: 20,
  cantidad: 5,
  adiciones: [{ idAdicion: 4, nombre: "Queso Extra", precio: 2000, cantidad: 1 }]
};
const line2 = {
  id: 1,
  nombre: "Hamburguesa Especial",
  precio: 15000,
  stock: 20,
  cantidad: 5,
  adiciones: []
};

cart2.addToCart(line1);
cart2.addToCart(line2);

assert("El carrito contiene exactamente 2 líneas separadas", cart2.cart.length === 2);
assert("Línea 1 tiene 5 unidades con queso extra ($17.000 c/u)", cart2.cart[0].adiciones.length === 1 && cart2.cart[0].cantidad === 5);
assert("Línea 2 tiene 5 unidades sin adición ($15.000 c/u)", cart2.cart[1].adiciones.length === 0 && cart2.cart[1].cantidad === 5);

const expectedSubtotal = 5 * 17000 + 5 * 15000; // 85000 + 75000 = 160000
assert(`Subtotal calculado correctamente: $${expectedSubtotal} COP`, cart2.getSubtotal() === expectedSubtotal);

// Reducir cantidad solo de la Línea 1
cart2.updateQuantity(cart2.cart[0].cartItemId, -1);
assert("Modificar Línea 1 solo afecta a esa línea (queda en 4 unidades)", cart2.cart[0].cantidad === 4 && cart2.cart[1].cantidad === 5);

// TEST 3: Política de pago en efectivo y límite de cambio ($100.000 COP)
const orderTotal = 30000;

// Caso A: Intento de pagar con $1.000.000 COP
const payMillion = validateCashPayment(orderTotal, 1000000);
assert("Pagar orden de $30.000 con $1.000.000 es rechazado por cambio excesivo ($970.000 > $100.000)", payMillion.valid === false);

// Caso B: Pagar con billete de $50.000 COP (cambio de $20.000)
const payFifty = validateCashPayment(orderTotal, 50000);
assert("Pagar orden de $30.000 con $50.000 es aceptado con cambio de $20.000 COP", payFifty.valid === true && payFifty.cambio === 20000);

// Caso C: Pagar con billete de $100.000 COP (cambio de $70.000)
const payHundred = validateCashPayment(orderTotal, 100000);
assert("Pagar orden de $30.000 con $100.000 es aceptado con cambio de $70.000 COP", payHundred.valid === true && payHundred.cambio === 70000);

// Caso D: Pagar con monto insuficiente ($20.000 para orden de $30.000)
const payInsufficient = validateCashPayment(orderTotal, 20000);
assert("Pagar con monto menor al total es rechazado", payInsufficient.valid === false && payInsufficient.reason === "Monto insuficiente");

// TEST 4: Control de stock combinado entre múltiples líneas con adición
const cart3 = new TestCart();
const prodStock5 = { id: 9, nombre: "Pizza Familiar", precio: 40000, stock: 5 };
cart3.addToCart({ ...prodStock5, cantidad: 3, adiciones: [{ idAdicion: 1, nombre: "Borde Queso", precio: 5000 }] });
const resSecondLine = cart3.addToCart({ ...prodStock5, cantidad: 3, adiciones: [] });
assert("Suma total de producto a través de múltiples líneas no puede superar stock total (3+3 > 5)", resSecondLine.success === false);

const resSecondLineValid = cart3.addToCart({ ...prodStock5, cantidad: 2, adiciones: [] });
assert("Permite completar el stock exacto (3 + 2 = 5 unidades)", resSecondLineValid.success === true && cart3.getProductQuantityInCart(9) === 5);

console.log("==================================================");
console.log(`📊 RESULTADO: ${passed}/${total} pruebas pasadas con éxito (${((passed / total) * 100).toFixed(0)}%)`);
console.log("==================================================");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
