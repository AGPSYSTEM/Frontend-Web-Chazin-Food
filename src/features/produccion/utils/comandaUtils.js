import { resolveOrderTimings } from "./tiempoProduccionUtils";

/**
 * Utilidad para imprimir la comanda de cocina (Ticket térmico o estándar de producción)
 */
export function imprimirComanda(orden) {
  if (!orden) return;
  const timings = resolveOrderTimings(orden);

  const printWindow = window.open("", "_blank", "width=420,height=650");
  if (!printWindow) {
    alert("Por favor permite ventanas emergentes para imprimir la comanda.");
    return;
  }

  const productos = Array.isArray(orden.productos) && orden.productos.length > 0
    ? orden.productos
    : [
        {
          nombre: orden.platilloNombre || orden.producto || "Platillo Principal",
          cantidad: orden.cantidad || 1,
          observaciones: orden.observaciones || "",
          adiciones: []
        }
      ];

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comanda de Cocina - ${orden.codigo || `OP-00${orden.id}`}</title>
  <style>
    @page {
      margin: 4mm;
      size: 80mm auto;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace;
      font-size: 13px;
      line-height: 1.35;
      color: #000;
      margin: 0;
      padding: 10px 6px;
      background: #fff;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #000;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 1px;
      margin: 0;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 11px;
      margin: 2px 0 0 0;
      font-weight: bold;
    }
    .order-code {
      font-size: 20px;
      font-weight: 900;
      margin: 6px 0;
      background: #000;
      color: #fff;
      display: inline-block;
      padding: 3px 12px;
      border-radius: 4px;
    }
    .meta-box {
      border-bottom: 1px dashed #000;
      padding-bottom: 6px;
      margin-bottom: 8px;
      font-size: 12px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .meta-label {
      font-weight: bold;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
    }
    .items-table th {
      border-bottom: 1px solid #000;
      text-align: left;
      font-size: 11px;
      padding: 4px 2px;
      text-transform: uppercase;
    }
    .item-row {
      border-bottom: 1px dotted #ccc;
      vertical-align: top;
    }
    .item-row td {
      padding: 6px 2px;
    }
    .item-qty {
      font-size: 15px;
      font-weight: 900;
      width: 38px;
    }
    .item-name {
      font-size: 13px;
      font-weight: bold;
    }
    .item-adds {
      font-size: 11px;
      font-weight: bold;
      color: #222;
      margin-top: 2px;
      padding-left: 4px;
    }
    .item-notes {
      font-size: 11px;
      font-style: italic;
      margin-top: 2px;
      padding-left: 4px;
    }
    .checklist-box {
      border: 1px solid #000;
      border-radius: 4px;
      padding: 6px;
      margin-top: 8px;
      font-size: 11px;
    }
    .checklist-title {
      font-weight: 900;
      text-transform: uppercase;
      font-size: 11px;
      margin-bottom: 4px;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
    }
    .chk-item {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
    }
    .footer {
      border-top: 2px dashed #000;
      padding-top: 8px;
      margin-top: 10px;
      text-align: center;
      font-size: 11px;
    }
    .badge-turno {
      font-size: 12px;
      font-weight: 900;
      border: 1px solid #000;
      padding: 2px 6px;
      border-radius: 3px;
    }
    @media print {
      body {
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">CHAZIN FOOD</h1>
    <p class="subtitle">COMANDA DE COCINA / PRODUCCIÓN</p>
    <div class="order-code">${orden.codigo || `OP-00${orden.id}`}</div>
  </div>

  <div class="meta-box">
    <div class="meta-row">
      <span class="meta-label">CLIENTE:</span>
      <span><strong>${orden.cliente || orden.responsable || "Cliente Mostrador"}</strong></span>
    </div>
    <div class="meta-row">
      <span class="meta-label">COCINERO / CHEF:</span>
      <span>${orden.cocinero || orden.responsableCocina || orden.responsable || "Chef de Turno"}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">UBICACIÓN / TIPO:</span>
      <span><strong>${orden.mesa || orden.tipo || "En Local"}</strong></span>
    </div>
    <div class="meta-row">
      <span class="meta-label">FECHA / HORA PEDIDO:</span>
      <span>${timings.fechaColombia} · ${timings.horaPedido}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">TIEMPO COCCIÓN / ENTREGA:</span>
      <span>${timings.tiempoPreparacion} (${timings.tiempoEstimadoEntrega})</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">HORA ESTADO (${orden.estado}):</span>
      <span><strong>${timings.horaEstado}</strong></span>
    </div>
    ${orden.prioridad ? `
    <div class="meta-row" style="margin-top: 4px;">
      <span class="meta-label">TURNO DE PREPARACIÓN:</span>
      <span class="badge-turno">TURNO #${orden.prioridad}</span>
    </div>` : ''}
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 36px;">CANT</th>
        <th>PLATILLO / PRODUCTO</th>
        <th style="width: 32px; text-align: center;">OK</th>
      </tr>
    </thead>
    <tbody>
      ${productos.map(p => {
        const qty = Number(p.cantidad) || 1;
        const adds = Array.isArray(p.adiciones) ? p.adiciones : [];
        const obs = p.observaciones || p.nota || "";
        return `
        <tr class="item-row">
          <td class="item-qty">x${qty}</td>
          <td>
            <div class="item-name">${p.nombre}</div>
            ${adds.length > 0 ? `
              <div class="item-adds">
                + Adiciones: ${adds.map(a => typeof a === 'object' ? `${a.cantidad > 1 ? `x${a.cantidad} ` : ''}${a.nombre || a.nombreAdicion}` : a).join(', ')}
              </div>
            ` : ''}
            ${obs ? `<div class="item-notes">Nota: "${obs}"</div>` : ''}
          </td>
          <td style="text-align: center; vertical-align: middle; font-size: 16px;">
            [ &nbsp; ]
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  ${Array.isArray(orden.checklistPreparacion) && orden.checklistPreparacion.length > 0 ? `
  <div class="checklist-box">
    <div class="checklist-title">Checklist de Verificación (${orden.pedidoCompleto ? "COMPLETO ✅" : "INCOMPLETO ⚠️"})</div>
    ${orden.checklistPreparacion.map(c => `
      <div class="chk-item">
        <span>${c.cantidad} ${c.nombre}</span>
        <span>${c.completado ? "✅" : "❌"} ${!c.completado && c.motivo ? `(${c.motivo})` : ''}</span>
      </div>
    `).join('')}
  </div>` : ''}

  ${orden.observacionCocina ? `
  <div style="margin-top: 6px; font-size: 11px; font-style: italic;">
    <strong>Nota de Cocina:</strong> "${orden.observacionCocina}"
  </div>` : ''}

  <div class="footer">
    <p style="margin: 0 0 4px 0; font-weight: bold;">TOTAL UNIDADES: ${orden.cantidad || productos.length}</p>
    <p style="margin: 0; font-size: 10px; color: #555;">*** FIN DE COMANDA ***</p>
  </div>

  <div class="no-print" style="margin-top: 15px; text-align: center;">
    <button onclick="window.print()" style="padding: 8px 16px; font-size: 14px; font-weight: bold; cursor: pointer; background: #000; color: #fff; border: none; border-radius: 6px;">
      Imprimir Ticket
    </button>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

