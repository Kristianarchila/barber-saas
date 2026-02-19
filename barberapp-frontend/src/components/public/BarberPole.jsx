import React from 'react';
import { motion } from 'framer-motion';

export default function BarberSeparator() {
    return (
        <div className="relative w-full h-2 overflow-hidden bg-white my-10">
            {/* Contenedor del patrón animado */}
            <motion.div
                className="absolute inset-0"
                animate={{ x: ['0%', '-100%'] }} // Movimiento de derecha a izquierda
                transition={{
                    duration: 10, // Más lento para que no distraiga al leer
                    repeat: Infinity,
                    ease: 'linear'
                }}
                style={{
                    background: `repeating-linear-gradient(
                        90deg,
                        #cc2b2b 0px,
                        #cc2b2b 30px,
                        white 30px,
                        white 60px,
                        #1e3a8a 60px,
                        #1e3a8a 90px,
                        white 90px,
                        white 120px
                    )`,
                    width: '200%', // Doble de ancho para que el bucle sea infinito
                }}
            />
            
            {/* Sombra interna para dar profundidad (efecto tubo) */}
            <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
            
            {/* Brillo sutil en el centro */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20" />
        </div>
    );
}