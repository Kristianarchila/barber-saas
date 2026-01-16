import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/superadmin/Dashboard";
import Barberias from "../pages/superadmin/Barberias";
import Finanzas from "../pages/superadmin/Finanzas";

import Error404 from "../pages/errors/Error404";

export default function SuperAdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="barberias" element={<Barberias />} />
      <Route path="finanzas" element={<Finanzas />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}
