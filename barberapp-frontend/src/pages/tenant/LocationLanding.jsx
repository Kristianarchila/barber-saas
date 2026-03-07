import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSedeInfo } from '../../services/multiSedeService';
import { BarberiaThemeProvider } from '../../context/BarberiaThemeContext';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import ModernTemplate from './templates/ModernTemplate';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LocationLanding() {
    const { marcaSlug, sedeSlug } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationData, setLocationData] = useState(null);

    useEffect(() => {
        loadLocationData();
    }, [marcaSlug, sedeSlug]);

    const loadLocationData = async () => {
        try {
            setLoading(true);
            const data = await getSedeInfo(marcaSlug, sedeSlug);
            setLocationData(data);
        } catch (err) {
            console.error('Error cargando sucursal:', err);
            setError('No se pudo cargar la informaci\u00f3n de esta sucursal');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} marcaSlug={marcaSlug} />;
    if (!locationData) return null;

    const { marca, sucursal, servicios, barberos } = locationData;

    // Preparar el  objeto barberia para que sea compatible con el template existente
    const barberiaData = {
        _id: sucursal._id,
        nombre: `${marca.nombre} - ${sucursal.nombre}`,
        slug: marca.slug,
        email: sucursal.email || marca.email,
        telefono: sucursal.telefono,
        direccion: sucursal.direccion,
        configuracion: {
            ...sucursal.configuracion,
            logoUrl: sucursal.configuracion?.logoUrl || marca.configuracionMatriz?.logoUrl,
            colorPrincipal: sucursal.configuracion?.colorPrincipal || marca.configuracionMatriz?.colorPrincipal,
            googleMapsUrl: sucursal.configuracion?.googleMapsUrl
        },
        ubicacion: sucursal.ubicacion,
        horarios: sucursal.horarios
    };

    // Preparar theme
    const theme = {
        logo: barberiaData.configuracion.logoUrl || '',
        colorPrimary: barberiaData.configuracion.colorPrincipal || '#D4AF37',
        colorAccent: barberiaData.configuracion.colorAccent || '#B8941F',
        heroImages: sucursal.configuracion?.galeria || [],
        nombre: sucursal.nombre,
        heroTitle: `${marca.nombre} ${sucursal.nombre}`,
        slogan: sucursal.configuracion?.mensajeBienvenida || 'M\u00e1s que un corte, una experiencia',
        badge: 'ESTUDIO Y EXCELENCIA',
        ctaPrimary: 'Reservar Turno',
        ctaSecondary: 'Ver Servicios',
        servicios: servicios || []
    };

    return (
        <ErrorBoundary>
            {/* Breadcrumb */}
            <Breadcrumb marca={marca} sucursal={sucursal} />

            {/* Template Normal (ya existenteJavaScript*/}
            <BarberiaThemeProvider theme={theme}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <ModernTemplate
                        barberia={barberiaData}
                        servicios={servicios}
                        barberos={barberos}
                        resenas={[]} // TODO: Cargar reseñas específicas de la sede
                    />
                </motion.div>
            </BarberiaThemeProvider>
        </ErrorBoundary>
    );
}

// Breadcrumb para navegación
function Breadcrumb({ marca, sucursal }) {
    return (
        <div className="bg-black border-b border-neutral-800 py-4 px-6">
            <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-neutral-400">
                <Link
                    to={`/${marca.slug}`}
                    className="hover:text-white transition-colors"
                >
                    {marca.nombre}
                </Link>
                <ChevronRight size={16} />
                <span className="text-white">{sucursal.nombre}</span>
            </div>
        </div>
    );
}

// Loading State
function LoadingState() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-500 text-sm uppercase tracking-wider">Cargando...</p>
            </div>
        </div>
    );
}

// Error State
function ErrorState({ error, marcaSlug }) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Sucursal no encontrada</h1>
                <p className="text-neutral-400 mb-8">{error}</p>
                <Link
                    to={`/${marcaSlug}`}
                    className="inline-block px-8 py-3 bg-gold/10 border border-gold/30 text-gold rounded-sm text-sm uppercase tracking-widest hover:bg-gold hover:text-black transition-all"
                >
                    Ver Todas las Ubicaciones
                </Link>
            </div>
        </div>
    );
}
