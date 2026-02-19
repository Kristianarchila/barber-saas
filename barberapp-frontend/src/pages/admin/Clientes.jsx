import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Calendar,
  Mail,
  ExternalLink,
  UserPlus,
  Filter,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Card, Button, Input, Badge } from "../../components/ui";
import { getClientesBarberia, createCliente } from "../../services/crmService";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useApiCall } from "../../hooks/useApiCall";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { toast } from "react-hot-toast";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Create Client State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "" });

  const navigate = useNavigate();

  const slug = window.location.pathname.split("/")[1];

  useEffect(() => {
    fetchClientes();
  }, []);

  // Hook para cargar clientes con manejo de errores
  const { execute: fetchClientes, loading, error } = useApiCall(
    getClientesBarberia,
    {
      errorMessage: 'Error al cargar clientes',
      onSuccess: (data) => setClientes(data)
    }
  );

  // Hook para crear cliente con protección
  const { execute: handleCreateCliente, loading: creating } = useAsyncAction(
    async () => {
      // Validación de campos
      if (!formData.nombre || !formData.email || !formData.password) {
        toast.error('Completa todos los campos obligatorios');
        throw new Error('Campos faltantes');
      }

      return await createCliente(formData);
    },
    {
      successMessage: 'Cliente creado exitosamente',
      errorMessage: 'Error al crear cliente',
      onSuccess: () => {
        setShowModal(false);
        setFormData({ nombre: "", email: "", password: "" });
        fetchClientes();
      }
    }
  );

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center body-large text-gray-600">Cargando base de clientes...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 lg:pb-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="heading-1 flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            Gestión de Clientes
          </h1>
          <p className="body-large text-gray-600 mt-2">
            Base de datos y fidelización de tu barbería
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-ghost">
            <Filter size={18} className="mr-2" />
            Filtros
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <UserPlus size={18} className="mr-2" />
            Nuevo Cliente
          </button>
        </div>
      </header >

      {/* MODAL NUEVO CLIENTE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="card card-padding w-full max-w-md relative animate-in zoom-in-95">
            <h2 className="heading-3 mb-6">Registrar Cliente</h2>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="label">Nombre Completo</label>
                <input
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input"
                />
              </div>

              <div className="space-y-2">
                <label className="label">Email</label>
                <input
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>

              <div className="space-y-2">
                <label className="label">Contraseña Temporal</label>
                <input
                  type="password"
                  placeholder="******"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8 border-t border-gray-100 pt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-ghost flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCliente}
                disabled={creating || !formData.nombre || !formData.email || !formData.password}
                className="btn btn-primary flex-1"
              >
                {creating ? "Creando..." : "Crear Cliente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUSCADOR */}
      <div className="card card-padding">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            placeholder="Buscar por nombre o email..."
            className="input py-6 text-lg"
            style={{ paddingLeft: '3rem' }}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* GRID DE CLIENTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientesFiltrados.length > 0 ? (
          clientesFiltrados.map((cliente) => (
            <div
              key={cliente._id}
              className="card hover:shadow-lg transition-all border border-gray-100 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-blue-600">
                    <div className="text-xl font-black">
                      {cliente.nombre.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="badge">Cliente</span>
                </div>

                <div className="mt-5">
                  <h3 className="heading-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {cliente.nombre}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 mt-2 body-small">
                    <Mail size={14} className="text-gray-400" />
                    {cliente.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 mt-1 body-small">
                    <Calendar size={14} className="text-gray-400" />
                    Desde {dayjs(cliente.createdAt).format('DD/MM/YYYY')}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="caption text-gray-400 font-bold uppercase tracking-wider">CRM Barbería</span>
                <button
                  onClick={() => navigate(`/${slug}/admin/clientes/${cliente._id}/ficha`)}
                  className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all"
                >
                  VER FICHA <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center">
            <Users size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="body text-gray-500 font-bold">No se encontraron clientes registrados</p>
          </div>
        )}
      </div>
    </div >
  );
}