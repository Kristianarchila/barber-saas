import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getPerfilBarbero, updatePerfilBarbero } from "../../services/barberoDashboardService";
import { Card, Button, Input, Badge, Stat, Modal } from "../../components/ui";
import DisponibilidadModal from "../../components/barbero/DisponibilidadModal";
import EspecialidadesModal from "../../components/barbero/EspecialidadesModal";
import AvatarUpload from "../../components/common/AvatarUpload";
import uploadService from "../../services/uploadService";
import {
  User,
  Mail,
  Phone,
  Award,
  Settings,
  Save,
  Camera,
  Star,
  Clock,
  Scissors
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function Perfil() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [disponibilidadOpen, setDisponibilidadOpen] = useState(false);
  const [especialidadesOpen, setEspecialidadesOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    especialidades: [],
    bio: "",
    avatar: ""
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoadingData(true);
      const perfil = await getPerfilBarbero();
      setFormData({
        nombre: perfil.nombre || user?.nombre || "",
        email: perfil.email || user?.email || "",
        telefono: perfil.telefono || "",
        especialidades: perfil.especialidades || [],
        bio: perfil.bio || "",
        avatar: perfil.avatar || ""
      });
    } catch (err) {
      console.error("Error cargando perfil:", err);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePerfilBarbero({
        nombre: formData.nombre,
        telefono: formData.telefono,
        bio: formData.bio,
        especialidades: formData.especialidades
      });
      toast.success("Perfil actualizado correctamente");
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      toast.error(err.response?.data?.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      setUploadingAvatar(true);
      const result = await uploadService.uploadBarberoAvatar(file);
      setFormData(prev => ({ ...prev, avatar: result.url }));
      toast.success("Foto actualizada correctamente");
    } catch (err) {
      console.error("Error subiendo avatar:", err);
      toast.error(err.response?.data?.message || "Error al subir la foto");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEspecialidadesSave = async (nuevasEspecialidades) => {
    try {
      await updatePerfilBarbero({
        especialidades: nuevasEspecialidades
      });
      setFormData(prev => ({ ...prev, especialidades: nuevasEspecialidades }));
      toast.success("Especialidades actualizadas");
    } catch (err) {
      console.error("Error actualizando especialidades:", err);
      toast.error("Error al actualizar especialidades");
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-96 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
      {/* HEADER PERFIL */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <AvatarUpload
            currentAvatar={formData.avatar}
            onUpload={handleAvatarUpload}
            loading={uploadingAvatar}
          />
          <div className="space-y-1">
            <h1 className="heading-1">{formData.nombre || "Cargando..."}</h1>
            <p className="body-large text-gray-600">Barbero Profesional • {user?.rol}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="info" className="bg-blue-50 text-blue-600 border-none px-4 py-2 text-sm font-semibold">
            <Star size={14} className="mr-2 inline" /> 4.9 (120 reseñas)
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INFORMACIÓN PRINCIPAL */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-8 border-gray-200 bg-white rounded-xl shadow-sm">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="heading-3 flex items-center gap-2">
                  <User className="text-blue-600" size={20} /> Información Personal
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="caption text-gray-400">Nombre Completo</label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="bg-white border-gray-200 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="caption text-gray-400">Correo Electrónico</label>
                  <Input
                    value={formData.email}
                    disabled
                    className="bg-gray-50 border-gray-200 rounded-lg opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="caption text-gray-400">Teléfono</label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="bg-white border-gray-200 focus:border-blue-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="caption text-gray-400">Biografía</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={1}
                    className="w-full bg-white border border-gray-200 focus:border-blue-500 rounded-lg p-3 text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-10 py-3 font-semibold">
                  <Save size={18} className="mr-2" /> Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>

          {/* ESPECIALIDADES */}
          <Card className="p-8 border-gray-200 bg-white rounded-xl shadow-sm">
            <div className="space-y-6">
              <h3 className="heading-3 flex items-center gap-2">
                <Award className="text-blue-600" size={20} /> Especialidades & Disciplinas
              </h3>

              <div className="flex flex-wrap gap-3">
                {formData.especialidades.map((esp, i) => (
                  <Badge key={i} variant="neutral" className="border-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                    {esp}
                  </Badge>
                ))}
                <button
                  onClick={() => setEspecialidadesOpen(true)}
                  className="px-4 py-2 border border-dashed border-gray-300 text-gray-500 rounded-lg hover:text-gray-900 hover:border-gray-400 transition-all"
                >
                  + {formData.especialidades.length > 0 ? 'Editar' : 'Agregar'}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* STATS & QUICK ACTIONS */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 border-gray-200 bg-white rounded-xl shadow-sm space-y-8">
            <h3 className="heading-3 flex items-center gap-2">
              <Settings className="text-blue-600" size={20} /> Mi Carrera
            </h3>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <Scissors size={20} />
                </div>
                <div>
                  <p className="caption text-gray-400">Servicios Totales</p>
                  <p className="text-gray-900 font-bold">1,240 cortes</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="caption text-gray-400">Experiencia</p>
                  <p className="text-gray-900 font-bold">5 años</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-blue-900 text-xs leading-relaxed">
                Tu perfil es visible para los clientes en el proceso de reserva de la sucursal.
              </p>
            </div>
          </Card>

          <Button variant="outline" onClick={() => setDisponibilidadOpen(true)} className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg py-4">
            Gestionar Disponibilidad
          </Button>
        </div>
      </div>

      {/* DISPONIBILIDAD MODAL */}
      <DisponibilidadModal
        isOpen={disponibilidadOpen}
        onClose={() => setDisponibilidadOpen(false)}
      />

      {/* ESPECIALIDADES MODAL */}
      <Modal isOpen={especialidadesOpen} onClose={() => setEspecialidadesOpen(false)} size="lg">
        <EspecialidadesModal
          especialidades={formData.especialidades}
          onSave={handleEspecialidadesSave}
          onClose={() => setEspecialidadesOpen(false)}
        />
      </Modal>
    </div>
  );
}
