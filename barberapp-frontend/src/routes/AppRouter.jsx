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
const Pricing = lazy(() => import("../pages/public/Pricing"));
const Error404 = lazy(() => import("../pages/errors/Error404"));

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen label="Cargando..." />}>
      <Routes>
        {/* ROOT: Redirección al login general para evitar colisión de tenants */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pricing Público */}
        <Route path="/pricing" element={<Pricing />} />

        {/* SuperAdmin sin slug */}
        <Route path="/superadmin/*" element={<SuperAdminRouter />} />

        {/* Todo lo de la barbería vive bajo /:slug */}
        <Route path="/:slug/*" element={<SlugRouter />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupBeta />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/success" element={<PaymentSuccess />} />

        {/* 404 real */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
}
