import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Scissors, Loader2, CheckCircle2, AlertCircle, Building2, ArrowRight, Sparkles } from 'lucide-react';
import { signup } from '../../services/authService';

const SignupBeta = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validaciones
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            setLoading(false);
            return;
        }

        try {
            // Registrar sin pago - Beta version
            await signup({
                nombre: formData.nombre,
                email: formData.email,
                password: formData.password
            });

            setSuccess(true);

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            console.error('Signup error:', err);
            const data = err.response?.data;
            if (data?.errors?.length) {
                setError(data.errors.map(e => e.message).join('. '));
            } else {
                setError(data?.message || err.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/50">
                            <CheckCircle2 className="text-white" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3">
                            ¡Cuenta Creada!
                        </h2>
                        <p className="text-slate-400 mb-6">
                            Tu cuenta ha sido creada exitosamente. Redirigiendo al login...
                        </p>
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Redirigiendo...
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
            </div>

            {/* Floating Icons */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 0.05, y: 0 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                className="absolute top-20 left-20 text-white/5"
            >
                <Scissors size={100} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-2xl shadow-purple-500/50"
                    >
                        <Building2 className="text-white" size={40} />
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                        Únete al Beta
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base font-medium">
                        Crea tu cuenta y comienza gratis
                    </p>

                    {/* Beta Badge */}
                    <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
                        <Sparkles className="text-purple-400" size={16} />
                        <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">
                            Acceso Beta Gratuito
                        </span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
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
                        {/* Nombre */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                                Nombre de la Barbería
                            </label>
                            <div className="relative group">
                                <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                                <input
                                    required
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: La Mejor Barbería"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="tu@email.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                                <input
                                    required
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    minLength={8}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                                Confirmar Contraseña
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                                <input
                                    required
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    minLength={8}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                            <p className="text-xs text-slate-500 px-1">Mínimo 8 caracteres, una mayúscula y un número</p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creando cuenta...
                                    </>
                                ) : (
                                    <>
                                        Crear Cuenta Gratis
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                    </>
                                )}
                            </button>

                            <p className="mt-4 text-center text-slate-500 text-xs px-4">
                                Al registrarte, aceptas nuestros{' '}
                                <a href="#" className="text-slate-400 hover:text-white underline transition-colors">
                                    Términos de Servicio
                                </a>{' '}
                                y{' '}
                                <a href="#" className="text-slate-400 hover:text-white underline transition-colors">
                                    Política de Privacidad
                                </a>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-slate-400 text-sm">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-white font-bold hover:text-purple-400 transition-colors">
                        Inicia sesión
                    </Link>
                </p>

                <p className="text-center text-slate-500 text-xs mt-4">
                    © 2026 Barber SaaS. Todos los derechos reservados.
                </p>
            </motion.div>
        </div>
    );
};

export default SignupBeta;
