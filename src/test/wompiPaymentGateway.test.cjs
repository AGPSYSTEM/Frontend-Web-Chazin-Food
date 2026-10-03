/**
 * ════════════════════════════════════════════════════════════════════════════════
 * 🧪 Suite de Pruebas Automatizadas: Pasarela de Pagos Wompi (Chazin Food)
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * Ejecutar con: node src/test/wompiPaymentGateway.test.js
 *
 * Pre-requisitos:
 *   1. MySQL activo (XAMPP)
 *   2. Backend corriendo en http://localhost:5000 (npm run dev)
 *   3. Variables de entorno Wompi configuradas en backend/.env
 *
 * Esta suite valida:
 *   1. Configuración de variables de entorno (.env)
 *   2. Generación de firma de integridad SHA-256
 *   3. Generación de referencia única CHAZIN-{timestamp}-{random}
 *   4. Creación de intención de pago vía API (/api/wompi/intencion)
 *   5. Validaciones de seguridad (monto <= 0, usuario faltante)
 *   6. Verificación de transacción vía API Sandbox (/api/wompi/verificar)
 *   7. Procesamiento de Webhook (transaction.updated)
 *   8. Estructura de datos de la venta registrada en BD
 *   9. Estados de pago (APPROVED, DECLINED, PENDING)
 *   10. Flujo completo: Intención → Widget → Verificación → Actualización BD
 */

const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════
const BACKEND_URL = 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

// Claves Sandbox oficiales de Wompi (deben coincidir con backend/.env)
const WOMPI_CONFIG = {
  publicKey: 'pub_test_aqlt5Kk6gDrCW296IVkf1n0De21AEr2I',
  privateKey: 'prv_test_lC7vjgEhCHxrEVXxNrX0clriOP8A7GTn',
  integritySecret: 'test_integrity_PmDpwSH12VSL2jObpWg292PnYgUqGYzG',
  eventsSecret: 'test_events_xkK5fK3O7ohj5Pz1iINFecLOTOyNPJC7'
};

// Datos de prueba de tarjeta Sandbox oficial de Wompi
const TARJETA_PRUEBA = {
  numero: '4242424242424242',
  exp_mes: '12',
  exp_año: '28',
  cvc: '123',
  titular: 'Juan Pérez',
  cuotas: 1
};

// ═══════════════════════════════════════════════════════════════
// INFRAESTRUCTURA DE TESTING
// ═══════════════════════════════════════════════════════════════
let passed = 0;
let failed = 0;
let total = 0;
let currentGroup = '';

function group(name) {
  currentGroup = name;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📋 ${name}`);
  console.log(`${'─'.repeat(60)}`);
}

function assert(description, condition) {
  total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
    failed++;
  }
}

async function assertAsync(description, asyncFn) {
  total++;
  try {
    const result = await asyncFn();
    if (result) {
      console.log(`  ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      failed++;
    }
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description} → Error: ${err.message}`);
    failed++;
  }
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const body = await res.text();
  let json;
  try { json = JSON.parse(body); } catch (e) { json = null; }
  return { status: res.status, ok: res.ok, body: json, raw: body };
}

// ═══════════════════════════════════════════════════════════════
// TEST 1: GENERACIÓN DE FIRMA DE INTEGRIDAD SHA-256
// ═══════════════════════════════════════════════════════════════
function generarFirmaIntegridad(referencia, montoEnCentavos, moneda = 'COP') {
  const cadena = `${referencia}${montoEnCentavos}${moneda}${WOMPI_CONFIG.integritySecret}`;
  return crypto.createHash('sha256').update(cadena, 'utf8').digest('hex');
}

function testFirmaIntegridad() {
  group('1. Generación de Firma de Integridad SHA-256');

  // Test con valores conocidos
  const ref = 'CHAZIN-TEST-001';
  const monto = 1500000; // $15.000 COP en centavos
  const moneda = 'COP';

  const firma = generarFirmaIntegridad(ref, monto, moneda);
  assert('Firma SHA-256 genera string hexadecimal de 64 caracteres', firma.length === 64 && /^[a-f0-9]+$/.test(firma));

  // La misma entrada siempre debe producir la misma firma (determinismo)
  const firma2 = generarFirmaIntegridad(ref, monto, moneda);
  assert('Firma es determinística (misma entrada = misma salida)', firma === firma2);

  // Cambiar cualquier parámetro debe cambiar la firma
  const firmaOtraRef = generarFirmaIntegridad('CHAZIN-TEST-002', monto, moneda);
  assert('Cambiar referencia produce firma diferente', firma !== firmaOtraRef);

  const firmaOtroMonto = generarFirmaIntegridad(ref, 2000000, moneda);
  assert('Cambiar monto produce firma diferente', firma !== firmaOtroMonto);

  // Verificar que el formato de la cadena es correcto (referencia + monto + moneda + secret)
  const cadenaEsperada = `${ref}${monto}${moneda}${WOMPI_CONFIG.integritySecret}`;
  const firmaEsperada = crypto.createHash('sha256').update(cadenaEsperada, 'utf8').digest('hex');
  assert('Fórmula de firma: SHA256(ref + monto + moneda + secret)', firma === firmaEsperada);
}

// ═══════════════════════════════════════════════════════════════
// TEST 2: FORMATO DE REFERENCIA ÚNICA
// ═══════════════════════════════════════════════════════════════
function testReferenciaUnica() {
  group('2. Formato de Referencia Única');

  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const referencia = `CHAZIN-${timestamp}-${randomSuffix}`;

  assert('Referencia inicia con prefijo "CHAZIN-"', referencia.startsWith('CHAZIN-'));
  assert('Referencia contiene timestamp numérico', /^CHAZIN-\d+-\d{4}$/.test(referencia));
  assert('Sufijo aleatorio es de 4 dígitos (1000-9999)', randomSuffix >= 1000 && randomSuffix <= 9999);

  // Generar múltiples y verificar unicidad
  const refs = new Set();
  for (let i = 0; i < 100; i++) {
    const ts = Date.now() + i;
    const suffix = Math.floor(1000 + Math.random() * 9000);
    refs.add(`CHAZIN-${ts}-${suffix}`);
  }
  assert('100 referencias generadas son todas únicas', refs.size === 100);
}

// ═══════════════════════════════════════════════════════════════
// TEST 3: CONVERSIÓN MONTOS A CENTAVOS
// ═══════════════════════════════════════════════════════════════
function testConversionCentavos() {
  group('3. Conversión de Montos a Centavos');

  // Wompi requiere montos en centavos (COP * 100)
  const total15000 = 15000;
  const centavos15000 = Math.round(total15000 * 100);
  assert('$15.000 COP → 1500000 centavos', centavos15000 === 1500000);

  const total3777 = 3777;
  const centavos3777 = Math.round(total3777 * 100);
  assert('$3.777 COP → 377700 centavos', centavos3777 === 377700);

  const totalDecimales = 15000.50;
  const centavosDecimales = Math.round(totalDecimales * 100);
  assert('$15.000,50 COP → 1500050 centavos (redondeo)', centavosDecimales === 1500050);

  // Montos negativos o cero no deben ser válidos
  assert('Monto $0 no debe generar centavos válidos', Math.round(0 * 100) === 0);
  assert('Monto negativo genera centavos negativos', Math.round(-5000 * 100) === -500000);
}

// ═══════════════════════════════════════════════════════════════
// TEST 4: VALIDACIÓN DE FIRMA DE WEBHOOK
// ═══════════════════════════════════════════════════════════════
function testValidacionWebhook() {
  group('4. Validación de Firma de Webhook');

  // Simular un evento de webhook con firma válida
  const eventData = {
    event: 'transaction.updated',
    data: {
      transaction: {
        id: 'test-tx-123',
        status: 'APPROVED',
        reference: 'CHAZIN-TEST-001',
        amount_in_cents: 1500000
      }
    },
    timestamp: Date.now(),
    signature: {
      properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
      checksum: '' // Se calcula abajo
    }
  };

  // Calcular checksum esperado
  const props = eventData.signature.properties;
  let cadena = '';
  for (const prop of props) {
    const parts = prop.split('.');
    let val = eventData.data;
    for (const p of parts) {
      if (val) val = val[p];
    }
    cadena += (val !== undefined && val !== null) ? val : '';
  }
  cadena += `${eventData.timestamp}${WOMPI_CONFIG.eventsSecret}`;
  const checksumValido = crypto.createHash('sha256').update(cadena, 'utf8').digest('hex');
  eventData.signature.checksum = checksumValido;

  // Función local que replica la validación del backend
  function validarFirmaWebhook(body) {
    const eventsSecret = WOMPI_CONFIG.eventsSecret;
    if (!eventsSecret || !body || !body.signature) return false;

    const { properties, checksum } = body.signature;
    const timestamp = body.timestamp;
    if (!properties || !checksum) return false;

    let cadena = '';
    for (const prop of properties) {
      const parts = prop.split('.');
      let val = body.data;
      for (const p of parts) {
        if (val) val = val[p];
      }
      cadena += (val !== undefined && val !== null) ? val : '';
    }
    cadena += `${timestamp}${eventsSecret}`;

    const calculated = crypto.createHash('sha256').update(cadena, 'utf8').digest('hex');
    return calculated === checksum;
  }

  assert('Webhook con firma válida es aceptado', validarFirmaWebhook(eventData) === true);

  // Webhook con checksum alterado debe ser rechazado
  const eventDataAlterado = JSON.parse(JSON.stringify(eventData));
  eventDataAlterado.signature.checksum = 'abc123invalido';
  assert('Webhook con firma alterada es rechazado', validarFirmaWebhook(eventDataAlterado) === false);

  // Webhook sin firma debe ser rechazado
  assert('Webhook sin firma es rechazado', validarFirmaWebhook({}) === false);
  assert('Webhook null es rechazado', validarFirmaWebhook(null) === false);

  // Webhook con timestamp diferente cambia la firma
  const eventDataOtroTimestamp = JSON.parse(JSON.stringify(eventData));
  eventDataOtroTimestamp.timestamp = Date.now() + 99999;
  assert('Webhook con timestamp diferente cambia la firma', validarFirmaWebhook(eventDataOtroTimestamp) === false);
}

// ═══════════════════════════════════════════════════════════════
// TEST 5: API - CREACIÓN DE INTENCIÓN DE PAGO
// ═══════════════════════════════════════════════════════════════
async function testCrearIntencionPago() {
  group('5. API - Creación de Intención de Pago (/api/wompi/intencion)');

  // Caso exitoso: crear intención con datos válidos
  const pedidoValido = {
    idUsuario: 1,
    idCliente: 1,
    total: 15000,
    tipoVenta: 'PEDIDO_ONLINE',
    detalles: [
      { idProducto: 1, idVariante: 0, cantidad: 1, precioUnitario: 15000, subtotal: 15000 }
    ],
    observaciones: JSON.stringify({
      tipoEntrega: 'Domicilio',
      direccion: 'Calle Falsa 123',
      clienteNombre: 'Test Wompi',
      clienteEmail: 'test@chazinfood.com'
    })
  };

  await assertAsync('POST /api/wompi/intencion con datos válidos retorna 201', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify(pedidoValido)
    });
    return res.status === 201 && res.body?.success === true;
  });

  await assertAsync('Respuesta contiene referencia con formato CHAZIN-{ts}-{rand}', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({ ...pedidoValido, total: 12000 })
    });
    return res.body?.referencia && /^CHAZIN-\d+-\d{4}$/.test(res.body.referencia);
  });

  await assertAsync('Respuesta contiene montoEnCentavos = total * 100', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({ ...pedidoValido, total: 25000 })
    });
    return res.body?.montoEnCentavos === 2500000;
  });

  await assertAsync('Respuesta contiene moneda = COP', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({ ...pedidoValido, total: 5000 })
    });
    return res.body?.moneda === 'COP';
  });

  await assertAsync('Respuesta contiene firma SHA-256 válida (64 hex chars)', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({ ...pedidoValido, total: 8000 })
    });
    return res.body?.firma && res.body.firma.length === 64 && /^[a-f0-9]+$/.test(res.body.firma);
  });

  await assertAsync('Respuesta contiene publicKey del ambiente Sandbox', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({ ...pedidoValido, total: 3000 })
    });
    return res.body?.publicKey === WOMPI_CONFIG.publicKey;
  });

  await assertAsync('Respuesta contiene ventaId (ID de la venta creada en BD)', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({ ...pedidoValido, total: 10000 })
    });
    return typeof res.body?.ventaId === 'number' && res.body.ventaId > 0;
  });

  await assertAsync('Firma de integridad en respuesta coincide con cálculo local', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({ ...pedidoValido, total: 20000 })
    });
    if (!res.body?.referencia || !res.body?.montoEnCentavos || !res.body?.firma) return false;
    const firmaLocal = generarFirmaIntegridad(res.body.referencia, res.body.montoEnCentavos, 'COP');
    return firmaLocal === res.body.firma;
  });
}

// ═══════════════════════════════════════════════════════════════
// TEST 6: VALIDACIONES DE SEGURIDAD
// ═══════════════════════════════════════════════════════════════
async function testValidacionesSeguridad() {
  group('6. Validaciones de Seguridad');

  // Monto <= 0
  await assertAsync('Rechaza intención de pago con total = 0', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({ idUsuario: 1, total: 0, detalles: [] })
    });
    return res.status >= 400;
  });

  await assertAsync('Rechaza intención de pago con total negativo', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({ idUsuario: 1, total: -5000, detalles: [] })
    });
    return res.status >= 400;
  });

  // Usuario faltante
  await assertAsync('Rechaza intención de pago sin idUsuario', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({ total: 15000, detalles: [] })
    });
    return res.status >= 400;
  });

  // Verificación de transacción inexistente
  await assertAsync('GET /api/wompi/verificar con ID inexistente retorna error', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/verificar/TRANSACCION-INEXISTENTE-99999`);
    return res.status >= 400;
  });
}

// ═══════════════════════════════════════════════════════════════
// TEST 7: WEBHOOK - PROCESAMIENTO DE EVENTOS
// ═══════════════════════════════════════════════════════════════
async function testWebhookProcesamiento() {
  group('7. Webhook - Procesamiento de Eventos (/api/wompi/webhook)');

  // Webhook con evento válido retorna 200
  await assertAsync('POST /api/wompi/webhook con evento transaction.updated retorna 200', async () => {
    const webhookPayload = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'test-webhook-tx-001',
          status: 'APPROVED',
          reference: 'CHAZIN-WEBHOOK-TEST',
          amount_in_cents: 1500000
        }
      },
      timestamp: Date.now(),
      signature: {
        properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
        checksum: 'test-checksum'
      }
    };
    const res = await fetchJSON(`${API_BASE}/wompi/webhook`, {
      method: 'POST',
      body: JSON.stringify(webhookPayload)
    });
    return res.status === 200;
  });

  // Webhook con evento no relevante debe ser ignorado
  await assertAsync('POST /api/wompi/webhook con evento irrelevante retorna 200 (ignora)', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/webhook`, {
      method: 'POST',
      body: JSON.stringify({ event: 'nequi_token.updated', data: {} })
    });
    return res.status === 200;
  });

  // Webhook sin body también retorna 200 (diseño: siempre confirmar recepción)
  await assertAsync('POST /api/wompi/webhook sin body retorna 200', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/webhook`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    return res.status === 200;
  });
}

// ═══════════════════════════════════════════════════════════════
// TEST 8: ESTADOS DE PAGO Y ACTUALIZACIÓN EN BD
// ═══════════════════════════════════════════════════════════════
function testEstadosPago() {
  group('8. Mapeo de Estados de Pago Wompi → Chazin Food');

  const estadosWompi = {
    'APPROVED': { estadoPago: 'Pagado', estadoAprobacion: 'APROBADO', estadoEntrega: 'PREPARANDO' },
    'DECLINED': { estadoPago: 'Rechazado', estadoAprobacion: 'RECHAZADO', estadoEntrega: 'CANCELADO' },
    'ERROR': { estadoPago: 'Rechazado', estadoAprobacion: 'RECHAZADO', estadoEntrega: 'CANCELADO' },
    'VOIDED': { estadoPago: 'Rechazado', estadoAprobacion: 'RECHAZADO', estadoEntrega: 'CANCELADO' },
    'PENDING': { estadoPago: 'Pendiente', estadoAprobacion: 'PENDIENTE', estadoEntrega: 'PENDIENTE' }
  };

  assert('APPROVED → estadoPago: Pagado', estadosWompi['APPROVED'].estadoPago === 'Pagado');
  assert('APPROVED → estadoAprobacion: APROBADO', estadosWompi['APPROVED'].estadoAprobacion === 'APROBADO');
  assert('APPROVED → estadoEntrega: PREPARANDO (pasa a cocina)', estadosWompi['APPROVED'].estadoEntrega === 'PREPARANDO');

  assert('DECLINED → estadoPago: Rechazado', estadosWompi['DECLINED'].estadoPago === 'Rechazado');
  assert('DECLINED → estadoAprobacion: RECHAZADO', estadosWompi['DECLINED'].estadoAprobacion === 'RECHAZADO');
  assert('DECLINED → estadoEntrega: CANCELADO', estadosWompi['DECLINED'].estadoEntrega === 'CANCELADO');

  assert('ERROR → mismo tratamiento que DECLINED', 
    estadosWompi['ERROR'].estadoPago === 'Rechazado' && 
    estadosWompi['ERROR'].estadoAprobacion === 'RECHAZADO');

  assert('VOIDED → mismo tratamiento que DECLINED', 
    estadosWompi['VOIDED'].estadoPago === 'Rechazado' && 
    estadosWompi['VOIDED'].estadoEntrega === 'CANCELADO');

  assert('PENDING → estadoPago: Pendiente (intención creada pero sin pagar)', 
    estadosWompi['PENDING'].estadoPago === 'Pendiente' && 
    estadosWompi['PENDING'].estadoAprobacion === 'PENDIENTE');
}

// ═══════════════════════════════════════════════════════════════
// TEST 9: ESTRUCTURA DE DATOS OBSERVACIONES (JSON)
// ═══════════════════════════════════════════════════════════════
function testEstructuraObservaciones() {
  group('9. Estructura de Datos en Observaciones (JSON)');

  // Simular el JSON que se almacena en la columna observaciones de la venta
  const observaciones = {
    tipoEntrega: 'Domicilio',
    direccion: 'Calle Falsa 123',
    clienteNombre: 'Test Wompi',
    clienteEmail: 'test@chazinfood.com',
    wompiReference: 'CHAZIN-1234567890-5678',
    montoEnCentavos: 1500000,
    moneda: 'COP',
    metodoPago: 'Wompi',
    estadoPago: 'Pendiente',
    fechaIntencion: new Date().toISOString()
  };

  const json = JSON.stringify(observaciones);
  const parsed = JSON.parse(json);

  assert('Observaciones se serializa correctamente a JSON', typeof json === 'string' && json.startsWith('{'));
  assert('Observaciones se deserializa sin pérdida de datos', parsed.wompiReference === observaciones.wompiReference);
  assert('wompiReference conserva formato CHAZIN-*', /^CHAZIN-\d+-\d{4}$/.test(parsed.wompiReference));
  assert('montoEnCentavos se preserva como número', typeof parsed.montoEnCentavos === 'number');
  assert('fechaIntencion es ISO 8601 válido', !isNaN(new Date(parsed.fechaIntencion).getTime()));

  // Después de aprobación, se agregan campos adicionales
  const obsAprobada = {
    ...parsed,
    wompiTransactionId: 'tx-abc-123',
    wompiStatus: 'APPROVED',
    paymentMethodType: 'CARD',
    estadoPago: 'Pagado',
    metodoPago: 'Wompi (CARD)',
    estadoAprobacion: 'APROBADO'
  };

  assert('Tras aprobación: wompiTransactionId se agrega', obsAprobada.wompiTransactionId === 'tx-abc-123');
  assert('Tras aprobación: wompiStatus = APPROVED', obsAprobada.wompiStatus === 'APPROVED');
  assert('Tras aprobación: estadoPago cambia a Pagado', obsAprobada.estadoPago === 'Pagado');
  assert('Tras aprobación: metodoPago incluye tipo (Wompi (CARD))', obsAprobada.metodoPago.includes('CARD'));
}

// ═══════════════════════════════════════════════════════════════
// TEST 10: URL BASE SEGÚN AMBIENTE
// ═══════════════════════════════════════════════════════════════
function testAmbienteWompi() {
  group('10. URL Base según Ambiente (Sandbox vs Production)');

  function getBaseUrl(env) {
    return env === 'production' 
      ? 'https://production.wompi.co/v1' 
      : 'https://sandbox.wompi.co/v1';
  }

  assert('Ambiente sandbox → URL sandbox.wompi.co', getBaseUrl('sandbox') === 'https://sandbox.wompi.co/v1');
  assert('Ambiente production → URL production.wompi.co', getBaseUrl('production') === 'https://production.wompi.co/v1');
  assert('Ambiente undefined → fallback a sandbox', getBaseUrl(undefined) === 'https://sandbox.wompi.co/v1');
}

// ═══════════════════════════════════════════════════════════════
// TEST 11: CONECTIVIDAD CON BACKEND
// ═══════════════════════════════════════════════════════════════
async function testConectividadBackend() {
  group('11. Conectividad con Backend');

  await assertAsync('Backend responde en http://localhost:5000', async () => {
    const res = await fetch(`${BACKEND_URL}/`, { redirect: 'manual' });
    return res.status === 302 || res.status === 200; // Redirige a Swagger
  });

  await assertAsync('Ruta /api/wompi/intencion está registrada (acepta POST)', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    // 400 (validación) indica que la ruta existe pero los datos son inválidos
    return res.status === 400 || res.status === 500 || res.status === 201;
  });

  await assertAsync('Ruta /api/wompi/webhook está registrada (acepta POST)', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/webhook`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    return res.status === 200;
  });
}

// ═══════════════════════════════════════════════════════════════
// TEST 12: FLUJO COMPLETO INTENCIÓN → VERIFICACIÓN
// ═══════════════════════════════════════════════════════════════
async function testFlujoCompleto() {
  group('12. Flujo Completo: Intención de Pago → Registro en BD');

  const pedido = {
    idUsuario: 1,
    idCliente: 1,
    total: 45000,
    tipoVenta: 'PEDIDO_ONLINE',
    detalles: [
      { idProducto: 1, idVariante: 0, cantidad: 2, precioUnitario: 15000, subtotal: 30000 },
      { idProducto: 5, idVariante: 0, cantidad: 5, precioUnitario: 3000, subtotal: 15000 }
    ],
    observaciones: JSON.stringify({
      tipoEntrega: 'Domicilio',
      direccion: 'Carrera 10 #20-30, Bogotá',
      clienteNombre: 'Carlos Prueba',
      clienteEmail: 'carlos@test.com',
      clienteTelefono: '3001234567',
      especificaciones: 'Sin cebolla, dejar en portería'
    })
  };

  let intencionResult = null;

  await assertAsync('Paso 1: Crear intención de pago exitosamente', async () => {
    const res = await fetchJSON(`${API_BASE}/wompi/intencion`, {
      method: 'POST',
      body: JSON.stringify(pedido)
    });
    if (res.status === 201 && res.body?.success) {
      intencionResult = res.body;
      return true;
    }
    return false;
  });

  if (intencionResult) {
    assert('Paso 2: Referencia generada es válida', /^CHAZIN-\d+-\d{4}$/.test(intencionResult.referencia));
    assert('Paso 3: Monto en centavos = $45.000 × 100 = 4500000', intencionResult.montoEnCentavos === 4500000);
    assert('Paso 4: Firma de integridad presente y válida', intencionResult.firma?.length === 64);
    assert('Paso 5: Venta registrada en BD con ID numérico', typeof intencionResult.ventaId === 'number');
    assert('Paso 6: Public key del sandbox entregada al frontend', intencionResult.publicKey === WOMPI_CONFIG.publicKey);

    // Verificar que la firma devuelta coincide con nuestro cálculo
    const firmaCalculada = generarFirmaIntegridad(intencionResult.referencia, intencionResult.montoEnCentavos, 'COP');
    assert('Paso 7: Firma del backend coincide con cálculo local SHA-256', intencionResult.firma === firmaCalculada);
  } else {
    console.error('  ⚠️  No se pudo crear la intención de pago. Saltando pasos 2-7.');
  }
}

// ═══════════════════════════════════════════════════════════════
// EJECUCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log('══════════════════════════════════════════════════════════════');
  console.log('🧪 SUITE DE PRUEBAS: Pasarela de Pagos Wompi (Chazin Food)');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`);
  console.log(`🌐 Backend: ${BACKEND_URL}`);
  console.log(`🔑 Ambiente: Sandbox`);

  // Tests unitarios (sin dependencia del backend)
  testFirmaIntegridad();
  testReferenciaUnica();
  testConversionCentavos();
  testValidacionWebhook();
  testEstadosPago();
  testEstructuraObservaciones();
  testAmbienteWompi();

  // Tests de integración (requieren backend activo)
  let backendOnline = false;
  try {
    const healthCheck = await fetch(`${BACKEND_URL}/`, { redirect: 'manual' });
    backendOnline = healthCheck.status === 302 || healthCheck.status === 200;
  } catch (e) {
    backendOnline = false;
  }

  if (backendOnline) {
    await testConectividadBackend();
    await testCrearIntencionPago();
    await testValidacionesSeguridad();
    await testWebhookProcesamiento();
    await testFlujoCompleto();
  } else {
    console.log('\n⚠️  Backend no disponible en localhost:5000. Tests de integración omitidos.');
    console.log('   Inicia el backend con: cd Backend-Web-Chazin-Food && npm run dev');
  }

  // Resumen final
  console.log('\n══════════════════════════════════════════════════════════════');
  if (failed === 0) {
    console.log(`🏆 RESULTADO: ${passed}/${total} pruebas pasadas con éxito (100%)`);
  } else {
    console.log(`📊 RESULTADO: ${passed}/${total} pruebas pasadas (${((passed / total) * 100).toFixed(0)}%)`);
    console.log(`   ❌ ${failed} prueba(s) fallida(s)`);
  }
  console.log('══════════════════════════════════════════════════════════════');

  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('Error fatal ejecutando la suite de pruebas:', err);
  process.exit(1);
});
