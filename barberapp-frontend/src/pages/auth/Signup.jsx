import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Trophy, ArrowRight, Mail, Lock, Scissors, Loader2, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import subscriptionService from '../../services/subscriptionService';

const Signup = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Initial plan from URL
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        planId: searchParams.get('plan') || 'basico'
    });

    const plans = [
        { id: 'basico', name: 'Básico', icon: Zap, color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/25' },
        { id: 'pro', name: 'Pro', icon: Sparkles, color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/25' },
        { id: 'premium', name: 'Premium', icon: Trophy, color: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/25' }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlanSelect = (id) => {
        setFormData({ ...formData, planId: id });
    };

    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call registration endpoint
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle validation errors with specific messages
                if (data.errors && Array.isArray(data.errors)) {
                    // Zod validation errors
                    const errorMessages = data.errors.map(err => err.message).join('. ');
                    throw new Error(errorMessages);
                } else if (data.message) {
                    throw new Error(data.message);
                } else {
                    throw new Error('Error al procesar el registro');
                }
            }

            // Show success message
            setSuccess(true);
        } catch (err) {
            console.error('Signup error:', err);
            setError(err.message || 'Error al procesar el registro. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const selectedPlan = plans.find(p => p.id === formData.planId);

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
                className="w-full max-w-2xl relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Link
                        to="/pricing"
                        className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6 group text-sm font-medium"
                    >
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Volver a planes
                    </Link>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-2xl shadow-purple-500/50"
                    >
                        <Building2 className="text-white" size={40} />
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                        Crea tu Cuenta
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base font-medium">
                        Estás a un paso de digitalizar tu barbería
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-2xl shadow-green-500/50"
                            >
                                <CheckCircle2 className="text-white" size={40} />
                            </motion.div>

                            <h2 className="text-3xl font-black text-white mb-4">
                                ¡Cuenta Creada Exitosamente!
                            </h2>

                            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
                                <p className="text-slate-200 text-lg mb-3">
                                    Tu solicitud de registro ha sido recibida
                                </p>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Nuestro equipo revisará tu solicitud y te enviaremos un correo electrónico a <strong className="text-white">{formData.email}</strong> cuando tu cuenta sea aprobada.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg"
                                >
                                    Ir a Inicio de Sesión
                                    <ArrowRight size={20} />
                                </Link>
                                <p className="text-slate-500 text-xs">
                                    Recibirás un email cuando tu cuenta esté lista
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Error Message */}
                    {!success && error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
                        >
                            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-200 text-sm font-medium">{error}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    {!success && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Plan Selection */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block px-1">
                                    Selecciona tu Plan
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {plans.map((plan) => {
                                        const Icon = plan.icon;
                                        const isSelected = formData.planId === plan.id;

                                        return (
                                            <motion.button
                                                key={plan.id}
                                                type="button"
                                                onClick={() => handlePlanSelect(plan.id)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${isSelected
                                                    ? 'bg-white/10 border-white/30 shadow-xl'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center ${isSelected ? plan.glow + ' shadow-lg' : ''}`}>
                                                    <Icon className="text-white" size={20} />
                                                </div>
                                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                                    {plan.name}
                                                </span>
                                                {isSelected && (
                                                    <motion.div
                                                        layoutId="selectedPlan"
                                                        className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                                                    >
                                                        <CheckCircle2 size={14} className="text-white" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-5">
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
                                    <p className="text-xs text-slate-500 px-1 leading-relaxed">
                                        Mínimo 8 caracteres, debe incluir: mayúscula, minúscula y número
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className={`w-full bg-gradient-to-r ${selectedPlan.color} hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl ${selectedPlan.glow} flex items-center justify-center gap-2 group`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            Crear Cuenta
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
                    )}
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
            </motion.div >
        </div >
    );
};

export default Signup;
