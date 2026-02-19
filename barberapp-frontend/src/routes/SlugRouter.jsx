import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { BarberiaProvider } from "../context/BarberiaContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Lazy-loaded pages
const Home = lazy(() => import("../pages/public/Home"));
const BookBySlug = lazy(() => import("../pages/public/BookBySlug"));
const CancelarReserva = lazy(() => import("../pages/public/CancelarReserva"));
const Reagendar = lazy(() => import("../pages/public/Reagendar"));

// Lazy-loaded sub-routers
const AdminRouter = lazy(() => import("./AdminRouter"));
const BarberoRouter = lazy(() => import("./BarberoRouter"));

export default function SlugRouter() {
  return (
    <BarberiaProvider>
      <Suspense fallback={<LoadingSpinner fullScreen label="Cargando..." />}>
        <Routes>
          {/* SINGLE LOCATION: /:slug - Landing page tradicional */}
          <Route index element={<Home />} />

          {/* ⚠️ IMPORTANTE: Rutas específicas DEBEN ir ANTES de rutas dinámicas (:sedeSlug) */}

          {/* /:slug/book o /:marcaSlug/:sedeSlug/book - Página de reservas */}
          <Route path="book/:rescheduleToken?" element={<BookBySlug />} />

          {/* /:slug/cancelar o /:marcaSlug/:sedeSlug/cancelar - Cancelar reserva */}
          <Route path="cancelar/:token" element={<CancelarReserva />} />

          {/* /:slug/reagendar o /:marcaSlug/:sedeSlug/reagendar - Reagendar */}
          <Route path="reagendar/:rescheduleToken" element={<BookBySlug />} />

          {/* /:slug/admin/* o /:marcaSlug/:sedeSlug/admin/* - Panel admin */}
          <Route path="admin/*" element={<AdminRouter />} />

          {/* Panel barbero */}
          <Route path="barbero/*" element={<BarberoRouter />} />
        </Routes>
      </Suspense>
    </BarberiaProvider>
  );
}
