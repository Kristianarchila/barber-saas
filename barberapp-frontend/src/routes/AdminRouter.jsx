import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../guards/ProtectedRoute";
import AdminLayout from "../layout/AdminLayout.jsx";

// ── Lazy-loaded pages ────────────────────────────────────────────
const Dashboard = lazy(() => import("../pages/admin/Dashboard.jsx"));
const Barberos = lazy(() => import("../pages/admin/Barberos.jsx"));
const Servicios = lazy(() => import("../pages/admin/Servicios.jsx"));
const Disponibilidad = lazy(() => import("../pages/admin/Disponibilidad.jsx"));
const Horarios = lazy(() => import("../pages/admin/Horarios.jsx"));
const ReservasAdmin = lazy(() => import("../pages/admin/Reservas.jsx"));
const Historial = lazy(() => import("../pages/admin/Historial.jsx"));
const FinanzasAdmin = lazy(() => import("../pages/admin/Finanzas.jsx"));
const Suscripcion = lazy(() => import("../pages/admin/Suscripcion.jsx"));
const EmailConfig = lazy(() => import("../pages/admin/EmailConfig.jsx"));
const GestionResenas = lazy(() => import("../pages/admin/GestionResenas.jsx"));
const VentaRapida = lazy(() => import("../pages/admin/VentaRapida.jsx"));
const SueldosBarberos = lazy(() => import("../pages/admin/SueldosBarberos.jsx"));
const Sucursales = lazy(() => import("../pages/admin/Sucursales.jsx"));
const Clientes = lazy(() => import("../pages/admin/Clientes.jsx"));
const FichaTecnica = lazy(() => import("../pages/admin/clientes/FichaTecnica.jsx"));
const SiteConfig = lazy(() => import("../pages/admin/SiteConfig.jsx"));
const Bloqueos = lazy(() => import("../pages/admin/Bloqueos.jsx"));
const HistorialVentas = lazy(() => import("../pages/admin/HistorialVentas.jsx"));
const CalendarConfig = lazy(() => import("../pages/admin/CalendarConfig.jsx"));

// Calendar Module
const CalendarioSemanal = lazy(() => import("../pages/admin/CalendarioSemanal.jsx"));
const CalendarioMensual = lazy(() => import("../pages/admin/CalendarioMensual.jsx"));
const CalendarioDiario = lazy(() => import("../pages/admin/CalendarioDiario.jsx"));

// Finanzas Module
const FinanzasDashboard = lazy(() => import("../pages/admin/finanzas/Dashboard.jsx"));
const Transacciones = lazy(() => import("../pages/admin/finanzas/Transacciones.jsx"));
const RevenueConfig = lazy(() => import("../pages/admin/finanzas/RevenueConfig.jsx"));
const Pagos = lazy(() => import("../pages/admin/finanzas/Pagos.jsx"));
const Reportes = lazy(() => import("../pages/admin/finanzas/Reportes.jsx"));

// Nuevo Sistema Financiero
const Ingresos = lazy(() => import("../pages/admin/finanzas/Ingresos.jsx"));
const Egresos = lazy(() => import("../pages/admin/finanzas/Egresos.jsx"));
const Caja = lazy(() => import("../pages/admin/finanzas/Caja.jsx"));

// Marketplace Module
const Productos = lazy(() => import("../pages/admin/productos/Productos.jsx"));
const ProductoForm = lazy(() => import("../pages/admin/productos/ProductoForm.jsx"));

// Inventory Module
const Inventario = lazy(() => import("../pages/admin/Inventario.jsx"));
const Proveedores = lazy(() => import("../pages/admin/Proveedores.jsx"));
const MovimientosStock = lazy(() => import("../pages/admin/MovimientosStock.jsx"));

// Marketing Module
const NotificacionesConfig = lazy(() => import("../pages/admin/NotificacionesConfig.jsx"));
const Cupones = lazy(() => import("../pages/admin/Cupones.jsx"));
const WaitingListManager = lazy(() => import("../pages/admin/WaitingListManager.jsx"));

/**
 * AdminRouter - Rutas del panel de administración
 * 
 * Requiere autenticación y rol ADMIN
 * Todas las páginas se cargan bajo demanda (lazy loading)
 */
export default function AdminRouter() {
  return (
    <ProtectedRoute requiredRole="BARBERIA_ADMIN">
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reservas" element={<ReservasAdmin />} />
          <Route path="calendario/diario" element={<CalendarioDiario />} />
          <Route path="calendario/semanal" element={<CalendarioSemanal />} />
          <Route path="calendario/mensual" element={<CalendarioMensual />} />
          <Route path="venta-rapida" element={<VentaRapida />} />
          <Route path="sueldos" element={<SueldosBarberos />} />
          <Route path="barberos" element={<Barberos />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="horarios" element={<Horarios />} />
          <Route path="bloqueos" element={<Bloqueos />} />
          <Route path="historial" element={<Historial />} />
          <Route path="historial-ventas" element={<HistorialVentas />} />

          {/* Gestión de Clientes & CRM */}
          <Route path="clientes">
            <Route index element={<Clientes />} />
            <Route path=":id/ficha" element={<FichaTecnica />} />
          </Route>

          {/* Finanzas Module */}
          <Route path="finanzas">
            <Route index element={<FinanzasDashboard />} />
            <Route path="transacciones" element={<Transacciones />} />
            <Route path="revenue-split" element={<RevenueConfig />} />
            <Route path="pagos" element={<Pagos />} />
            <Route path="reportes" element={<Reportes />} />

            {/* Nuevo Sistema Financiero */}
            <Route path="ingresos" element={<Ingresos />} />
            <Route path="egresos" element={<Egresos />} />
            <Route path="caja" element={<Caja />} />
          </Route>

          {/* Marketplace Module */}
          <Route path="productos">
            <Route index element={<Productos />} />
            <Route path="nuevo" element={<ProductoForm />} />
            <Route path=":id" element={<ProductoForm />} />
          </Route>

          {/* Inventory Module */}
          <Route path="inventario" element={<Inventario />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="movimientos-stock" element={<MovimientosStock />} />

          {/* Marketing Module */}
          <Route path="cupones" element={<Cupones />} />
          <Route path="lista-espera" element={<WaitingListManager />} />
          <Route path="notificaciones" element={<NotificacionesConfig />} />

          <Route path="suscripcion" element={<Suscripcion />} />
          <Route path="email-config" element={<EmailConfig />} />
          <Route path="site-config" element={<SiteConfig />} />
          <Route path="sucursales" element={<Sucursales />} />
          <Route path="resenas" element={<GestionResenas />} />
          <Route path="calendario-config" element={<CalendarConfig />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
