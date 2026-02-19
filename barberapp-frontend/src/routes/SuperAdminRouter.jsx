import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../guards/ProtectedRoute";
import SuperAdminLayout from "../layout/SuperAdminLayout";

// Lazy-loaded pages
const SuperAdminDashboard = lazy(() => import("../pages/superadmin/Dashboard"));
const BarberiasList = lazy(() => import("../pages/superadmin/Barberias"));
const CrearBarberia = lazy(() => import("../pages/superadmin/CrearBarberia"));
const DetalleBarberia = lazy(() => import("../pages/superadmin/DetalleBarberia"));
const GestionarSucursales = lazy(() => import("../pages/superadmin/GestionarSucursales"));
const Finanzas = lazy(() => import("../pages/superadmin/Finanzas"));
const Reportes = lazy(() => import("../pages/superadmin/Reportes"));
const Admins = lazy(() => import("../pages/superadmin/Admins"));
const Suscripciones = lazy(() => import("../pages/superadmin/Suscripciones"));
const CuentasPendientes = lazy(() => import("../pages/superadmin/CuentasPendientes"));
const AuditLogs = lazy(() => import("../pages/superadmin/AuditLogs"));

export default function SuperAdminRouter() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute requiredRole="SUPER_ADMIN">
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        {/* /superadmin */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* /superadmin/dashboard */}
        <Route path="dashboard" element={<SuperAdminDashboard />} />

        {/* /superadmin/dashboard/barberias */}
        <Route path="dashboard/barberias" element={<BarberiasList />} />

        {/* /superadmin/dashboard/barberias/crear */}
        <Route
          path="dashboard/barberias/crear"
          element={<CrearBarberia />}
        />

        {/* /superadmin/dashboard/barberias/:id */}
        <Route
          path="dashboard/barberias/:id"
          element={<DetalleBarberia />}
        />

        {/* /superadmin/dashboard/barberias/:id/sucursales */}
        <Route
          path="dashboard/barberias/:id/sucursales"
          element={<GestionarSucursales />}
        />

        <Route path="dashboard/finanzas" element={<Finanzas />} />

        <Route path="dashboard/reportes" element={<Reportes />} />
        <Route path="dashboard/admins" element={<Admins />} />
        <Route path="dashboard/suscripciones" element={<Suscripciones />} />
        <Route path="dashboard/cuentas-pendientes" element={<CuentasPendientes />} />
        <Route path="dashboard/auditoria" element={<AuditLogs />} />

      </Route>
    </Routes>
  );
}
