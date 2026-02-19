import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/authService";
import { Scissors, Mail, Lock, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(form);
      console.log("📥 DATA LOGIN:", data);

      // 🔥 PASO 1: Limpiar TODO
      localStorage.clear();
      sessionStorage.clear();
      console.log("🧹 localStorage limpiado completamente");

      // 🔥 PASO 2: Extraer userId y rol
      const userId = data.user.id || data.user._id;
      const userRole = data.user.rol;

      console.log("🆔 userId:", userId);
      console.log("🎭 rol:", userRole);

      // 🔥 PASO 3: Guardar datos básicos SIEMPRE
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        ...data.user,
        id: userId  // Asegurar que tenga 'id'
      }));

      // 🔥 PASO 4: Guardar ID específico según el rol
      switch (userRole) {
        case "BARBERO":
          localStorage.setItem("barberoId", userId);
          // SOLO para barbero: guardar auth (para compatibilidad)
          localStorage.setItem("auth", JSON.stringify({
            token: data.token,
            user: { ...data.user, id: userId }
          }));
          console.log("✅ BARBERO - barberoId guardado:", userId);
          break;

        case "BARBERIA_ADMIN":
          localStorage.setItem("adminId", userId);
          console.log("✅ ADMIN - adminId guardado:", userId);
          break;

        case "SUPER_ADMIN":
          localStorage.setItem("superadminId", userId);
          console.log("✅ SUPER_ADMIN - superadminId guardado:", userId);
          break;

        default:
          console.warn("⚠️ Rol desconocido:", userRole);
      }

      // 🔥 PASO 5: Verificación final
      const finalBarberoId = localStorage.getItem("barberoId");
      const finalAdminId = localStorage.getItem("adminId");
      const finalAuth = localStorage.getItem("auth");

      console.log("📦 Estado final localStorage:");
      console.log("  - token:", localStorage.getItem("token") ? "✓" : "✗");
      console.log("  - user:", localStorage.getItem("user") ? "✓" : "✗");
      console.log("  - auth:", finalAuth ? "✓" : "✗");
      console.log("  - barberoId:", finalBarberoId || "❌");
      console.log("  - adminId:", finalAdminId || "❌");
      console.log("  - rol guardado:", userRole);

      // 🔥 PASO 6: Verificación de seguridad - Limpiar IDs que no corresponden
      if (userRole === "BARBERIA_ADMIN") {
        if (finalBarberoId) {
          console.error("🚨 CRÍTICO: Admin tiene barberoId, eliminando...");
          localStorage.removeItem("barberoId");
        }
        if (finalAuth) {
          console.error("🚨 CRÍTICO: Admin tiene auth, eliminando...");
          localStorage.removeItem("auth");
        }
      }

      if (userRole === "BARBERO") {
        if (finalAdminId) {
          console.error("🚨 CRÍTICO: Barbero tiene adminId, eliminando...");
          localStorage.removeItem("adminId");
        }
      }

      // 🔥 PASO 7: Redirigir según el rol
      console.log("🔄 Redirigiendo...");

      // Obtener el slug de la barbería del usuario
      const barberiaSlug = data.user.barberiaSlug || data.user.barberia?.slug;

      switch (userRole) {
        case "BARBERIA_ADMIN":
          if (barberiaSlug) {
            console.log("📍 Redirigiendo a:", `/${barberiaSlug}/admin/dashboard`);
            navigate(`/${barberiaSlug}/admin/dashboard`, { replace: true });
          } else {
            console.error("❌ ADMIN sin slug de barbería");
            setError("Error: Usuario admin sin barbería asignada");
          }
          break;
        case "SUPER_ADMIN":
          navigate("/superadmin", { replace: true });
          break;
        case "BARBERO":
          if (barberiaSlug) {
            console.log("📍 Redirigiendo a:", `/${barberiaSlug}/barbero/dashboard`);
            navigate(`/${barberiaSlug}/barbero/dashboard`, { replace: true });
          } else {
            console.error("❌ BARBERO sin slug de barbería");
            setError("Error: Usuario barbero sin barbería asignada");
          }
          break;
        default:
          navigate("/", { replace: true });
      }

    } catch (err) {
      console.error("❌ Error en login:", err);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Floating Scissors Icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.1, y: 0 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-20 right-20 text-white/5"
      >
        <Scissors size={120} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl shadow-blue-500/50"
          >
            <Scissors className="text-white" size={40} />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Bienvenido
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-200 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-slate-900/50 text-slate-400 font-medium">
                ¿Nuevo en la plataforma?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/signup"
            className="block w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-4 rounded-2xl transition-all text-center group"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              Crear una cuenta
            </span>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          © 2026 Barber SaaS. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
}