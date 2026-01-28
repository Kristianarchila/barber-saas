import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../guards/ProtectedRoute";

import BarberoLayout from "../layout/BarberoLayout";

import Dashboard from "../pages/barbero/Dashboard";
import Citas from "../pages/barbero/Citas";
import Perfil from "../pages/barbero/Perfil";

import MisFinanzas from "../pages/barbero/MisFinanzas";
import MisTransacciones from "../pages/barbero/MisTransacciones";

export default function BarberoRouter() {
  return (
    <ProtectedRoute requiredRole="BARBERO">
      <Routes>
        <Route element={<BarberoLayout />}>
          {/* /:slug/barbero */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* /:slug/barbero/dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* /:slug/barbero/citas */}
          <Route path="citas" element={<Citas />} />

          {/* /:slug/barbero/perfil */}
          <Route path="perfil" element={<Perfil />} />

          {/* /:slug/barbero/finanzas */}
          <Route path="finanzas">
            <Route index element={<MisFinanzas />} />
            <Route path="transacciones" element={<MisTransacciones />} />
          </Route>
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
