import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../guards/ProtectedRoute";
import SuperAdminLayout from "../layout/SuperAdminLayout";

import SuperAdminDashboard from "../pages/superadmin/Dashboard";
import BarberiasList from "../pages/superadmin/Barberias";
import CrearBarberia from "../pages/superadmin/CrearBarberia";
import DetalleBarberia from "../pages/superadmin/DetalleBarberia";
import Finanzas from "../pages/superadmin/Finanzas";
import Reportes from "../pages/superadmin/Reportes";

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

        <Route path="dashboard/finanzas" element={<Finanzas />} />

        <Route path="dashboard/reportes" element={<Reportes />} />

      </Route>
    </Routes>
  );
}
