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
import ExportButton from "../../components/common/ExportButton";
import { exportCitasToCSV, exportCitasToPDF } from "../../utils/exportUtils";
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Scissors,
  Clock,
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
      <div className="p-12 text-center bg-red-50 border border-red-100 rounded-xl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <History size={32} className="text-red-600" />
        </div>
        <h3 className="heading-3 text-gray-900 mb-2">¡Ups! Algo salió mal</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={cargar} variant="primary">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="heading-1 flex items-center gap-3">
            <History className="text-blue-600" size={32} />
            Historial de Citas
          </h1>
          <p className="body-large text-gray-600 mt-2">
            Consulta y gestiona todos tus servicios realizados
          </p>
        </div>
      </header>

      {/* FILTROS Y BÚSQUEDA */}
      <Card className="p-4 border-gray-200 bg-white shadow-sm">
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
              className="bg-white border border-gray-200 rounded-lg px-6 py-3 text-gray-700 font-semibold focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="COMPLETADA">Completadas</option>
              <option value="CANCELADA">Canceladas</option>
              <option value="RESERVADA">Próximas</option>
            </select>

            <ExportButton
              onExportCSV={() => exportCitasToCSV(citasFiltradas, `citas-${dayjs().format('YYYY-MM-DD')}`)}
              onExportPDF={() => exportCitasToPDF(citasFiltradas, `citas-${dayjs().format('YYYY-MM-DD')}`)}
            />
          </div>
        </div>
      </Card>

      {/* LISTA DE CITAS */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height="h-24" />)
        ) : citasFiltradas.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-gray-200 bg-gray-50">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Scissors size={40} />
            </div>
            <h3 className="heading-3 text-gray-400">No se encontraron citas</h3>
            <p className="text-gray-500 mt-2">Prueba ajustando los filtros o términos de búsqueda.</p>
            {searchTerm || filterStatus !== "TODOS" ? (
              <Button
                variant="ghost"
                onClick={() => { setSearchTerm(""); setFilterStatus("TODOS"); }}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Limpiar filtros
              </Button>
            ) : null}
          </Card>
        ) : (
          citasFiltradas.map((c) => (
            <Card
              key={c._id}
              className="border-gray-200 hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center">
                {/* Lateral Indicator */}
                <div className={`w-1.5 h-full absolute left-0 top-0 ${c.estado === "COMPLETADA" ? "bg-green-500" :
                  c.estado === "CANCELADA" ? "bg-red-500" : "bg-blue-500"
                  }`}></div>

                <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6 w-full">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                      <Scissors size={24} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          {c.servicioId?.nombre || "Servicio"}
                        </h3>
                        <Badge
                          variant={
                            c.estado === "COMPLETADA" ? "success" :
                              c.estado === "CANCELADA" ? "error" : "info"
                          }
                          className="text-xs uppercase font-bold px-2 py-0.5"
                        >
                          {c.estado}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="text-blue-600" /> {c.nombreCliente || "Cliente"}
                        </span>
                        <span className="text-gray-300 hidden md:block">•</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} /> {dayjs(c.fecha).format("DD MMM, YYYY")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> {c.hora}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 pt-4 md:pt-0 border-t border-gray-100 md:border-t-0">
                    <div className="text-right">
                      <p className="caption text-gray-400">Monto</p>
                      <p className="text-gray-900 font-black text-xl">
                        ${c.servicioId?.precio || 0}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-10 h-10 p-0 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900"
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
