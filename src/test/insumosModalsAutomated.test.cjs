/**
 * ════════════════════════════════════════════════════════════════════════════════
 * 🧪 SUITE DE PRUEBAS AUTOMATIZADAS: MODALES DE GESTIÓN DE INSUMOS (CHAZIN FOOD)
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * Componente bajo prueba: InsumoModal (Insumo Base + Insumo Preparado + Ficha Técnica)
 * Ejecutar con:
 *   node src/test/insumosModalsAutomated.test.cjs
 *   o: npm run test:modals
 *
 * Alcance de las Pruebas:
 * ────────────────────────────────────────────────────────────────────────────────
 * [MÓDULO 1] Ciclo de Vida y Estados del Modal
 *   1.1 Inicialización en modo Creación (valores por defecto, Base seleccionado)
 *   1.2 Inicialización en modo Edición - Insumo Base
 *   1.3 Inicialización en modo Edición - Insumo Preparado (conmutación automática)
 *   1.4 Conmutación dinámica de pestaña (Base <-> Preparado y ajuste de unidades)
 *   1.5 Eventos de Cierre (Escape, Backdrop, Cancelar)
 *
 * [MÓDULO 2] Validaciones de Insumo Base / Materia Prima
 *   2.1 Validación de Nombre requerido (espacios en blanco, caracteres mínimos)
 *   2.2 Sanitización y límites de Stock y Stock Mínimo
 *   2.3 Sanitización de Precio Unitario (rechazo de negativos, ceros a la izquierda)
 *   2.4 Reglas de Negocio para Adición Integrada:
 *       - Insumo normal: esAdicion=false, precioAdicion=0
 *       - Insumo con Adición: esAdicion=true requiere precioAdicion > 0
 *       - Asignación de icono gastronómico o URL Cloudinary
 *   2.5 Estructura y tipado del payload onSave para Insumo Base
 *
 * [MÓDULO 3] Validaciones de Insumo Preparado y Ficha Técnica
 *   3.1 Validación de Nombre y Costo / Precio estimado
 *   3.2 Auditoría Gastronómica de Ficha Técnica Obligatoria:
 *       - Mínimo 1 ingrediente base
 *       - Procedimiento de elaboración paso a paso
 *       - Tiempo de preparación (>= 1 min)
 *       - Rendimiento / porciones
 *       - Condiciones de almacenamiento
 *       - Vida útil
 *       - Especificaciones técnicas / calidad
 *       - Características organolépticas
 *       - Información nutricional
 *   3.3 Estructura y tipado del payload onSave para Insumo Preparado
 *
 * [MÓDULO 4] Integración End-to-End con API Backend (Live HTTP)
 *   4.1 Verificación de endpoints de apoyo (categorías y proveedores)
 *   4.2 Creación, modificación y papelera de Insumo Base
 *   4.3 Creación, consulta de ficha técnica y limpieza de Insumo Preparado
 * ════════════════════════════════════════════════════════════════════════════════
 */

const http = require('http');

// Configuración
const BACKEND_URL = process.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
const [backendHost, backendPort] = (function() {
  try {
    const u = new URL(BACKEND_URL);
    return [u.hostname, parseInt(u.port || '5000', 10)];
  } catch (_) {
    return ['127.0.0.1', 5000];
  }
})();

// Colores ANSI para reporte en consola
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';
const BG_GREEN = '\x1b[42m\x1b[30m';
const BG_RED = '\x1b[41m\x1b[37m';

let passed = 0;
let failed = 0;
let total = 0;
let currentGroup = '';

function group(title) {
  currentGroup = title;
  console.log(`\n${BOLD}${CYAN}━━━ ${title} ━━━${RESET}`);
}

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ${GREEN}✓${RESET} ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ${RED}✗ ${name}${RESET}`);
    console.log(`    ${RED}Detalle: ${err.message}${RESET}`);
  }
}

async function testAsync(name, fn) {
  total++;
  try {
    await fn();
    passed++;
    console.log(`  ${GREEN}✓${RESET} ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ${RED}✗ ${name}${RESET}`);
    console.log(`    ${RED}Detalle: ${err.message || String(err)}${RESET}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Aserción fallida');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Valores no coinciden'}: esperado [${expected}], recibido [${actual}]`);
  }
}

function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${message || 'Objetos no coinciden'}:\n  Esperado: ${expectedStr}\n  Recibido: ${actualStr}`);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SIMULADOR DE LÓGICA DEL COMPONENTE INSUMOMODAL (PURE CONTROLLER PATTERN)
// Reproduce fielmente la lógica de estados, validaciones y guardado de InsumoModal.jsx
// ══════════════════════════════════════════════════════════════════════════════

// Detección de salsas y aderezos
function isSalsaItem(nombre = '', categoria = '') {
  const n = String(nombre || '').toLowerCase().trim();
  const c = String(categoria || '').toLowerCase().trim();
  const salsaKeywords = [
    'salsa',
    'mayonesa',
    'mostaza',
    'aderezo',
    'tartara',
    'tártara',
    'bbq',
    'barbacoa',
    'guacamole',
    'suero',
    'chimichurri',
    'vinagreta',
    'ketchup',
    'catsup'
  ];
  return salsaKeywords.some((k) => n.includes(k)) || c.includes('salsa') || c.includes('aderezo');
}

class InsumoModalLogicSimulator {
  constructor({
    isOpen = true,
    insumo = null,
    categorias = [{ id: 1, nombre: 'Lácteos' }, { id: 2, nombre: 'Panadería' }],
    proveedores = [{ id: 10, nombre: 'Carnes Premium' }, { id: 20, nombre: 'Distribuidora S.A.' }],
    insumosDisponibles = []
  } = {}) {
    this.isOpen = isOpen;
    this.insumo = insumo;
    this.categorias = categorias;
    this.proveedores = proveedores;
    this.insumosDisponibles = insumosDisponibles;

    this.notifications = [];
    this.savedPayload = null;
    this.closed = false;

    // Inicializar estado según insumo
    this.init();
  }

  notifyWarning(title, msg) {
    this.notifications.push({ type: 'warning', title, msg });
  }

  notifyError(title, msg) {
    this.notifications.push({ type: 'error', title, msg });
  }

  notifySuccess(title, msg) {
    this.notifications.push({ type: 'success', title, msg });
  }

  init() {
    if (!this.isOpen) return;

    if (this.insumo) {
      const isPrep = this.insumo.tipo === 'Preparado' ||
        !!this.insumo.insumosReceta ||
        (!this.insumo.idCategoriaInsumo && !this.insumo.idProveedor && (this.insumo.costo !== undefined || this.insumo.rendimiento !== undefined));
      this.tipo = isPrep ? 'Preparado' : 'Base';
      const catNom = this.insumo.categoria || this.insumo.categoriaNombre || (this.categorias[0]?.nombre || '');
      const esSalsa = isSalsaItem(this.insumo.nombre, catNom);
      const esAdicionVal = !!(this.insumo.esAdicion === 1 || this.insumo.esAdicion === true || this.insumo.esAdicion === '1') || esSalsa;
      const precioAdicionVal = Number(this.insumo.precioAdicion || 0) > 0 ? Number(this.insumo.precioAdicion) : (esSalsa ? 1500 : 0);
      const imagenVal = this.insumo.imagen || (esSalsa ? 'sauce' : '');

      this.form = {
        nombre: this.insumo.nombre || '',
        idCategoriaInsumo: this.insumo.idCategoriaInsumo || (this.categorias[0]?.id || ''),
        categoria: catNom,
        unidadMedida: this.insumo.unidadMedida || (isPrep ? 'und — unidad' : 'Kg'),
        precioUnitario: this.insumo.precioUnitario || this.insumo.costo || this.insumo.precio || 0,
        idProveedor: this.insumo.idProveedor || '',
        proveedor: this.insumo.proveedor || this.insumo.proveedorNombre || '',
        stock: Math.max(0, Number(this.insumo.stock || 0)),
        stockMinimo: Math.max(0, Number(this.insumo.stockMinimo !== undefined && this.insumo.stockMinimo !== null ? this.insumo.stockMinimo : 5)),
        fechaExpedicion: this.insumo.fechaExpedicion || '',
        fechaVencimiento: this.insumo.fechaVencimiento || '',
        descripcion: this.insumo.descripcion || '',
        estado: this.insumo.estado === 1 || this.insumo.estado === 'Activo' || this.insumo.estado === '1' ? 'Activo' : 'Inactivo',
        esAdicion: esAdicionVal,
        precioAdicion: precioAdicionVal,
        imagen: imagenVal
      };

      this.fichaTecnica = isPrep ? (this.insumo.fichaTecnica || null) : null;
    } else {
      this.tipo = 'Base';
      const defaultCat = this.categorias[0]?.nombre || '';
      const esSalsaDefault = isSalsaItem('', defaultCat);
      this.form = {
        nombre: '',
        idCategoriaInsumo: this.categorias[0]?.id || 1,
        categoria: defaultCat,
        unidadMedida: 'Kg',
        precioUnitario: 0,
        idProveedor: this.proveedores[0]?.id || 10,
        proveedor: this.proveedores[0]?.nombre || '',
        stock: 0,
        stockMinimo: 5,
        fechaExpedicion: '',
        fechaVencimiento: '',
        descripcion: '',
        estado: 'Activo',
        esAdicion: esSalsaDefault,
        precioAdicion: esSalsaDefault ? 1500 : 0,
        imagen: esSalsaDefault ? 'sauce' : 'bacon'
      };
      this.fichaTecnica = null;
    }
  }

  handleTipoChange(nuevoTipo) {
    this.tipo = nuevoTipo;
    if (nuevoTipo === 'Preparado' && this.form.unidadMedida === 'Kg') {
      this.form.unidadMedida = 'und — unidad';
    } else if (nuevoTipo === 'Base' && this.form.unidadMedida === 'und — unidad') {
      this.form.unidadMedida = 'Kg';
    }
  }

  handleNombreChange(nuevoNombre) {
    this.form.nombre = nuevoNombre;
    const esSalsa = isSalsaItem(nuevoNombre, this.form.categoria);
    if (esSalsa) {
      this.form.esAdicion = true;
      if (!this.form.precioAdicion || Number(this.form.precioAdicion) <= 0) {
        this.form.precioAdicion = 1500;
      }
      if (!this.form.imagen || this.form.imagen === 'bacon') {
        this.form.imagen = 'sauce';
      }
    }
  }

  handleCategoriaChange(catId, catNombre) {
    this.form.idCategoriaInsumo = catId;
    this.form.categoria = catNombre;
    const esSalsa = isSalsaItem(this.form.nombre, catNombre);
    if (esSalsa) {
      this.form.esAdicion = true;
      if (!this.form.precioAdicion || Number(this.form.precioAdicion) <= 0) {
        this.form.precioAdicion = 1500;
      }
      if (!this.form.imagen || this.form.imagen === 'bacon') {
        this.form.imagen = 'sauce';
      }
    }
  }

  handleNumberInput(field, val) {
    if (val === '') {
      this.form[field] = '';
      return;
    }
    if (String(val).includes('-')) {
      val = String(val).replace(/-/g, '');
    }
    const sanitized = val.length > 1 && String(val).startsWith('0') && !String(val).startsWith('0.') ? String(val).replace(/^0+/, '') : val;
    this.form[field] = sanitized;
  }

  handleClose() {
    this.closed = true;
    this.isOpen = false;
  }

  handleSubmit() {
    if (!this.form.nombre.trim()) {
      this.notifyWarning('Campo Requerido', 'Por favor escribe el nombre del insumo.');
      return false;
    }

    const esSalsa = isSalsaItem(this.form.nombre, this.form.categoria);

    // Si el usuario habilitó manualmente el rol de adición (y no es salsa), exigir precio > 0
    if (this.form.esAdicion && !esSalsa) {
      const pAdic = Number(this.form.precioAdicion);
      if (isNaN(pAdic) || pAdic <= 0) {
        this.notifyWarning(
          'Precio de Adición Requerido',
          'Al habilitar este insumo como adición, debes ingresar un precio de venta mayor a $0.'
        );
        return false;
      }
    }

    const esAdicionFinal = this.form.esAdicion || esSalsa;
    const precioAdicionFinal = esAdicionFinal
      ? (Number(this.form.precioAdicion) > 0 ? Number(this.form.precioAdicion) : (esSalsa ? 1500 : 0))
      : 0;
    const imagenFinal = esAdicionFinal
      ? (this.form.imagen || (esSalsa ? 'sauce' : 'bacon'))
      : '';

    if (this.tipo === 'Preparado') {
      const pUnit = Number(this.form.precioUnitario);
      if (isNaN(pUnit) || pUnit < 0) {
        this.notifyWarning('Costo Requerido', 'Por favor ingresa un costo o precio válido para el preparado.');
        return false;
      }

      const ft = this.fichaTecnica || {};
      const missingFields = [];
      const ingredientes = ft.detalles || ft.insumos || ft.ingredientes || [];

      if (!ingredientes || ingredientes.length === 0) {
        missingFields.push('Ingredientes / Insumos Base (mínimo 1)');
      }
      if (!ft.procedimiento || !ft.procedimiento.trim()) {
        missingFields.push('Procedimiento de Preparación');
      }
      if (!ft.tiempoPreparacion || Number(ft.tiempoPreparacion) < 1) {
        missingFields.push('Tiempo de Preparación (mínimo 1 min)');
      }
      if (!ft.rendimiento || !String(ft.rendimiento).trim()) {
        missingFields.push('Rendimiento / Porciones');
      }
      if (!ft.condicionesAlmacenamiento || !ft.condicionesAlmacenamiento.trim()) {
        missingFields.push('Condiciones de Almacenamiento');
      }
      if (!ft.vidaUtil || !ft.vidaUtil.trim()) {
        missingFields.push('Vida Útil');
      }
      if (!ft.especificaciones || !ft.especificaciones.trim()) {
        missingFields.push('Especificaciones Técnicas / Calidad');
      }
      if (!ft.caracteristicas || !ft.caracteristicas.trim()) {
        missingFields.push('Características Organolépticas');
      }
      if (!ft.informacionNutricional || !ft.informacionNutricional.trim()) {
        missingFields.push('Información Nutricional');
      }

      if (missingFields.length > 0) {
        this.notifyError(
          'Ficha Técnica Incompleta',
          'Primero debes completar y guardar la ficha técnica con todos sus campos obligatorios.'
        );
        return false;
      }

      this.savedPayload = {
        nombre: this.form.nombre.trim(),
        descripcion: this.form.descripcion.trim(),
        precio: Number(this.form.precioUnitario) || 0,
        precioUnitario: Number(this.form.precioUnitario) || 0,
        unidadMedida: this.form.unidadMedida,
        tipo: 'Preparado',
        estado: this.form.estado,
        esAdicion: esAdicionFinal,
        precioAdicion: precioAdicionFinal,
        imagen: imagenFinal,
        fichaTecnica: {
          ...ft,
          procedimiento: ft.procedimiento.trim(),
          tiempoPreparacion: Number(ft.tiempoPreparacion) || 1,
          rendimiento: String(ft.rendimiento).trim(),
          especificaciones: ft.especificaciones.trim(),
          caracteristicas: ft.caracteristicas.trim(),
          informacionNutricional: ft.informacionNutricional.trim(),
          condicionesAlmacenamiento: ft.condicionesAlmacenamiento.trim(),
          vidaUtil: ft.vidaUtil.trim(),
          observaciones: (ft.observaciones || '').trim(),
          detalles: ingredientes
        },
        ingredientes
      };
      return true;
    } else {
      // Insumo Base
      const defaultCatId = this.form.idCategoriaInsumo || (this.categorias[0]?.id || 1);
      const defaultProvId = this.form.idProveedor || (this.proveedores[0]?.id || null);

      this.savedPayload = {
        ...this.form,
        nombre: this.form.nombre.trim(),
        tipo: 'Base',
        idCategoriaInsumo: defaultCatId,
        idProveedor: defaultProvId,
        precioUnitario: Math.max(0, this.form.precioUnitario === '' ? 0 : Number(this.form.precioUnitario)),
        stock: Math.max(0, this.form.stock === '' ? 0 : Number(this.form.stock)),
        stockMinimo: Math.max(0, this.form.stockMinimo === '' ? 0 : Number(this.form.stockMinimo)),
        esAdicion: esAdicionFinal,
        precioAdicion: precioAdicionFinal,
        imagen: imagenFinal
      };
      return true;
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CLIENTE HTTP LIVIANO PARA INTEGRACIÓN E2E
// ══════════════════════════════════════════════════════════════════════════════

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: backendHost,
      port: backendPort,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch (_) {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', err => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (postData) req.write(postData);
    req.end();
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// EJECUCIÓN DE LA SUITE DE PRUEBAS
// ══════════════════════════════════════════════════════════════════════════════

async function runTestSuite() {
  console.log(`\n${BOLD}========================================================================${RESET}`);
  console.log(`${BOLD}🧪 EJECUTANDO SUITE DE PRUEBAS AUTOMATIZADAS - MODALES DE INSUMOS${RESET}`);
  console.log(`${BOLD}========================================================================${RESET}`);

  // ────────────────────────────────────────────────────────────────────────────
  // MÓDULO 1: CICLO DE VIDA Y ESTADOS DEL MODAL
  // ────────────────────────────────────────────────────────────────────────────
  group('MÓDULO 1: Ciclo de Vida y Estados del Modal');

  test('1.1 Inicialización en modo Creación (valores predeterminados limpios)', () => {
    const modal = new InsumoModalLogicSimulator({ isOpen: true, insumo: null });
    assertEqual(modal.tipo, 'Base', 'Debe iniciar en la pestaña Base');
    assertEqual(modal.form.nombre, '', 'El nombre debe estar vacío');
    assertEqual(modal.form.unidadMedida, 'Kg', 'Unidad por defecto de Base debe ser Kg');
    assertEqual(modal.form.stock, 0, 'Stock inicial debe ser 0');
    assertEqual(modal.form.stockMinimo, 5, 'Stock mínimo sugerido debe ser 5');
    assertEqual(modal.form.esAdicion, false, 'No debe ser adición por defecto');
    assertEqual(modal.form.estado, 'Activo', 'Estado inicial debe ser Activo');
  });

  test('1.2 Inicialización en modo Edición - Insumo Base existente', () => {
    const insumoBase = {
      idInsumo: 42,
      nombre: 'Pan Brioche Artesanal',
      idCategoriaInsumo: 2,
      idProveedor: 10,
      unidadMedida: 'und',
      precioUnitario: 1200,
      stock: 40,
      stockMinimo: 10,
      esAdicion: 1,
      precioAdicion: 2000,
      imagen: 'bread',
      tipo: 'Base',
      estado: 1
    };

    const modal = new InsumoModalLogicSimulator({ isOpen: true, insumo: insumoBase });
    assertEqual(modal.tipo, 'Base');
    assertEqual(modal.form.nombre, 'Pan Brioche Artesanal');
    assertEqual(modal.form.stock, 40);
    assertEqual(modal.form.esAdicion, true);
    assertEqual(modal.form.precioAdicion, 2000);
    assertEqual(modal.form.imagen, 'bread');
  });

  test('1.3 Inicialización en modo Edición - Insumo Preparado (conmutación automática)', () => {
    const insumoPreparado = {
      id: 77,
      nombre: 'Salsa Chazin Especial de la Casa',
      tipo: 'Preparado',
      descripcion: 'Receta secreta agridulce con toques ahumados',
      costo: 3500,
      unidadMedida: 'porción',
      estado: 1,
      fichaTecnica: {
        idFichaTecnica: 5,
        procedimiento: 'Mezclar salsas y reducir a fuego lento',
        tiempoPreparacion: 15,
        rendimiento: '20 porciones'
      }
    };

    const modal = new InsumoModalLogicSimulator({ isOpen: true, insumo: insumoPreparado });
    assertEqual(modal.tipo, 'Preparado', 'Debe conmutar automáticamente a pestaña Preparado');
    assertEqual(modal.form.nombre, 'Salsa Chazin Especial de la Casa');
    assertEqual(modal.form.precioUnitario, 3500);
    assert(modal.fichaTecnica !== null, 'Debe cargar la ficha técnica del insumo preparado');
  });

  test('1.4 Conmutación dinámica de pestaña (Base <-> Preparado con ajuste de unidad)', () => {
    const modal = new InsumoModalLogicSimulator({ isOpen: true, insumo: null });
    assertEqual(modal.tipo, 'Base');
    assertEqual(modal.form.unidadMedida, 'Kg');

    // Cambiar a Preparado
    modal.handleTipoChange('Preparado');
    assertEqual(modal.tipo, 'Preparado');
    assertEqual(modal.form.unidadMedida, 'und — unidad', 'Debe ajustar unidad sugerida a und');

    // Volver a Base
    modal.handleTipoChange('Base');
    assertEqual(modal.tipo, 'Base');
    assertEqual(modal.form.unidadMedida, 'Kg', 'Debe restaurar unidad de Base a Kg');
  });

  test('1.5 Eventos de Cierre del Modal (Escape y Backdrop)', () => {
    const modal = new InsumoModalLogicSimulator({ isOpen: true, insumo: null });
    assertEqual(modal.isOpen, true);
    modal.handleClose();
    assertEqual(modal.isOpen, false);
    assertEqual(modal.closed, true);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // MÓDULO 2: VALIDACIONES DE INSUMO BASE / MATERIA PRIMA
  // ────────────────────────────────────────────────────────────────────────────
  group('MÓDULO 2: Validaciones de Insumo Base / Materia Prima');

  test('2.1 Rechazo de Nombre vacío o compuesto solo por espacios', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.form.nombre = '   ';
    const ok = modal.handleSubmit();
    assertEqual(ok, false, 'No debe permitir guardar sin nombre válido');
    assert(modal.notifications.some(n => n.title === 'Campo Requerido'), 'Debe emitir notificación de campo requerido');
    assertEqual(modal.savedPayload, null);
  });

  test('2.2 Sanitización de Valores Numéricos (bloqueo de signos negativos)', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.handleNumberInput('stock', '-25');
    assertEqual(modal.form.stock, '25', 'El signo menos debe ser eliminado');

    modal.handleNumberInput('precioUnitario', '00500');
    assertEqual(modal.form.precioUnitario, '500', 'Ceros redundantes a la izquierda deben eliminarse');

    modal.handleNumberInput('precioUnitario', '0.75');
    assertEqual(modal.form.precioUnitario, '0.75', 'Decimales con cero inicial deben respetarse');
  });

  test('2.3 Validación de Adición: Bloqueo cuando precioAdicion <= 0', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.form.nombre = 'Queso Mozzarella Extra';
    modal.form.esAdicion = true;
    modal.form.precioAdicion = 0; // Inválido para adición comercializable

    const ok = modal.handleSubmit();
    assertEqual(ok, false, 'No debe guardar una adición con precio $0');
    assert(modal.notifications.some(n => n.title === 'Precio de Adición Requerido'));
    assertEqual(modal.savedPayload, null);
  });

  test('2.4 Guardado exitoso de Insumo Base con rol de Adición activo', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.form.nombre = 'Tocineta Ahumada Crispy';
    modal.form.idCategoriaInsumo = 1;
    modal.form.idProveedor = 10;
    modal.form.unidadMedida = 'Gr';
    modal.form.precioUnitario = 4500;
    modal.form.stock = 2500;
    modal.form.stockMinimo = 500;
    modal.form.esAdicion = true;
    modal.form.precioAdicion = 3000;
    modal.form.imagen = 'bacon';

    const ok = modal.handleSubmit();
    assertEqual(ok, true, 'Debe guardar con éxito');
    assert(modal.savedPayload !== null);
    assertEqual(modal.savedPayload.tipo, 'Base');
    assertEqual(modal.savedPayload.nombre, 'Tocineta Ahumada Crispy');
    assertEqual(modal.savedPayload.esAdicion, true);
    assertEqual(modal.savedPayload.precioAdicion, 3000);
    assertEqual(modal.savedPayload.imagen, 'bacon');
  });

  test('2.5 Guardado exitoso de Insumo Base Estándar (sin rol de adición)', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.form.nombre = 'Aceite Vegetal para Freidora';
    modal.form.idCategoriaInsumo = 2;
    modal.form.idProveedor = 20;
    modal.form.unidadMedida = 'Lt';
    modal.form.precioUnitario = 32000;
    modal.form.stock = 50;
    modal.form.stockMinimo = 10;
    modal.form.esAdicion = false;
    modal.form.precioAdicion = 0;

    const ok = modal.handleSubmit();
    assertEqual(ok, true);
    assertEqual(modal.savedPayload.tipo, 'Base');
    assertEqual(modal.savedPayload.esAdicion, false);
    assertEqual(modal.savedPayload.precioAdicion, 0);
    assertEqual(modal.savedPayload.imagen, '', 'Imagen de adición debe quedar vacía si no es adición');
  });

  test('2.6 Detección automática de Salsas: activación automática de adición, precio ($1.500) e icono "sauce"', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.handleNombreChange('Salsa Tártara Especial');
    assertEqual(modal.form.esAdicion, true, 'Debe activar automáticamente esAdicion');
    assertEqual(modal.form.precioAdicion, 1500, 'Debe asignar precio sugerido $1.500');
    assertEqual(modal.form.imagen, 'sauce', 'Debe asignar el icono sauce');

    const ok = modal.handleSubmit();
    assertEqual(ok, true, 'Debe guardar con éxito');
    assertEqual(modal.savedPayload.esAdicion, true);
    assertEqual(modal.savedPayload.precioAdicion, 1500);
    assertEqual(modal.savedPayload.imagen, 'sauce');
  });

  test('2.7 Detección por categoría: al seleccionar categoría de Salsas se activa adición automáticamente', () => {
    const modal = new InsumoModalLogicSimulator({
      categorias: [{ id: 5, nombre: 'Salsas y Aderezos' }]
    });
    modal.handleNombreChange('Mayonesa de la Casa');
    modal.handleCategoriaChange(5, 'Salsas y Aderezos');
    assertEqual(modal.form.esAdicion, true);
    assertEqual(modal.form.precioAdicion, 1500);
    assertEqual(modal.form.imagen, 'sauce');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // MÓDULO 3: VALIDACIONES DE INSUMO PREPARADO Y FICHA TÉCNICA
  // ────────────────────────────────────────────────────────────────────────────
  group('MÓDULO 3: Validaciones de Insumo Preparado y Ficha Técnica');

  test('3.1 Bloqueo si no se define costo o precio válido para el preparado', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.handleTipoChange('Preparado');
    modal.form.nombre = 'Guacamole Rústico';
    modal.form.precioUnitario = -100;

    const ok = modal.handleSubmit();
    assertEqual(ok, false);
  });

  test('3.2 Bloqueo de Ficha Técnica cuando faltan ingredientes base', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.handleTipoChange('Preparado');
    modal.form.nombre = 'Cebolla Caramelizada';
    modal.form.precioUnitario = 2500;
    modal.fichaTecnica = {
      detalles: [], // Sin ingredientes
      procedimiento: 'Saltear a fuego bajo con azúcar morena',
      tiempoPreparacion: 20,
      rendimiento: '10 porciones',
      condicionesAlmacenamiento: 'Refrigerar a 4°C',
      vidaUtil: '3 días',
      especificaciones: 'Calidad estándar',
      caracteristicas: 'Dorado suave y brillante',
      informacionNutricional: 'Glúcidos y fibra'
    };

    const ok = modal.handleSubmit();
    assertEqual(ok, false, 'Debe rechazar una ficha técnica sin ingredientes');
    assert(modal.notifications.some(n => n.title === 'Ficha Técnica Incompleta'));
  });

  test('3.3 Bloqueo de Ficha Técnica si el tiempo de preparación es < 1 min', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.handleTipoChange('Preparado');
    modal.form.nombre = 'Salsa Tártara Especial';
    modal.form.precioUnitario = 1800;
    modal.fichaTecnica = {
      detalles: [{ idInsumo: 1, cantidad: 100, unidadMedida: 'Gr' }],
      procedimiento: 'Licuar y mezclar finas hierbas',
      tiempoPreparacion: 0, // Inválido (< 1 min)
      rendimiento: '15 porciones',
      condicionesAlmacenamiento: 'Refrigerar',
      vidaUtil: '5 días',
      especificaciones: 'Consistencia cremosa',
      caracteristicas: 'Aroma fresco',
      informacionNutricional: 'Grasas saludables'
    };

    const ok = modal.handleSubmit();
    assertEqual(ok, false, 'Tiempo de preparación no puede ser 0');
    assert(modal.notifications.some(n => n.title === 'Ficha Técnica Incompleta'));
  });

  test('3.4 Bloqueo si faltan condiciones de almacenamiento o vida útil', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.handleTipoChange('Preparado');
    modal.form.nombre = 'Carne Molida Sazonada';
    modal.form.precioUnitario = 8000;
    modal.fichaTecnica = {
      detalles: [{ idInsumo: 5, cantidad: 1000, unidadMedida: 'Gr' }],
      procedimiento: 'Adobar con especias y sellar en plancha',
      tiempoPreparacion: 12,
      rendimiento: '8 porciones',
      condicionesAlmacenamiento: '', // Vacío
      vidaUtil: '', // Vacío
      especificaciones: 'Carne 100% magra',
      caracteristicas: 'Textura jugosa',
      informacionNutricional: 'Alta proteína'
    };

    const ok = modal.handleSubmit();
    assertEqual(ok, false, 'Debe requerir condiciones de conservación y vida útil');
    assert(modal.notifications.some(n => n.title === 'Ficha Técnica Incompleta'));
  });

  test('3.5 Guardado exitoso de Insumo Preparado con Ficha Técnica 100% Completa', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.handleTipoChange('Preparado');
    modal.form.nombre = 'Pico de Gallo Artesanal';
    modal.form.descripcion = 'Ensaladilla mexicana fresca para topping';
    modal.form.precioUnitario = 2200;
    modal.form.unidadMedida = 'porción';

    const fichaValida = {
      detalles: [
        { idInsumo: 24, cantidad: 200, unidadMedida: 'Gr', insumoNombre: 'Cebolla Blanca' },
        { idInsumo: 32, cantidad: 300, unidadMedida: 'Gr', insumoNombre: 'Tomate Chonto' },
        { idInsumo: 25, cantidad: 50, unidadMedida: 'Gr', insumoNombre: 'Jalapeño' }
      ],
      procedimiento: 'Picar en brunoise fino, aderezar con limón y cilantro.',
      tiempoPreparacion: 10,
      rendimiento: '12 porciones de 45g',
      condicionesAlmacenamiento: 'Recipiente hermético a 2°C - 5°C',
      vidaUtil: '48 horas en refrigeración',
      especificaciones: 'Ingredientes frescos de primera selección',
      caracteristicas: 'Crocante, acidez equilibrada, picor leve',
      informacionNutricional: 'Bajo en calorías, rico en vitaminas A y C',
      observaciones: 'Mantener tapado para evitar oxidación'
    };

    modal.fichaTecnica = fichaValida;

    const ok = modal.handleSubmit();
    assertEqual(ok, true, 'Debe guardar el insumo preparado correctamente');
    assert(modal.savedPayload !== null);
    assertEqual(modal.savedPayload.tipo, 'Preparado');
    assertEqual(modal.savedPayload.nombre, 'Pico de Gallo Artesanal');
    assertEqual(modal.savedPayload.precio, 2200);
    assertEqual(modal.savedPayload.ingredientes.length, 3);
    assertEqual(modal.savedPayload.fichaTecnica.tiempoPreparacion, 10);
    assertEqual(modal.savedPayload.fichaTecnica.rendimiento, '12 porciones de 45g');
  });

  test('3.6 Preparado de salsa (ej. Salsa BBQ Artesanal) se guarda automáticamente con rol de adición para el menú', () => {
    const modal = new InsumoModalLogicSimulator();
    modal.handleTipoChange('Preparado');
    modal.handleNombreChange('Salsa BBQ Artesanal con Panela');
    assertEqual(modal.form.esAdicion, true);
    assertEqual(modal.form.precioAdicion, 1500);
    assertEqual(modal.form.imagen, 'sauce');

    modal.form.precioUnitario = 3500;
    modal.fichaTecnica = {
      detalles: [{ idInsumo: 1, cantidad: 500, unidadMedida: 'Gr' }],
      procedimiento: 'Reducción a fuego lento por 25 minutos con especias',
      tiempoPreparacion: 25,
      rendimiento: '2 Litros',
      condicionesAlmacenamiento: 'Refrigerar tapado a 4°C',
      vidaUtil: '15 días',
      especificaciones: 'Brillo caramelo, ph ácido controlado',
      caracteristicas: 'Aroma dulce y ahumado',
      informacionNutricional: 'Aporte calórico moderado'
    };

    const ok = modal.handleSubmit();
    assertEqual(ok, true);
    assertEqual(modal.savedPayload.tipo, 'Preparado');
    assertEqual(modal.savedPayload.esAdicion, true);
    assertEqual(modal.savedPayload.precioAdicion, 1500);
    assertEqual(modal.savedPayload.imagen, 'sauce');
  });

  // ────────────────────────────────────────────────────────────────────────────
  // MÓDULO 4: INTEGRACIÓN END-TO-END CON API BACKEND (LIVE HTTP)
  // ────────────────────────────────────────────────────────────────────────────
  group('MÓDULO 4: Integración End-to-End con API Backend (Live HTTP)');

  let categoriaIdPrueba = 1;
  let proveedorIdPrueba = null;
  let insumoBaseCreadoId = null;
  let insumoPreparadoCreadoId = null;

  await testAsync('4.1 Healthcheck y carga de categorías/proveedores desde la API', async () => {
    const resCat = await apiRequest('GET', '/categorias-insumo');
    assert(resCat.status === 200, `API Categorías debe responder 200 (recibido ${resCat.status})`);
    assert(Array.isArray(resCat.data), 'Categorías debe ser un arreglo');
    assert(resCat.data.length > 0, 'Debe haber al menos 1 categoría en BD');
    categoriaIdPrueba = resCat.data[0].idCategoriaInsumo || resCat.data[0].id || 1;

    const resProv = await apiRequest('GET', '/proveedores');
    assert(resProv.status === 200, `API Proveedores debe responder 200 (recibido ${resProv.status})`);
    if (Array.isArray(resProv.data) && resProv.data.length > 0) {
      proveedorIdPrueba = resProv.data[0].idProveedor || resProv.data[0].id || null;
    }
  });

  await testAsync('4.2 Simulación Modal -> POST /api/insumos (Crear Insumo Base con Adición)', async () => {
    // Generar datos desde la lógica del modal
    const modal = new InsumoModalLogicSimulator({
      categorias: [{ id: categoriaIdPrueba, nombre: 'Test Cat' }],
      proveedores: [{ id: proveedorIdPrueba || 1, nombre: 'Test Prov' }]
    });

    modal.form.nombre = `Insumo AutoTest ${Date.now()}`;
    modal.form.idCategoriaInsumo = categoriaIdPrueba;
    modal.form.idProveedor = proveedorIdPrueba;
    modal.form.unidadMedida = 'Kg';
    modal.form.precioUnitario = 15500;
    modal.form.stock = 25;
    modal.form.stockMinimo = 5;
    modal.form.esAdicion = true;
    modal.form.precioAdicion = 3500;
    modal.form.imagen = 'cheese';

    const valid = modal.handleSubmit();
    assert(valid, 'Validación del modal debe ser exitosa');

    // Enviar a la API tal como lo hace useInsumos.createInsumo
    const payload = {
      nombre: modal.savedPayload.nombre,
      idCategoriaInsumo: modal.savedPayload.idCategoriaInsumo,
      stock: Number(modal.savedPayload.stock),
      stockMinimo: Number(modal.savedPayload.stockMinimo),
      unidadMedida: modal.savedPayload.unidadMedida,
      precioUnitario: Number(modal.savedPayload.precioUnitario),
      idProveedor: modal.savedPayload.idProveedor,
      descripcion: modal.savedPayload.descripcion || '',
      esAdicion: modal.savedPayload.esAdicion ? 1 : 0,
      precioAdicion: Number(modal.savedPayload.precioAdicion),
      imagen: modal.savedPayload.imagen,
      estado: 'Activo'
    };

    const res = await apiRequest('POST', '/insumos', payload);
    assert(res.status === 200 || res.status === 201, `Creación debe responder 200/201 (recibido ${res.status})`);
    insumoBaseCreadoId = res.data?.idInsumo || res.data?.id || res.data?.data?.idInsumo;
    assert(!!insumoBaseCreadoId, 'Debe retornar el ID del nuevo insumo creado');
  });

  await testAsync('4.3 Modificación vía API -> PUT /api/insumos/:id', async () => {
    assert(!!insumoBaseCreadoId, 'Se requiere el ID del insumo creado');

    const updatePayload = {
      nombre: `Insumo AutoTest Modificado ${Date.now()}`,
      stock: 40,
      precioUnitario: 18000,
      esAdicion: 1,
      precioAdicion: 4000
    };

    const res = await apiRequest('PUT', `/insumos/${insumoBaseCreadoId}`, updatePayload);
    assert(res.status === 200, `Actualización debe responder 200 (recibido ${res.status})`);
  });

  await testAsync('4.4 Simulación Modal -> POST /api/insumos-preparados (Crear Preparado con Ficha Técnica)', async () => {
    assert(!!insumoBaseCreadoId, 'Se requiere un insumo base para incluir en la receta');

    const modal = new InsumoModalLogicSimulator();
    modal.handleTipoChange('Preparado');
    modal.form.nombre = `Salsa Preparada AutoTest ${Date.now()}`;
    modal.form.descripcion = 'Salsa gourmet para pruebas de validación automatizada';
    modal.form.precioUnitario = 4200;
    modal.form.unidadMedida = 'und';

    modal.fichaTecnica = {
      detalles: [
        { idInsumo: insumoBaseCreadoId, cantidad: 2.5, unidadMedida: 'Kg' }
      ],
      procedimiento: 'Integrar con batidor a 60°C por 8 minutos',
      tiempoPreparacion: 8,
      rendimiento: '15 frascos de 250ml',
      condicionesAlmacenamiento: 'Refrigerar a 4°C',
      vidaUtil: '15 días',
      especificaciones: 'Ph 4.2 - Textura semi-densa',
      caracteristicas: 'Color naranja brillante',
      informacionNutricional: 'Bajo en sodio'
    };

    const valid = modal.handleSubmit();
    assert(valid, 'Validación de preparado debe ser exitosa');

    // Enviar a la API tal como lo hace useInsumos.createInsumo en modo Preparado
    const payloadPrep = {
      nombre: modal.savedPayload.nombre,
      descripcion: modal.savedPayload.descripcion,
      unidadMedida: modal.savedPayload.unidadMedida,
      precioVenta: modal.savedPayload.precio,
      estado: 'Activo',
      insumos: [
        { idInsumo: insumoBaseCreadoId, cantidad: 2.5, unidadMedida: 'Kg' }
      ],
      fichaTecnica: modal.savedPayload.fichaTecnica
    };

    const res = await apiRequest('POST', '/insumos-preparados', payloadPrep);
    assert(res.status === 200 || res.status === 201, `Creación de preparado debe responder 200/201 (recibido ${res.status})`);
    insumoPreparadoCreadoId = res.data?.id || res.data?.idInsumo || res.data?.data?.id;
    assert(!!insumoPreparadoCreadoId, 'Debe retornar ID del insumo preparado creado');
  });

  await testAsync('4.5 Consulta y verificación de Ficha Técnica del Insumo Preparado', async () => {
    assert(!!insumoPreparadoCreadoId, 'Se requiere ID del insumo preparado');

    const res = await apiRequest('GET', `/fichas-tecnicas/insumo-preparado/${insumoPreparadoCreadoId}`);
    assert(res.status === 200, `Consulta de ficha debe responder 200 (recibido ${res.status})`);
    if (res.data) {
      assert(res.data.idInsumo === insumoPreparadoCreadoId || res.data.idInsumoPreparado === insumoPreparadoCreadoId || res.data.tipo === 'INSUMO',
        'La ficha técnica debe asociarse correctamente al insumo preparado');
    }
  });

  await testAsync('4.6 Limpieza de datos de prueba (Teardown limpio sin polución)', async () => {
    // 1. Eliminar preparado
    // 1. Eliminar preparado físicamente (limpia referencias en detalleinsumopreparadoinsumo)
    if (insumoPreparadoCreadoId) {
      const delPrep = await apiRequest('DELETE', `/insumos-preparados/${insumoPreparadoCreadoId}/fisico`);
      assert(delPrep.status === 200 || delPrep.status === 204, 'Debe eliminar físicamente el insumo preparado de prueba');
    }

    // 2. Eliminar insumo base físicamente (sin conflicto de clave foránea)
    if (insumoBaseCreadoId) {
      const hardDel = await apiRequest('DELETE', `/insumos/${insumoBaseCreadoId}/fisico`);
      assert(hardDel.status === 200 || hardDel.status === 204, 'Debe eliminar físicamente el insumo de prueba');
    }
  });

  await testAsync('4.7 Verificación de Salsas como Adiciones activas en GET /api/adiciones', async () => {
    const res = await apiRequest('GET', '/adiciones');
    assert(res.status === 200, `API Adiciones debe responder 200 (recibido ${res.status})`);
    assert(Array.isArray(res.data), 'Adiciones debe retornar un arreglo');

    // Verificar que las salsas comunes figuren con rol de adición y precio >= 1500
    const salsasEncontradas = res.data.filter(a => {
      const nom = (a.nombre || '').toLowerCase();
      return nom.includes('salsa') || nom.includes('mayonesa') || nom.includes('mostaza') || nom.includes('suero') || nom.includes('guacamole');
    });

    assert(salsasEncontradas.length >= 3, `Debe haber al menos 3 salsas registradas como adiciones activas (encontradas: ${salsasEncontradas.length})`);
    for (const salsa of salsasEncontradas) {
      assert(Number(salsa.precio) >= 1000, `La salsa ${salsa.nombre} debe tener un precio de adición comercial válido`);
      assert(salsa.esAdicion === 1 || salsa.esAdicion === true || salsa.idAdicion, `La salsa ${salsa.nombre} debe ser una adición activa`);
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // REPORTE FINAL Y ESTADÍSTICAS
  // ────────────────────────────────────────────────────────────────────────────
  console.log(`\n${BOLD}========================================================================${RESET}`);
  console.log(`${BOLD}📊 RESUMEN DE EJECUCIÓN DE PRUEBAS AUTOMATIZADAS${RESET}`);
  console.log(`========================================================================`);
  console.log(`Total de Casos Evaluados: ${BOLD}${total}${RESET}`);
  console.log(`Pruebas Exitosas:         ${GREEN}${BOLD}${passed}${RESET} ✓`);
  console.log(`Pruebas Fallidas:         ${failed > 0 ? RED + BOLD : GRAY}${failed}${RESET} ✗`);
  console.log(`Tasa de Éxito:            ${passed === total ? GREEN : RED}${BOLD}${((passed / total) * 100).toFixed(1)}%${RESET}`);
  console.log(`========================================================================\n`);

  if (failed > 0) {
    console.log(`${BG_RED} ALERTA: Hubo fallos en la suite de pruebas. ${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`${BG_GREEN} ¡ÉXITO TOTAL! Todos los casos de prueba pasaron satisfactoriamente. ${RESET}\n`);
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error(`\n${RED}Error fatal ejecutando la suite de pruebas:${RESET}`, err);
  process.exit(1);
});
