import { useEffect, useState } from "react";
import { getPerfilBarbero } from "../../services/barberoDashboardService";
import {
  Card,
  Avatar,
  Badge,
  Button,
  Skeleton
} from "../../components/ui";
import {
  User,
  Mail,
  Briefcase,
  Settings,
  Award,
  ChevronRight,
  Star,
  Edit3
} from "lucide-react";

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPerfilBarbero();
      setPerfil(data);
    } catch (err) {
      console.error("Error al cargar perfil:", err);
      setError(err.response?.data?.message || err.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-32 h-32 bg-slate-800 rounded-full" />
          <div className="space-y-3 flex-1">
            <div className="h-8 bg-slate-800 rounded w-64" />
            <div className="h-4 bg-slate-800 rounded w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-red-500/10 border border-red-500/20 rounded-3xl">
        <User size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error de perfil</h3>
        <p className="text-red-300/80 mb-6">{error}</p>
        <Button onClick={cargar} variant="secondary">Reintentar</Button>
      </div>
    );
  }

  if (!perfil) return null;

  return (
    <div className="space-y-10 animate-slide-in">
      {/* PROFILE HEADER */}
      <header className="flex flex-col md:flex-row items-center gap-8 bg-slate-900/40 p-10 rounded-[40px] border border-slate-800/50 backdrop-blur-xl">
        <div className="relative group">
          <Avatar
            name={perfil.nombre}
            src={perfil.usuario?.foto}
            size="xl"
            className="border-4 border-indigo-500/30 group-hover:border-indigo-500 shadow-glow-sm transition-all"
          />
          <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-xl shadow-xl text-white">
            <Award size={20} />
          </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-5xl font-black text-white tracking-tight">
              {perfil.nombre}
            </h1>
            <Badge variant={perfil.activo ? "success" : "neutral"} className="px-3 py-1">
              {perfil.activo ? "✓ Verificado" : "Pendiente"}
            </Badge>
          </div>
          <p className="text-slate-400 text-lg mt-2 flex items-center justify-center md:justify-start gap-2">
            <Mail size={18} className="text-indigo-400" />
            {perfil.usuario?.email}
          </p>

          <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
            <Button variant="outline" size="sm" className="rounded-xl">
              <Edit3 size={16} className="mr-2" /> Editar Perfil
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CAREER STATS */}
        <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-4 text-indigo-400">
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <Briefcase size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Mi Carrera Profesionalmente</h3>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Experiencia</p>
                  <p className="text-2xl font-black text-white mt-1">{perfil.experiencia || 0} Años</p>
                </div>
                <div className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-lg">Master</div>
              </div>

              <div className="space-y-4">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Especialidades</p>
                <div className="flex flex-wrap gap-2">
                  {(perfil.especialidades || []).map((e, i) => (
                    <Badge key={i} variant="primary" className="px-4 py-2 text-sm font-bold rounded-xl border border-indigo-500/20">
                      {e}
                    </Badge>
                  ))}
                  {perfil.especialidades?.length === 0 && <p className="text-slate-600 text-sm italic">Sin especialidades configuradas</p>}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ACCOUNT INFO & ACTIONS */}
        <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-4 text-indigo-400">
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <Settings size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Configuración del Profesional</h3>
            </div>

            <div className="divide-y divide-slate-800/50">
              <div className="py-4 flex justify-between items-center group cursor-pointer">
                <div>
                  <p className="text-white font-bold">Estado del Panel</p>
                  <p className="text-slate-500 text-sm">Tu cuenta está visible para clientes</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 text-sm font-bold">Activo</span>
                  <ChevronRight size={18} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              <div className="py-4 flex justify-between items-center group cursor-pointer">
                <div>
                  <p className="text-white font-bold">Horarios de Trabajo</p>
                  <p className="text-slate-500 text-sm">Gestiona tus disponibilidades</p>
                </div>
                <ChevronRight size={18} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>

              <div className="py-4 flex justify-between items-center group cursor-pointer opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                <div>
                  <p className="text-white font-bold">Integración Bancaria</p>
                  <p className="text-slate-500 text-sm">Configura dónde recibir tus pagos</p>
                </div>
                <Badge variant="neutral">Próximamente</Badge>
              </div>
            </div>

            <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-2xl py-4 mt-4">
              Solicitar desactivación temporal
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
