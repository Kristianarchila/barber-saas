import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

/**
 * ThemePreview Component
 * Displays a visual preview card of a theme preset
 */
export default function ThemePreview({ theme, isSelected, onSelect }) {
    return (
        <motion.button
            onClick={() => onSelect(theme)}
            className={`
                relative w-full p-4 rounded-xl border-2 transition-all
                ${isSelected
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Selected Indicator */}
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-amber-500 text-black rounded-full p-1.5 shadow-lg"
                >
                    <Check size={16} strokeWidth={3} />
                </motion.div>
            )}

            {/* Theme Name */}
            <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-amber-500" />
                <h3 className="font-bold text-white text-left">{theme.name}</h3>
            </div>

            {/* Color Preview */}
            <div className="flex gap-2 mb-3">
                <div
                    className="flex-1 h-16 rounded-lg shadow-inner relative overflow-hidden group"
                    style={{ backgroundColor: theme.colorPrimary }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute bottom-1 left-2 text-[10px] font-mono text-white/80 bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        Principal
                    </span>
                </div>
                <div
                    className="flex-1 h-16 rounded-lg shadow-inner relative overflow-hidden group"
                    style={{ backgroundColor: theme.colorAccent }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute bottom-1 left-2 text-[10px] font-mono text-white/80 bg-black/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        Acento
                    </span>
                </div>
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-400 text-left">{theme.description}</p>

            {/* Color Codes */}
            <div className="mt-3 pt-3 border-t border-neutral-800 flex gap-2 text-[10px] font-mono">
                <span className="text-neutral-500">{theme.colorPrimary}</span>
                <span className="text-neutral-700">•</span>
                <span className="text-neutral-500">{theme.colorAccent}</span>
            </div>
        </motion.button>
    );
}
