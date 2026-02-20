import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Lazy-loaded sub-routers
const SlugRouter = lazy(() => import("./SlugRouter"));
const SuperAdminRouter = lazy(() => import("./SuperAdminRouter"));

// Lazy-loaded pages
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const SignupBeta = lazy(() => import("../pages/auth/SignupBeta"));
const PaymentSuccess = lazy(() => import("../pages/auth/PaymentSuccess"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const Pricing = lazy(() => import("../pages/public/Pricing"));
const Error404 = lazy(() => import("../pages/errors/Error404"));

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen label="Cargando..." />}>
      <Routes>
        {/* ROOT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── Rutas estáticas PRIMERO (antes de /:slug/*) ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupBeta />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/success" element={<PaymentSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* SuperAdmin */}
        <Route path="/superadmin/*" element={<SuperAdminRouter />} />

        {/* ── Ruta dinámica de barbería ÚLTIMA (captura /:slug) ── */}
        <Route path="/:slug/*" element={<SlugRouter />} />

        {/* 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
}

