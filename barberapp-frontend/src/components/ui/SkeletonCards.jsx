import { motion } from 'framer-motion';

/**
 * SkeletonCard - Componente de carga para ServiceCard
 * Muestra un placeholder animado mientras cargan los servicios
 */
export const SkeletonServiceCard = () => {
    return (
        <div className="min-w-[300px] snap-center glass-premium p-10 rounded-[3rem] relative overflow-hidden border-white/5">
            <div className="animate-pulse">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-20 bg-gold/10 rounded-full" />
                    <div className="h-6 w-6 bg-white/5 rounded" />
                </div>

                {/* Title */}
                <div className="h-8 w-3/4 bg-white/5 rounded mb-2" />

                {/* Subtitle */}
                <div className="h-3 w-1/2 bg-white/5 rounded mb-8" />

                {/* Footer */}
                <div className="flex justify-between items-end border-t border-white/5 pt-6">
                    <div>
                        <div className="h-3 w-16 bg-white/5 rounded mb-2" />
                        <div className="h-10 w-20 bg-white/5 rounded" />
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/5" />
                </div>
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
};

/**
 * SkeletonBarberCard - Componente de carga para BarberCard
 */
export const SkeletonBarberCard = () => {
    return (
        <div className="min-w-[260px] snap-center h-[400px] rounded-[2rem] overflow-hidden bg-neutral-900 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-8">
                <div className="animate-pulse">
                    <div className="h-3 w-24 bg-gold/20 rounded mb-2" />
                    <div className="h-8 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-40 bg-white/10 rounded" />
                </div>
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
};
