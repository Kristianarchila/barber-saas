import { Routes, Route } from "react-router-dom";
import { BarberiaProvider } from "../context/BarberiaContext";

import Home from "../pages/public/Home";
import BookBySlug from "../pages/public/BookBySlug";
import CancelarReserva from "../pages/public/CancelarReserva";
import Reagendar from "../pages/public/Reagendar";
import AdminRouter from "./AdminRouter";
import BarberoRouter from "./BarberoRouter";

export default function SlugRouter() {
  return (
    <BarberiaProvider>
      <Routes>
        {/* /:slug - Landing page */}
        <Route index element={<Home />} />

        {/* /:slug/book - Página de reservas públicas (con soporte para reagendar opcional) */}
        <Route path="book/:rescheduleToken?" element={<BookBySlug />} />

        {/* /:slug/cancelar/:token - Cancelar reserva */}
        <Route path="cancelar/:token" element={<CancelarReserva />} />

        {/* /:slug/reagendar/:token - Reagendar ahora usa la misma UI Premium de reserva */}
        <Route path="reagendar/:rescheduleToken" element={<BookBySlug />} />

        {/* /:slug/admin/* */}
        <Route path="admin/*" element={<AdminRouter />} />

        {/* /:slug/barbero/* */}
        <Route path="barbero/*" element={<BarberoRouter />} />
      </Routes>
    </BarberiaProvider>
  );
}
