/**
 * @file valesService.js
 * @description Servicio para gestión de vales / adelantos a barberos
 * 🔐 Autenticación: Requiere token JWT con rol BARBERIA_ADMIN
 * 🏢 Multi-tenant: Rutas bajo /api/barberias/:slug/admin/vales
 */

import api from "./api";

function getSlugActual() {
    return window.location.pathname.split("/")[1];
}

export async function registrarVale(valeData) {
    const slug = getSlugActual();
    const res = await api.post(`/barberias/${slug}/admin/vales`, valeData);
    return res.data;
}

export async function obtenerVales(filtros = {}) {
    const slug = getSlugActual();
    const queryParams = new URLSearchParams(filtros).toString();
    const url = `/barberias/${slug}/admin/vales${queryParams ? `?${queryParams}` : ""}`;
    const res = await api.get(url);
    return res.data;
}

export async function actualizarVale(id, data) {
    const slug = getSlugActual();
    const res = await api.put(`/barberias/${slug}/admin/vales/${id}`, data);
    return res.data;
}

export async function eliminarVale(id) {
    const slug = getSlugActual();
    const res = await api.delete(`/barberias/${slug}/admin/vales/${id}`);
    return res.data;
}

/**
 * Obtiene el reporte financiero unificado (JSON) desde el backend.
 */
export async function obtenerReporteFinanciero(fechaInicio, fechaFin) {
    const slug = getSlugActual();
    const res = await api.get(
        `/barberias/${slug}/admin/reportes/financiero?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return res.data;
}

/**
 * Descarga el reporte financiero como PDF desde el backend.
 * Abre el PDF en una nueva pestaña.
 */
export async function descargarReportePDF(fechaInicio, fechaFin) {
    const slug = getSlugActual();
    const res = await api.get(
        `/barberias/${slug}/admin/reportes/financiero/pdf?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
        { responseType: "blob" }
    );
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_${fechaInicio}_${fechaFin}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
