/**
 * HTML template for the financial report PDF.
 * Mirrors the Capitan Barber report format seen in the screenshots.
 *
 * @param {object} reporte - Output of GetReporteFinanciero.execute()
 * @returns {string} HTML string
 */
function buildReporteHTML(reporte) {
    const { meta, ingresos, egresos, neto } = reporte;
    const fmt = n => `$ ${Number(n || 0).toLocaleString("es-CL")}`;

    const serviciosRows = ingresos.servicios.map(s => `
        <tr>
            <td>${s.nombre}</td>
            <td class="num">${s.cant}</td>
            <td class="num">${fmt(s.unitario)}</td>
            <td class="num">${fmt(s.subtotal)}</td>
            <td class="num">${fmt(s.montoComision)}</td>
            <td class="num">${fmt(s.totalComision)}</td>
            <td class="num">${fmt(s.totalNeto)}</td>
        </tr>`).join("");

    const comprasRows = egresos.compras.map(e => `
        <tr>
            <td>${e.descripcion}</td>
            <td class="num">1</td>
            <td class="num">${fmt(e.montoTotal)}</td>
            <td class="num">${fmt(e.montoTotal)}</td>
        </tr>`).join("");

    const valesRows = egresos.vales.map(v => {
        const nombre = v.barberoId?.nombre || "Barbero";
        return `
        <tr>
            <td>${nombre} — ${v.descripcion}</td>
            <td class="num">1</td>
            <td class="num">${fmt(v.monto)}</td>
            <td class="num">${fmt(v.monto)}</td>
        </tr>`;
    }).join("");

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 30px; }
  h1 { font-size: 16px; text-align: center; margin-bottom: 4px; }
  .meta { font-size: 10px; margin-bottom: 20px; }
  .meta span { margin-right: 20px; }
  h2 { font-size: 13px; background: #222; color: #fff; padding: 4px 8px; margin: 14px 0 6px; }
  h3 { font-size: 11px; text-decoration: underline; margin: 8px 0 4px 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  th { background: #555; color: #fff; padding: 4px 6px; text-align: left; font-size: 10px; }
  th.num, td.num { text-align: right; }
  td { padding: 3px 6px; border-bottom: 1px solid #e0e0e0; }
  tr:nth-child(even) td { background: #f8f8f8; }
  .total-row td { font-weight: bold; background: #eee; border-top: 2px solid #888; }
  .grand-total { margin-top: 20px; text-align: right; font-size: 13px; font-weight: bold; border-top: 2px solid #222; padding-top: 6px; }
  .section-total { font-size: 10px; font-weight: bold; text-align: right; margin: 2px 0 10px; }
</style>
</head>
<body>

<h1>INFORMACIÓN REPORTE</h1>
<div class="meta">
  <span><strong>${meta.barberia}</strong></span>
  <span>Hasta: ${meta.fechaFin}</span>
  <span>Dirección: ${meta.direccion}</span>
  <span style="float:right">Fecha emisión: ${meta.fechaEmision}</span>
</div>

<!-- INGRESOS -->
<h2>DETALLE INGRESOS</h2>
<h3>SERVICIO</h3>
<table>
  <thead>
    <tr>
      <th>Nombre</th><th class="num">CANT.</th><th class="num">UNITARIO</th>
      <th class="num">TOTAL</th><th class="num">M. COMISIÓN</th>
      <th class="num">T. COMISIÓN</th><th class="num">TOTAL</th>
    </tr>
  </thead>
  <tbody>
    ${serviciosRows || '<tr><td colspan="7">Sin ingresos en el período</td></tr>'}
    <tr class="total-row">
      <td colspan="3">TOTALES SERVICIO</td>
      <td class="num">${fmt(ingresos.totalBruto)}</td>
      <td></td>
      <td class="num">${fmt(ingresos.totalComisiones)}</td>
      <td class="num">${fmt(ingresos.total)}</td>
    </tr>
  </tbody>
</table>
<div class="section-total">TOTALES DETALLE INGRESOS &nbsp;&nbsp; ${fmt(ingresos.totalBruto)} &nbsp;&nbsp; ${fmt(ingresos.totalComisiones)} &nbsp;&nbsp; ${fmt(ingresos.total)}</div>

<!-- EGRESOS -->
<h2>DETALLE EGRESOS</h2>

<h3>COMPRA</h3>
<table>
  <thead>
    <tr><th>Descripción</th><th class="num">CANT.</th><th class="num">UNITARIO</th><th class="num">TOTAL</th></tr>
  </thead>
  <tbody>
    ${comprasRows || '<tr><td colspan="4">Sin compras en el período</td></tr>'}
    <tr class="total-row">
      <td colspan="3">TOTALES COMPRA</td>
      <td class="num">${fmt(egresos.totalCompras)}</td>
    </tr>
  </tbody>
</table>

<h3>VALE</h3>
<table>
  <thead>
    <tr><th>Descripción</th><th class="num">CANT.</th><th class="num">UNITARIO</th><th class="num">TOTAL</th></tr>
  </thead>
  <tbody>
    ${valesRows || '<tr><td colspan="4">Sin vales en el período</td></tr>'}
    <tr class="total-row">
      <td colspan="3">TOTALES VALE</td>
      <td class="num">${fmt(egresos.totalVales)}</td>
    </tr>
  </tbody>
</table>
<div class="section-total">TOTALES DETALLE EGRESOS &nbsp;&nbsp; ${fmt(egresos.total)}</div>

<!-- NETO -->
<div class="grand-total">
  NETO DEL PERÍODO: ${fmt(neto)}
</div>

</body>
</html>`;
}

module.exports = { buildReporteHTML };
