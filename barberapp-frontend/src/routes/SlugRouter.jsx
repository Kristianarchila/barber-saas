import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { BarberiaProvider } from "../context/BarberiaContext";
import { useBarberia } from "../context/BarberiaContext";
import { usePWAManifest } from "../hooks/usePWAManifest";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Lazy-loaded tenant pages (public-facing barber shop pages)
const Home = lazy(() => import("../pages/tenant/Home"));
const BookBySlug = lazy(() => import("../pages/tenant/BookBySlug"));
const CancelarReserva = lazy(() => import("../pages/tenant/CancelarReserva"));
const Reagendar = lazy(() => import("../pages/tenant/Reagendar"));
const Tienda = lazy(() => import("../pages/tenant/Tienda"));

// Lazy-loaded sub-routers
const AdminRouter = lazy(() => import("./AdminRouter"));
const BarberoRouter = lazy(() => import("./BarberoRouter"));

/**
 * PWAManifestInjector — Inyecta el manifest dinámico y favicon de la barbería activa.
 * Debe montarse DENTRO de BarberiaProvider para acceder al contexto.
 * No renderiza nada visible, solo manipula el <head>.
 */
function PWAManifestInjector() {
  const { slug, barberia } = useBarberia();

  // Extraer logo — puede ser string o value object {_value: '...'}
  const rawLogo = barberia?.configuracion?.logoUrl;
  const logoUrl = typeof rawLogo === 'string'
    ? rawLogo
    : (rawLogo?._value ?? null);

  // Pasar logo al hook → inyecta manifest + favicon automáticamente
  usePWAManifest(slug, !!barberia, logoUrl);
  return null;
}

export default function SlugRouter() {
  return (
    <BarberiaProvider>
      {/* Inyectar manifest dinámico del tenant sin afectar el render */}
      <PWAManifestInjector />
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

          {/* /:slug/tienda - Marketplace público */}
          <Route path="tienda" element={<Tienda />} />

          {/* /:slug/admin/* o /:marcaSlug/:sedeSlug/admin/* - Panel admin */}
          <Route path="admin/*" element={<AdminRouter />} />

          {/* Panel barbero */}
          <Route path="barbero/*" element={<BarberoRouter />} />
        </Routes>
      </Suspense>
    </BarberiaProvider>
  );
}
