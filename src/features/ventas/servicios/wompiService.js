import { apiClient } from "@/shared/api/apiClient";

const WOMPI_SCRIPT_URL = "https://checkout.wompi.co/widget.js";

/**
 * Carga de forma segura el script del Widget de Wompi evitando bloqueos por scripts preexistentes
 */
export const loadWompiScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.WidgetCheckout) {
      return resolve(window.WidgetCheckout);
    }

    let checkCount = 0;
    const interval = setInterval(() => {
      checkCount++;
      if (typeof window !== "undefined" && window.WidgetCheckout) {
        clearInterval(interval);
        return resolve(window.WidgetCheckout);
      }
      if (checkCount >= 50) { // 2.5 segundos
        clearInterval(interval);
        reject(new Error("No se pudo inicializar la pasarela Wompi en el navegador. Revisa tu conexión."));
      }
    }, 50);

    const existingScript = document.querySelector(`script[src="${WOMPI_SCRIPT_URL}"]`);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = WOMPI_SCRIPT_URL; // Sin parámetros query para que coincida con el selector interno de Wompi
      script.async = true;
      script.onload = () => {
        if (typeof window !== "undefined" && window.WidgetCheckout) {
          clearInterval(interval);
          resolve(window.WidgetCheckout);
        }
      };
      script.onerror = () => {
        clearInterval(interval);
        reject(new Error("Error al descargar el script de Wompi desde Bancolombia"));
      };
      document.body.appendChild(script);
    }
  });
};

export const wompiService = {
  /**
   * Solicita al backend crear la intención de pago y generar la firma de integridad SHA-256
   */
  async crearIntencion(pedidoPayload) {
    return await apiClient.post("/wompi/intencion", pedidoPayload);
  },

  /**
   * Consulta en el backend el estado verificado de una transacción Wompi
   */
  async verificarTransaccion(idTransaccion) {
    return await apiClient.get(`/wompi/verificar/${idTransaccion}`);
  },

  /**
   * Genera el enlace de pago directo oficial de Wompi (Checkout Web sin iframe)
   */
  generarUrlDirecta({ referencia, montoEnCentavos, moneda = "COP", firma, publicKey, redirectUrl }) {
    const pubKey = publicKey || import.meta.env.VITE_WOMPI_PUBLIC_KEY;
    let url = `https://checkout.wompi.co/p/?public-key=${pubKey}&currency=${moneda}&amount-in-cents=${montoEnCentavos}&reference=${referencia}&signature:integrity=${firma}`;
    // IMPORTANTE: CloudFront bloquea con 403 cualquier URL que contenga 'localhost' en los parámetros query
    if (redirectUrl && !redirectUrl.includes("localhost") && !redirectUrl.includes("127.0.0.1")) {
      url += `&redirect-url=${encodeURIComponent(redirectUrl)}`;
    }
    return url;
  },

  /**
   * Abre el Widget oficial de Checkout de Wompi
   */
  async abrirWidget({
    referencia,
    montoEnCentavos,
    moneda = "COP",
    firma,
    publicKey,
    customerData = {},
    redirectUrl = undefined
  }) {
    const WidgetCheckout = await loadWompiScript();

    return new Promise((resolve, reject) => {
      try {
        const config = {
          currency: moneda,
          amountInCents: Number(montoEnCentavos),
          reference: String(referencia),
          publicKey: publicKey || import.meta.env.VITE_WOMPI_PUBLIC_KEY,
          signature: {
            integrity: firma
          }
        };

        // CloudFront de Wompi bloquea con 403 Forbidden URLs con localhost en query params.
        // En entorno local NUNCA debe enviarse redirectUrl; el widget entrega el resultado en su callback
        if (redirectUrl && !redirectUrl.includes("localhost") && !redirectUrl.includes("127.0.0.1")) {
          config.redirectUrl = redirectUrl;
        }

        // Solo agregar customerData si los campos son válidos y no vacíos
        const cleanCustomer = {};
        if (customerData.email && typeof customerData.email === 'string' && customerData.email.includes('@')) {
          cleanCustomer.email = customerData.email.trim();
        }
        if (customerData.nombre || customerData.fullName) {
          const name = (customerData.nombre || customerData.fullName || '').trim();
          if (name) cleanCustomer.fullName = name;
        }
        if (customerData.telefono) {
          const digits = String(customerData.telefono).replace(/\D/g, '');
          if (digits.length >= 10) {
            cleanCustomer.phoneNumber = digits.slice(-10);
            cleanCustomer.phoneNumberPrefix = "+57";
          }
        }
        if (customerData.documento && String(customerData.documento).trim()) {
          cleanCustomer.legalId = String(customerData.documento).trim();
          cleanCustomer.legalIdType = "CC";
        }

        if (Object.keys(cleanCustomer).length > 0) {
          config.customerData = cleanCustomer;
        }

        console.log("Inicializando WidgetCheckout de Wompi...", {
          referencia: config.reference,
          monto: config.amountInCents,
          moneda: config.currency,
          publicKey: config.publicKey
        });

        const checkout = new WidgetCheckout(config);

        checkout.open(async (result) => {
          console.log("Resultado retornado por Wompi Widget:", result);
          const transaction = result ? result.transaction : null;
          if (!transaction) {
            return resolve({ status: "CLOSED_WITHOUT_RESULT" });
          }
          resolve(transaction);
        });
      } catch (err) {
        console.error("Error inicializando WidgetCheckout:", err);
        reject(err);
      }
    });
  }
};
