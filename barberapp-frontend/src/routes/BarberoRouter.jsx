import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../guards/ProtectedRoute";
import BarberoLayout from "../layout/BarberoLayout";

// Lazy-loaded pages
const Dashboard = lazy(() => import("../pages/barbero/Dashboard"));
const Agenda = lazy(() => import("../pages/barbero/Agenda"));
const Citas = lazy(() => import("../pages/barbero/Citas"));
const Perfil = lazy(() => import("../pages/barbero/Perfil"));
const MisFinanzas = lazy(() => import("../pages/barbero/MisFinanzas"));
const MisTransacciones = lazy(() => import("../pages/barbero/MisTransacciones"));

export default function BarberoRouter() {
  return (
    <ProtectedRoute requiredRole="BARBERO">
      <Routes>
        <Route element={<BarberoLayout />}>
          {/* /:slug/barbero */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* /:slug/barbero/dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* /:slug/barbero/agenda */}
          <Route path="agenda" element={<Agenda />} />

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
