import React, { useState } from 'react';
import { Home, Scissors, Calendar, Users } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export default function MobileBottomNav() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const location = useLocation();
    const [activeRipple, setActiveRipple] = useState(null);

    const navItems = [
        { icon: Home, label: 'Inicio', path: `/${slug}` },
        { icon: Scissors, label: 'Servicios', section: 'servicios' },
        { icon: Calendar, label: 'Reservar', path: `/${slug}/book` },
        { icon: Users, label: 'Equipo', section: 'barberos' },
    ];

    const handleNavClick = (item, index) => {
        // Haptic feedback (si el navegador lo soporta)
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }

        // Ripple visual
        setActiveRipple(index);
        setTimeout(() => setActiveRipple(null), 400);

        if (item.path) {
            navigate(item.path);
        } else if (item.section) {
            const el = document.getElementById(item.section);
            if (location.pathname === `/${slug}` && el) {
                el.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate(`/${slug}`);
                setTimeout(() => document.getElementById(item.section)?.scrollIntoView({ behavior: 'smooth' }), 200);
            }
        }
    };

    return (
        <>
            {/* Spacer para que el contenido no quede oculto detrás del nav */}
            <div className="h-20 lg:hidden" />

            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] pb-[env(safe-area-inset-bottom)]">
                {/* Blur backdrop superior */}
                <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                
                <nav className="relative bg-white/80 backdrop-blur-2xl border-t border-neutral-200/50">
                    <div className="flex items-end justify-around px-4 pt-2 pb-1">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || 
                                           (item.section && location.hash === `#${item.section}`);
                            
                            return (
                                <button 
                                    key={item.label} 
                                    onClick={() => handleNavClick(item, index)}
                                    className="relative flex flex-col items-center min-w-[60px] py-1.5 touch-manipulation"
                                    style={{ 
                                        WebkitTapHighlightColor: 'transparent',
                                        animation: `navFadeIn 0.3s ease-out ${index * 0.05}s both`
                                    }}
                                >
                                    {/* Ripple effect */}
                                    {activeRipple === index && (
                                        <div className="absolute inset-0 -m-2">
                                            <div className="w-full h-full bg-rose-500/20 rounded-full animate-ping-once" />
                                        </div>
                                    )}

                                    {/* Background activo */}
                                    <div className={`absolute -inset-2 rounded-2xl transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-rose-50 scale-100 opacity-100' 
                                            : 'bg-transparent scale-90 opacity-0'
                                    }`} />

                                    {/* Icon */}
                                    <div className={`relative mb-0.5 transition-all duration-200 ${
                                        isActive ? 'scale-100' : 'scale-90'
                                    }`}>
                                        <Icon 
                                            size={24} 
                                            className={`transition-colors duration-200 ${
                                                isActive 
                                                    ? 'text-rose-600' 
                                                    : 'text-neutral-400'
                                            }`}
                                            strokeWidth={isActive ? 2.5 : 2} 
                                        />
                                    </div>

                                    {/* Label */}
                                    <span className={`relative text-[11px] font-medium transition-all duration-200 ${
                                        isActive 
                                            ? 'text-rose-600 scale-100' 
                                            : 'text-neutral-500 scale-95'
                                    }`}>
                                        {item.label}
                                    </span>

                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute -bottom-0.5 w-1 h-1 bg-rose-600 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Home indicator iOS-style */}
                    <div className="flex justify-center pt-1 pb-1">
                        <div className="w-32 h-1 bg-neutral-900/20 rounded-full" />
                    </div>
                </nav>
            </div>

            <style jsx>{`
                @keyframes navFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes ping-once {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }

                .animate-ping-once {
                    animation: ping-once 0.4s cubic-bezier(0, 0, 0.2, 1);
                }

                /* Touch optimization */
                button {
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    user-select: none;
                }
            `}</style>
        </>
    );
}