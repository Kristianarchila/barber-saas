import React from 'react';
import { Check, Sparkles, Zap, Trophy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const plans = [
    {
        id: 'basico',
        name: 'Básico',
        price: '29.990',
        description: 'Ideal para barberos independientes o locales pequeños.',
        icon: Zap,
        color: 'from-blue-500 to-blue-600',
        features: [
            'Hasta 3 barberos',
            '100 reservas al mes',
            'Hasta 10 servicios',
            'Gestión de horarios',
            'Reservas online 24/7',
            'Panel de control básico'
        ],
        buttonText: 'Empezar ahora',
        recommended: false
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '59.990',
        description: 'Perfecto para barberías en crecimiento con equipo.',
        icon: Sparkles,
        color: 'from-purple-500 to-indigo-600',
        features: [
            'Hasta 10 barberos',
            '500 reservas al mes',
            'Servicios ilimitados',
            'Notificaciones por Email',
            'Reportes avanzados',
            'Integración con WhatsApp',
            'Personalización visual'
        ],
        buttonText: 'Prueba Pro gratis',
        recommended: true
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '99.990',
        description: 'Para grandes barberías y franquicias sin límites.',
        icon: Trophy,
        color: 'from-amber-500 to-orange-600',
        features: [
            'Barberos ilimitados',
            'Reservas ilimitadas',
            'Todo lo de Pro',
            'Soporte prioritario 24/7',
            'Múltiples administradores',
            'Gestión multi-sede',
            'API de integración'
        ],
        buttonText: 'Contactar ventas',
        recommended: false
    }
];

const PricingCard = ({ plan }) => {
    const navigate = useNavigate();
    const Icon = plan.icon;

    const handleSelect = () => {
        navigate(`/auth/signup?plan=${plan.id}`);
    };

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className={`relative flex flex-col p-8 bg-zinc-900/50 border ${plan.recommended ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-zinc-800'
                } rounded-3xl overflow-hidden backdrop-blur-xl`}
        >
            {plan.recommended && (
                <div className="absolute top-0 right-0 mt-4 mr-4">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white uppercase bg-purple-500 rounded-full">
                        Recomendado
                    </span>
                </div>
            )}

            <div className={`w-12 h-12 mb-6 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-zinc-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>

            <div className="flex items-baseline mb-8">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-zinc-500 ml-2">/mes (CLP)</span>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-zinc-300 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
                        {feature}
                    </li>
                ))}
            </ul>

            <button
                onClick={handleSelect}
                className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${plan.recommended
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
            >
                {plan.buttonText}
                <ArrowRight className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

const Pricing = () => {
    return (
        <div className="min-h-screen bg-black py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm mb-6"
                    >
                        <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                        Precio simple, sin sorpresas
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight"
                    >
                        Impulsa tu barbería al <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                            siguiente nivel
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg max-w-2xl mx-auto"
                    >
                        Escoge el plan que mejor se adapte a tus necesidades. Prueba cualquiera de nuestros planes GRATIS por 14 días.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 3) }}
                        >
                            <PricingCard plan={plan} />
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 text-center"
                >
                    <p className="text-zinc-500 text-sm">
                        ¿Tienes dudas? <a href="#" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">Habla con un asesor por WhatsApp</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Pricing;
