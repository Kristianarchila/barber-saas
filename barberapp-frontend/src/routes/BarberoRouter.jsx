import { Routes, Route } from "react-router-dom";
import BarberoLayout from "../layout/BarberoLayout.jsx";

import Dashboard from "../pages/barbero/Dashboard";
import Agenda from "../pages/barbero/Agenda"; // ✅ Componente de Agenda con selector de fecha
import Citas from "../pages/barbero/Citas"; // ✅ Historial de citas
import Perfil from "../pages/barbero/Perfil";
import Error404 from "../pages/errors/Error404";

export default function BarberoRouter() {
  return (
    <Routes>
      <Route element={<BarberoLayout />}>
        {/* Dashboard principal */}
        <Route index element={<Dashboard />} />
        
        {/* Agenda del día con selector de fecha */}
        <Route path="agenda" element={<Agenda />} />
        
        {/* Historial completo de citas */}
        <Route path="citas" element={<Citas />} />
        
        {/* Perfil del barbero */}
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}