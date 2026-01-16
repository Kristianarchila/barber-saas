import { BrowserRouter, Routes, Route } from "react-router-dom";

// Routers por rol
import AdminRouter from "./AdminRouter";
import BarberoRouter from "./BarberoRouter";
import SuperAdminRouter from "./SuperAdminRouter";

// Páginas públicas
import Home from "../pages/public/Home";
import Book from "../pages/public/Book";

// Autenticación
import Login from "../pages/auth/Login";

// Páginas de error
import Error404 from "../pages/errors/Error404";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página principal - HOME */}
        <Route path="/" element={<Home />} />

        {/* Reservar */}
        <Route path="/book" element={<Book />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/role/admin/*" element={<AdminRouter />} />

        {/* Barbero */}
        <Route path="/role/barbero/*" element={<BarberoRouter />} />

        {/* SuperAdmin */}
        <Route path="/role/superadmin/*" element={<SuperAdminRouter />} />

        {/* Error 404 - DEBE IR AL FINAL */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
}