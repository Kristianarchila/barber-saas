import { BrowserRouter, Routes, Route } from "react-router-dom";

import SlugRouter from "./SlugRouter";
import SuperAdminRouter from "./SuperAdminRouter";

// pages públicas fuera de slug (opcional)
import Login from "../pages/auth/Login";
import Error404 from "../pages/errors/Error404";

export default function AppRouter() {
  return (
    
      <Routes>
        {/* SuperAdmin sin slug */}
        <Route path="/superadmin/*" element={<SuperAdminRouter />} />

        {/* Todo lo de la barbería vive bajo /:slug */}
        <Route path="/:slug/*" element={<SlugRouter />} />

        {/* Auth genérica si la usas */}
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<Error404 />} />
      </Routes>
    
  );
}
