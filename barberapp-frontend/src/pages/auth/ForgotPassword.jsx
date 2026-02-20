import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Scissors, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            // Always show success (anti-enumeration)
            setSent(true);
        } catch {
            setError("Error al conectar con el servidor. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
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
                {/* Logo */}
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
                        {sent ? "¡Revisa tu correo!" : "Olvidé mi contraseña"}
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
                        {sent
                            ? "Si tu email está registrado, recibirás un enlace en los próximos minutos."
                            : "Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña."}
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {sent ? (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <CheckCircle2 size={56} className="text-emerald-400" />
                            </div>
                            <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                                Revisa también tu carpeta de <strong className="text-white">spam</strong> si no lo ves en los próximos minutos.
                            </p>
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-sm transition-colors"
                            >
                                <ArrowLeft size={16} /> Volver al login
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
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                                        Correo Electrónico
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                            placeholder="tu@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        "Enviar enlace de recuperación"
                                    )}
                                </button>

                                <div className="text-center pt-2">
                                    <Link
                                        to="/login"
                                        className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                                    >
                                        <ArrowLeft size={16} /> Volver al login
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
