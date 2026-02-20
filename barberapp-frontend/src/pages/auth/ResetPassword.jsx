import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Scissors, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "/api";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [form, setForm] = useState({ newPassword: "", confirm: "" });
    const [show, setShow] = useState({ newPassword: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            setError("Enlace inválido. Por favor solicita uno nuevo.");
        }
    }, [token]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (form.newPassword !== form.confirm) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        if (form.newPassword.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: form.newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Error al restablecer contraseña");
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl shadow-blue-500/50"
                    >
                        <Scissors className="text-white" size={40} />
                    </motion.div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        {success ? "¡Listo!" : "Nueva contraseña"}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        {success
                            ? "Tu contraseña fue actualizada. Redirigiendo al login..."
                            : "Escoge una nueva contraseña segura para tu cuenta."}
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {success ? (
                        <div className="text-center">
                            <CheckCircle2 size={56} className="text-emerald-400 mx-auto mb-6" />
                            <p className="text-slate-300 text-sm mb-6">
                                Serás redirigido automáticamente en unos segundos.
                            </p>
                            <Link to="/login" className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-sm transition-colors">
                                <ArrowLeft size={16} /> Ir al login ahora
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
                                >
                                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                                    <p className="text-red-200 text-sm font-medium">{error}</p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Nueva contraseña</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                        <input
                                            type={show.newPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={form.newPassword}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                            placeholder="Mínimo 8 caracteres"
                                            required
                                        />
                                        <button type="button" onClick={() => setShow(s => ({ ...s, newPassword: !s.newPassword }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                            {show.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Confirmar contraseña</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                        <input
                                            type={show.confirm ? "text" : "password"}
                                            name="confirm"
                                            value={form.confirm}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                            placeholder="Repite tu nueva contraseña"
                                            required
                                        />
                                        <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                            {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !token}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Actualizando...
                                        </>
                                    ) : (
                                        "Actualizar contraseña"
                                    )}
                                </button>

                                <div className="text-center pt-2">
                                    <Link to="/forgot-password" className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors">
                                        <ArrowLeft size={16} /> Solicitar nuevo enlace
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
