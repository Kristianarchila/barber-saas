import { Routes, Route, Navigate } from "react-router-dom";

import SlugRouter from "./SlugRouter";
import SuperAdminRouter from "./SuperAdminRouter";

import Login from "../pages/auth/Login";
import Error404 from "../pages/errors/Error404";

export default function AppRouter() {
  return (
    <Routes>
      {/* ROOT: redirección a una barbería */}
      <Route path="/" element={<Navigate to="/barberialamejor" replace />} />

      {/* SuperAdmin sin slug */}
      <Route path="/superadmin/*" element={<SuperAdminRouter />} />

      {/* Todo lo de la barbería vive bajo /:slug */}
      <Route path="/:slug/*" element={<SlugRouter />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* 404 real */}
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}
