import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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
          
        case "SUPERADMIN":
          localStorage.setItem("superadminId", userId);
          console.log("✅ SUPERADMIN - superadminId guardado:", userId);
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
      
      switch (userRole) {
        case "BARBERIA_ADMIN":
          navigate("/role/admin/dashboard", { replace: true });
          break;
        case "SUPERADMIN":
          navigate("/role/superadmin", { replace: true });
          break;
        case "BARBERO":
          navigate("/role/barbero", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
      
    } catch (err) {
      console.error("❌ Error en login:", err);
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">
          Iniciar sesión
        </h1>

        {error && (
          <div className="mb-4 text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-500/30">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}