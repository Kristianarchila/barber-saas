import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Lazy-loaded sub-routers
const SlugRouter = lazy(() => import("./SlugRouter"));
const SuperAdminRouter = lazy(() => import("./SuperAdminRouter"));

// ─── SaaS Marketing / Public pages ───────────────────────────────────────────
const Landing = lazy(() => import("../pages/public/Landing"));
const Pricing = lazy(() => import("../pages/public/Pricing"));
const Terminos = lazy(() => import("../pages/public/Terminos"));
const Privacidad = lazy(() => import("../pages/public/Privacidad"));

// ─── Auth pages ───────────────────────────────────────────────────────────────
const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const SignupBeta = lazy(() => import("../pages/auth/SignupBeta"));
const PaymentSuccess = lazy(() => import("../pages/auth/PaymentSuccess"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

// ─── Misc ─────────────────────────────────────────────────────────────────────
const Error404 = lazy(() => import("../pages/errors/Error404"));

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen label="Cargando..." />}>
      <Routes>
        {/* ── SaaS Landing & Marketing (MUST be before /:slug) ── */}
        <Route path="/" element={<Landing />} />
        <Route path="/precios" element={<Pricing />} />
        <Route path="/pricing" element={<Pricing />} />   {/* alias legacy */}
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />

        {/* ── Auth ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupBeta />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/success" element={<PaymentSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ── SuperAdmin ── */}
        <Route path="/superadmin/*" element={<SuperAdminRouter />} />

        {/* ── Tenant barber shop routes — MUST be last (catches /:slug) ── */}
        <Route path="/:slug/*" element={<SlugRouter />} />

        {/* 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
}
