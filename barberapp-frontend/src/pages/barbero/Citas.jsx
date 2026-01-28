import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getCitasBarbero } from "../../services/barberoDashboardService";
import {
  Card,
  Badge,
  Skeleton,
  Button,
  Input
} from "../../components/ui";
import {
  Search,
  Filter,
  Calendar,
  User,
  Scissors,
  Clock,
  Download,
  ChevronRight,
  History
} from "lucide-react";

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCitasBarbero();
      setCitas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar citas:", err);
      setError(err.response?.data?.message || err.message || "Error al cargar citas");
    } finally {
      setLoading(false);
    }
  };

  const citasFiltradas = citas.filter(c => {
    const matchesSearch =
      c.nombreCliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.servicioId?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "TODOS" || c.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="p-12 text-center bg-red-500/10 border border-red-500/20 rounded-3xl">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <History size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">¡Ups! Algo salió mal</h3>
        <p className="text-red-300/80 mb-6">{error}</p>
        <Button onClick={cargar} variant="secondary">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <span className="text-indigo-500"><History size={36} /></span>
            Historial de Citas
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Consulta y gestiona todos tus servicios realizados
          </p>
        </div>
      </header>

      {/* FILTROS Y BÚSQUEDA */}
      <Card className="p-4 border-slate-800 bg-slate-900/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <Input
            placeholder="Buscar por cliente o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search />}
          />

          <div className="flex gap-2 shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 text-slate-300 font-bold focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="COMPLETADA">Completadas</option>
              <option value="CANCELADA">Canceladas</option>
              <option value="RESERVADA">Próximas</option>
            </select>

            <Button variant="outline" className="border-slate-800 px-6 py-3 rounded-2xl">
              <Download size={20} className="mr-2" /> Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* LISTA DE CITAS */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height="h-24" />)
        ) : citasFiltradas.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-slate-800 bg-transparent">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
              <Scissors size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-400">No se encontraron citas</h3>
            <p className="text-slate-500 mt-2">Prueba ajustando los filtros o términos de búsqueda.</p>
            {searchTerm || filterStatus !== "TODOS" ? (
              <Button
                variant="ghost"
                onClick={() => { setSearchTerm(""); setFilterStatus("TODOS"); }}
                className="mt-4 text-indigo-400 hover:text-indigo-300"
              >
                Limpiar filtros
              </Button>
            ) : null}
          </Card>
        ) : (
          citasFiltradas.map((c) => (
            <Card
              key={c._id}
              className="border-slate-800 hover:border-slate-700 transition-all group overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center">
                {/* Lateral Indicator */}
                <div className={`w-1.5 h-full absolute left-0 top-0 ${c.estado === "COMPLETADA" ? "bg-emerald-500" :
                  c.estado === "CANCELADA" ? "bg-red-500" : "bg-indigo-500"
                  }`}></div>

                <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6 w-full">
                    <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                      <Scissors size={24} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-white">
                          {c.servicioId?.nombre || "Servicio"}
                        </h3>
                        <Badge
                          variant={
                            c.estado === "COMPLETADA" ? "success" :
                              c.estado === "CANCELADA" ? "error" : "primary"
                          }
                          className="text-[10px] uppercase font-black px-2 py-0.5"
                        >
                          {c.estado}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="text-indigo-400/70" /> {c.nombreCliente || "Cliente"}
                        </span>
                        <span className="text-slate-800 hidden md:block">•</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} /> {dayjs(c.fecha).format("DD MMM, YYYY")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> {c.hora}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 pt-4 md:pt-0 border-t border-slate-800 md:border-t-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Monto</p>
                      <p className="text-white font-black text-xl">
                        ${c.servicioId?.precio || 0}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-10 h-10 p-0 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white"
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
