import { useBarberia } from "../../context/BarberiaContext";
import { BarberiaThemeProvider } from "../../context/BarberiaThemeContext";
import { ErrorBoundary } from "../../components/ui/ErrorBoundary";
import { SEOHead } from "../../components/ui/SEOHead";
import { AnalyticsScripts } from "../../components/ui/AnalyticsScripts";
import ThemeInjector from "../../components/ui/ThemeInjector";
import ModernTemplate from "./templates/ModernTemplate";
import PremiumTemplate from "./templates/PremiumTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import VintageTemplate from "./templates/VintageTemplate";
import BoldTemplate from "./templates/BoldTemplate";
import LuxuryTemplate from "./templates/LuxuryTemplate";
import RetroTemplate from "./templates/RetroTemplate";
import { motion } from "framer-motion";

/** Central template map — add new templates here only */
const TEMPLATE_MAP = {
  modern: ModernTemplate,
  premium: PremiumTemplate,
  minimal: MinimalTemplate,
  vintage: VintageTemplate,
  bold: BoldTemplate,
  luxury: LuxuryTemplate,
  retro: RetroTemplate,
};

export default function Home() {
  const { barberia, servicios, barberos, resenas, loading, error } = useBarberia();

  // Loading state
  if (loading) return <LoadingSpinner />;

  // Error state
  if (error || !barberia) {
    return <ErrorState error={error} />;
  }


  // Helper function to safely extract string values from potential value objects
  const extractValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object' && val._value !== undefined) return val._value;
    return val;
  };

  // Prepare theme data
  const theme = {
    template: extractValue(barberia.configuracion?.template) || 'modern',
    logo: extractValue(barberia.configuracion?.logoUrl) || '',
    colorPrimary: extractValue(barberia.configuracion?.colorPrincipal) || '#cc2b2b',
    colorAccent: extractValue(barberia.configuracion?.colorAccent) || '#1e3a8a',
    colorSuccess: extractValue(barberia.configuracion?.colorSuccess) || '#059669',
    colorWarning: extractValue(barberia.configuracion?.colorWarning) || '#f59e0b',
    colorLight: extractValue(barberia.configuracion?.colorLight) || '#f8fafc',
    colorDark: extractValue(barberia.configuracion?.colorDark) || '#0a0a0b',
    fontFamily: extractValue(barberia.configuracion?.fontFamily) || 'Inter',
    fontHeading: extractValue(barberia.configuracion?.fontHeading) || extractValue(barberia.configuracion?.fontFamily) || 'Inter',
    heroImages: barberia.configuracion?.galeria || [],
    nombre: extractValue(barberia.nombre),
    heroTitle: extractValue(barberia.configuracion?.heroTitle) || 'REDEFINIENDO EL ESTILO MASCULINO',
    slogan: extractValue(barberia.configuracion?.mensajeBienvenida) || 'Más que un corte, una experiencia. Descubre la excelencia en cada detalle.',
    badge: extractValue(barberia.configuracion?.badge) || 'ESTUDIO Y EXCELENCIA',
    ctaPrimary: extractValue(barberia.configuracion?.ctaPrimary) || 'Reservar Turno',
    ctaSecondary: extractValue(barberia.configuracion?.ctaSecondary) || 'Ver Servicios',
    // Real social links from barberia
    instagram: extractValue(barberia.configuracion?.instagram) || '',
    facebook: extractValue(barberia.configuracion?.facebook) || '',
    // Add servicios to theme
    servicios: servicios || [],
  };

  // 🎨 Dynamic template switcher — driven by barberia.configuracion.template
  const Template = TEMPLATE_MAP[theme.template] || ModernTemplate;

  // Extract custom categories (sorted by orden)
  const categorias = (barberia.configuracion?.categorias || [])
    .filter(c => c.nombre)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return (
    <ErrorBoundary>
      <SEOHead barberia={barberia} />
      <AnalyticsScripts barberia={barberia} />
      <BarberiaThemeProvider theme={theme}>
        <ThemeInjector theme={theme} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Template
            barberia={barberia}
            servicios={servicios}
            barberos={barberos}
            resenas={resenas}
            categorias={categorias}
          />
        </motion.div>
      </BarberiaThemeProvider>
    </ErrorBoundary>
  );
}

// Loading Spinner
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4" />
      <p className="text-neutral-500 text-sm uppercase tracking-wider">Cargando...</p>
    </div>
  </div>
);

// Error State
const ErrorState = ({ error }) => (
  <div className="min-h-screen bg-black flex items-center justify-center px-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full text-center"
    >
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-gold/30 flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-3xl font-serif italic text-white mb-4">
          Barbería no encontrada
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          {error || "No pudimos encontrar esta barbería. Verifica la URL o contacta al administrador."}
        </p>
      </div>

      <button
        onClick={() => window.location.href = '/'}
        className="px-8 py-3 bg-gold/10 border border-gold/30 text-gold rounded-full text-sm uppercase tracking-widest font-bold hover:bg-gold hover:text-black transition-all duration-300"
      >
        Volver al Inicio
      </button>
    </motion.div>
  </div>
);
