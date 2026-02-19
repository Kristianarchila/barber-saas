import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Store, MapPin, Phone, ArrowRight, Star, ExternalLink, Building2 } from "lucide-react";
import { getMyBarberias } from "../../services/userService";
import { Card, Button, Badge } from "../../components/ui";

export default function Sucursales() {
    const [barberias, setBarberias] = useState([]);
    const [loading, setLoading] = useState(true);
    const { slug } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const data = await getMyBarberias();
                setBarberias(data);
            } catch (error) {
                console.error("Error cargando sedes:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleManage = (newSlug) => {
        navigate(`/${newSlug}/admin/dashboard`);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <Building2 className="text-blue-600" size={32} />
                        Gestión de Sedes
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Administra y alterna rápidamente entre tus diferentes sucursales corporativas.
                    </p>
                </div>
            </header>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm ring-1 ring-gray-100">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                        <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-200" size={24} />
                    </div>
                    <p className="mt-6 body-small text-gray-400 font-black uppercase tracking-widest text-[10px]">Sincronizando infrautilización...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {barberias.map((b, index) => (
                        <Card
                            key={b._id || b.id || index}
                            className={`group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 p-0 border-none ring-1 ${b.slug === slug ? "ring-blue-500 ring-2" : "ring-gray-100"
                                }`}
                        >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                {b.slug === slug ? (
                                    <Badge variant="premium" className="bg-blue-600 text-white border-none px-4 py-1.5 shadow-lg shadow-blue-500/30">
                                        Sede Actual
                                    </Badge>
                                ) : (
                                    <Badge variant="neutral" className="px-4 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Disponible
                                    </Badge>
                                )}
                            </div>

                            {/* Banner / Visual Identity Area */}
                            <div className="h-32 bg-gray-50 flex items-center justify-center relative overflow-hidden border-b border-gray-100">
                                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600 to-transparent"></div>
                                </div>
                                {b.logoUrl ? (
                                    <img src={b.logoUrl} alt={b.nombre} className="h-20 w-20 object-contain z-10 drop-shadow-sm group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="h-20 w-20 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center text-4xl font-black text-blue-600 z-10 group-hover:scale-110 transition-transform duration-500">
                                        {b.nombre.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Details Area */}
                            <div className="p-8 space-y-6">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                        {b.nombre}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <p className="caption font-black text-gray-400 uppercase tracking-tighter">ID: {b.slug}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50/50 rounded-lg text-blue-500">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="caption text-gray-400 font-bold uppercase tracking-widest text-[8px] mb-0.5">Ubicación</p>
                                            <p className="body-small text-gray-600 font-bold leading-snug">{b.direccion || "Dirección Corporativa"}</p>
                                        </div>
                                    </div>
                                    {b.telefono && (
                                        <div className="flex items-start gap-3 text-neutral-400">
                                            <div className="p-2 bg-indigo-50/50 rounded-lg text-indigo-500">
                                                <Phone size={16} />
                                            </div>
                                            <div>
                                                <p className="caption text-gray-400 font-bold uppercase tracking-widest text-[8px] mb-0.5">Contacto</p>
                                                <p className="body-small text-gray-600 font-bold">{b.telefono}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <Button
                                        onClick={() => handleManage(b.slug)}
                                        disabled={b.slug === slug}
                                        className="flex-[2] rounded-2xl font-black uppercase tracking-widest"
                                        variant={b.slug === slug ? "ghost" : "primary"}
                                    >
                                        {b.slug === slug ? "Entorno Activo" : "Gestionar Sede"}
                                    </Button>
                                    <a
                                        href={`/${b.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 rounded-2xl bg-gray-50 hover:bg-white text-gray-400 hover:text-blue-600 transition-all border border-gray-100 hover:shadow-lg flex items-center justify-center group/link"
                                        title="Visitar Frontend Público"
                                    >
                                        <ExternalLink size={20} className="group-hover/link:scale-110 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
