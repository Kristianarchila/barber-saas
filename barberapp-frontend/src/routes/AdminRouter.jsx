import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../guards/ProtectedRoute";
import AdminLayout from "../layout/AdminLayout.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import Barberos from "../pages/admin/Barberos.jsx";
import Servicios from "../pages/admin/Servicios.jsx";
import Disponibilidad from "../pages/admin/Disponibilidad.jsx";
import Horarios from "../pages/admin/Horarios.jsx";
import ReservasAdmin from "../pages/admin/Reservas.jsx";
import Historial from "../pages/admin/Historial.jsx";
import FinanzasAdmin from "../pages/admin/Finanzas.jsx";
import Suscripcion from "../pages/admin/Suscripcion.jsx";
import EmailConfig from "../pages/admin/EmailConfig.jsx";
import GestionResenas from "../pages/admin/GestionResenas.jsx";

// Finanzas Module
import FinanzasDashboard from "../pages/admin/finanzas/Dashboard.jsx";
import Transacciones from "../pages/admin/finanzas/Transacciones.jsx";
import RevenueConfig from "../pages/admin/finanzas/RevenueConfig.jsx";
import Pagos from "../pages/admin/finanzas/Pagos.jsx";
import Reportes from "../pages/admin/finanzas/Reportes.jsx";

/**
 * AdminRouter - Rutas del panel de administración
 * 
 * Requiere autenticación y rol ADMIN
 */
export default function AdminRouter() {
  return (
    <ProtectedRoute requiredRole="BARBERIA_ADMIN">
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reservas" element={<ReservasAdmin />} />
          <Route path="barberos" element={<Barberos />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="horarios" element={<Horarios />} />
          <Route path="historial" element={<Historial />} />

          {/* Finanzas Module */}
          <Route path="finanzas">
            <Route index element={<FinanzasDashboard />} />
            <Route path="transacciones" element={<Transacciones />} />
            <Route path="revenue-split" element={<RevenueConfig />} />
            <Route path="pagos" element={<Pagos />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>

          <Route path="suscripcion" element={<Suscripcion />} />
          <Route path="email-config" element={<EmailConfig />} />
          <Route path="resenas" element={<GestionResenas />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
