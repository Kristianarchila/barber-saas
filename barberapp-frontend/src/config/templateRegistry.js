/**
 * Template Registry — single source of truth for all available templates.
 * Used by: Home.jsx (switcher), SiteConfig.jsx (picker), SuperAdmin (assignment), Landing.jsx (showcase).
 */
export const TEMPLATES = [
    {
        key: 'modern',
        name: 'Modern Dark',
        description: 'Oscuro, elegante y con efecto parallax. Perfecto para barberías urbanas premium.',
        plan: 'free',
        emoji: '🖤',
        tags: ['Oscuro', 'Parallax', 'Moderno'],
        preview: null, // Se genera dinámicamente con screenshot del template
    },
    {
        key: 'premium',
        name: 'Premium Impact',
        description: 'Hero full-screen de alto impacto. Transmite exclusividad desde el primer scroll.',
        plan: 'free',
        emoji: '⚡',
        tags: ['Bold', 'Full-screen', 'Premium'],
        preview: null,
    },
    {
        key: 'minimal',
        name: 'Minimal Clean',
        description: 'Blanco puro, tipografía elegante y mucho espacio. Calidad sin ruido visual.',
        plan: 'pro',
        emoji: '🤍',
        tags: ['Blanco', 'Minimalista', 'Elegante'],
        preview: null,
    },
    {
        key: 'vintage',
        name: 'Vintage Barbershop',
        description: 'Estética de barbería clásica años \'50. Sepia, serif y detalles ornamentales.',
        plan: 'pro',
        emoji: '✂️',
        tags: ['Clásico', 'Serif', 'Cálido'],
        preview: null,
    },
    {
        key: 'bold',
        name: 'Bold & Color',
        description: 'Tu color principal toma el protagonismo. Geométrico, vivo y memorable.',
        plan: 'premium',
        emoji: '🎨',
        tags: ['Color', 'Geométrico', 'Llamativo'],
        preview: null,
    },
    {
        key: 'luxury',
        name: 'Luxury Gold',
        description: 'Negro absoluto y dorado. Tipografía serif, animaciones suaves. Ultra premium.',
        plan: 'premium',
        emoji: '👑',
        tags: ['Negro', 'Dorado', 'Serif'],
        preview: null,
    },
    {
        key: 'retro',
        name: 'Retro Classic',
        description: 'Barbería americana de los años \'50. Colores de barbería, tipografía vintage.',
        plan: 'pro',
        emoji: '✂️',
        tags: ['Retro', 'Vintage', 'Americano'],
        preview: null,
    },
];

/** Plan hierarchy for gate comparisons */
const PLAN_ORDER = { free: 0, basico: 0, pro: 1, premium: 2 };

/** Returns templates available for a given plan */
export function getAvailableTemplates(plan = 'free') {
    const planLevel = PLAN_ORDER[plan?.toLowerCase()] ?? 0;
    return TEMPLATES.map(t => ({
        ...t,
        locked: PLAN_ORDER[t.plan] > planLevel,
    }));
}

/** Get a single template config by key */
export function getTemplate(key) {
    return TEMPLATES.find(t => t.key === key) || TEMPLATES[0];
}

export const PLAN_LABELS = {
    free: null,
    basico: null,
    pro: 'Plan Pro',
    premium: 'Plan Premium',
};
