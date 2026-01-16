import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import Barberos from "../pages/admin/Barberos";
import Citas from "../pages/admin/Citas";
import Servicios from "../pages/admin/Servicios";
import Disponibilidad from "../pages/admin/Disponibilidad.jsx";
import Horarios from "../pages/admin/Horarios.jsx";
import ReservasAdmin from "../pages/admin/Reservas.jsx";
import Historial from "../pages/admin/Historial.jsx";
import FinanzasAdmin from "../pages/admin/Finanzas";




export default function AdminRouter() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Redirige /role/admin a /role/admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="barberos" element={<Barberos />} />
        <Route path="citas" element={<Citas />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="disponibilidad" element={<Disponibilidad />} />
        <Route path="horarios" element={<Horarios />} />
        <Route path="reservas" element={<ReservasAdmin />} />
        <Route path="historial" element={<Historial />} />
        <Route path="finanzas" element={<FinanzasAdmin />} />
        
      </Route>
    </Routes>
  );
}