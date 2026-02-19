import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight, Scissors, Sparkles } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        // En un sistema real, aquí llamaríamos al backend para verificar que el webhook 
        // ya procesó la sesión y creó la barbería.
        // Por ahora, simularemos una espera corta para dar tiempo al webhook.
        const verifySession = async () => {
            if (!sessionId) {
                setStatus('error');
                return;
            }

            // Simular verificación
            setTimeout(() => {
                setStatus('success');
            }, 3000);
        };

        verifySession();
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden"
            >
                {/* Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

                {status === 'verifying' && (
                    <div className="space-y-6">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto"
                            />
                            <Scissors className="absolute inset-0 m-auto w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Procesando tu suscripción...</h1>
                        <p className="text-zinc-400">Estamos preparando las tijeras y el peine para tu nueva barbería digital. Esto tomará solo unos segundos.</p>
                    </div>
                )}

                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-white">¡Bienvenido a la Familia!</h1>
                            <p className="text-zinc-400">Tu suscripción ha sido confirmada exitosamente. Se ha enviado un correo con tus credenciales de acceso.</p>
                        </div>

                        <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800 text-left space-y-4">
                            <div className="flex items-center gap-4">
                                <Sparkles className="text-purple-400 w-5 h-5" />
                                <p className="text-sm text-zinc-300">Ya puedes configurar tu primera sede y barberos.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="text-purple-400 w-5 h-5" />
                                <p className="text-sm text-zinc-300">Tu página pública ya está lista para recibir reservas.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
                        >
                            Comenzar ahora
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                            <CheckCircle2 className="w-10 h-10 text-red-500 rotate-45" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Algo salió mal</h1>
                        <p className="text-zinc-400">No pudimos verificar tu sesión de pago. Si el cargo ya se realizó, contacta a soporte.</p>
                        <Link to="/pricing" className="block text-purple-400 font-bold hover:underline">Volver a Intentar</Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
