import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxSection() {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Parallax transforms - diferentes velocidades para cada capa
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

    // Memoizar arrays de estrellas para evitar regenerarlos en cada render
    const backgroundStars = useMemo(() => [...Array(20)].map((_, i) => ({
        key: `star-bg-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
        opacity: Math.random() * 0.6 + 0.2,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${Math.random() * 2 + 2}s`
    })), []);

    const foregroundStars = useMemo(() => [...Array(15)].map((_, i) => ({
        key: `star-fg-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 4 + 2}px`,
        height: `${Math.random() * 4 + 2}px`,
        opacity: Math.random() * 0.8 + 0.2,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        boxShadow: `0 0 ${Math.random() * 15 + 5}px rgba(255, 255, 255, 0.6)`
    })), []);

    return (
        <section
            ref={sectionRef}
            className="relative h-[600px] overflow-hidden"
            style={{
                position: 'relative',
                background: 'linear-gradient(to bottom, #0a0a0a 0%, #1a1f2e 50%, #0a0a0a 100%)'
            }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.5) 1px, transparent 0)',
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Capa 1: Estrellas de fondo (se mueven más rápido) */}
            <motion.div
                style={{ y: y1 }}
                className="absolute inset-0 pointer-events-none"
            >
                {backgroundStars.map((star) => (
                    <div
                        key={star.key}
                        className="absolute rounded-full animate-pulse"
                        style={{
                            left: star.left,
                            top: star.top,
                            width: star.width,
                            height: star.height,
                            backgroundColor: '#D4AF37',
                            opacity: star.opacity,
                            animationDelay: star.animationDelay,
                            animationDuration: star.animationDuration
                        }}
                    />
                ))}
            </motion.div>

            {/* Capa 2: Círculos concéntricos (velocidad media) */}
            <motion.div
                style={{ y: y2 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={`circle-${i}`}
                        className="absolute rounded-full border"
                        style={{
                            width: `${i * 250}px`,
                            height: `${i * 250}px`,
                            borderColor: 'rgba(212, 175, 55, 0.15)',
                            borderWidth: '1px',
                            animation: `pulse ${3 + i}s ease-in-out infinite`
                        }}
                    />
                ))}
            </motion.div>

            {/* Capa 3: Estrellas brillantes (se mueven más lento) */}
            <motion.div
                style={{ y: y3 }}
                className="absolute inset-0 pointer-events-none"
            >
                {foregroundStars.map((star) => (
                    <div
                        key={star.key}
                        className="absolute rounded-full animate-pulse"
                        style={{
                            left: star.left,
                            top: star.top,
                            width: star.width,
                            height: star.height,
                            backgroundColor: '#ffffff',
                            opacity: star.opacity,
                            animationDelay: star.animationDelay,
                            animationDuration: star.animationDuration,
                            boxShadow: star.boxShadow
                        }}
                    />
                ))}
            </motion.div>

            {/* Contenido Central */}
            <motion.div
                style={{ opacity }}
                className="absolute inset-0 flex items-center justify-center z-10"
            >
                <div className="text-center px-6 max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        {/* Línea decorativa superior */}
                        <div className="flex items-center justify-center gap-4">
                            <div
                                className="h-[2px] w-20"
                                style={{
                                    background: 'linear-gradient(to right, transparent, #D4AF37)'
                                }}
                            />
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: '#D4AF37' }}
                            />
                            <div
                                className="h-[2px] w-20"
                                style={{
                                    background: 'linear-gradient(to left, transparent, #D4AF37)'
                                }}
                            />
                        </div>

                        {/* Texto principal */}
                        <h2
                            className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight"
                            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                        >
                            Tradición y{' '}
                            <span
                                className="italic"
                                style={{ color: '#D4AF37' }}
                            >
                                Excelencia
                            </span>
                        </h2>

                        <p className="text-neutral-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            Más que un corte, una experiencia premium diseñada para el caballero moderno
                        </p>

                        {/* Línea decorativa inferior */}
                        <div className="flex items-center justify-center gap-4">
                            <div
                                className="h-[2px] w-20"
                                style={{
                                    background: 'linear-gradient(to right, transparent, #D4AF37)'
                                }}
                            />
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: '#D4AF37' }}
                            />
                            <div
                                className="h-[2px] w-20"
                                style={{
                                    background: 'linear-gradient(to left, transparent, #D4AF37)'
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Gradiente de transición inferior */}
            <div
                className="absolute bottom-0 left-0 right-0 h-40"
                style={{
                    background: 'linear-gradient(to top, #000000, transparent)'
                }}
            />
        </section>
    );
}
