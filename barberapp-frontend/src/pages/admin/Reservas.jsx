// src/pages/admin/Reservas.jsx
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { getBarberos } from "../../services/barberosService";
import { getTurnosDia, completarReserva, cancelarReserva } from "../../services/turnosService";

export default function ReservasAdmin() {
  const [barberos, setBarberos] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));

  const [turnos, setTurnos] = useState([]);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar barberos para elegir
  useEffect(() => {
    getBarberos().then(data => setBarberos(data));
  }, []);

  // Cuando cambie barbero o fecha, traer turnos
  useEffect(() => {
    if (!selectedBarbero) return;
    fetchTurnos();
  }, [selectedBarbero, fecha]);

  async function fetchTurnos() {
    setLoading(true);
    try {
      const data = await getTurnosDia(selectedBarbero._id, fecha);
      setResumen(data.resumen);
      setTurnos(data.turnos);
    } catch (err) {
      console.log("Error cargando reservas:", err);
    }
    setLoading(false);
  }

  // Acciones
  async function handleCompletar(id) {
    await completarReserva(id);
    fetchTurnos();
  }

  async function handleCancelar(id) {
    await cancelarReserva(id);
    fetchTurnos();
  }

  const getEstadoColor = (estado) => {
    switch(estado) {
      case "RESERVADA": return "bg-blue-500/20 text-blue-300 border border-blue-500/50";
      case "COMPLETADA": return "bg-green-500/20 text-green-300 border border-green-500/50";
      case "CANCELADA": return "bg-red-500/20 text-red-300 border border-red-500/50";
      case "DISPONIBLE": return "bg-gray-500/20 text-gray-300 border border-gray-500/50";
      default: return "bg-gray-500/20 text-gray-300 border border-gray-500/50";
    }
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">📅 Agenda del Día</h1>
        <p className="text-gray-400">Gestiona las reservas y turnos de tus barberos</p>
      </div>

      {/* Controles de selección */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl shadow-2xl mb-8 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector de barbero */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              👤 Seleccionar Barbero
            </label>
            <select
              className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
              value={selectedBarbero?._id || ""}
              onChange={e => {
                const b = barberos.find(x => x._id === e.target.value);
                setSelectedBarbero(b || null);
              }}
            >
              <option value="">Seleccione un barbero</option>
              {barberos.map(b => (
                <option key={b._id} value={b._id}>{b.nombre}</option>
              ))}
            </select>
          </div>

          {/* Selector de fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📆 Seleccionar Fecha
            </label>
            <input
              type="date"
              className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Resumen del día - Cards mejoradas */}
      {selectedBarbero && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Resumen del Día</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Reservas */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">📋</span>
                <span className="text-blue-200 text-sm font-medium">TOTAL</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{resumen.totalTurnos || 0}</p>
              <p className="text-blue-200 text-sm">Reservas totales</p>
            </div>

            {/* Completadas vs Canceladas */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">✅</span>
                <span className="text-green-200 text-sm font-medium">ESTADO</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-4xl font-bold text-white">{resumen.completados || 0}</p>
                <span className="text-green-200">/ {resumen.cancelados || 0}</span>
              </div>
              <p className="text-green-200 text-sm">Completadas / Canceladas</p>
            </div>

            {/* Ingresos */}
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">💰</span>
                <span className="text-yellow-200 text-sm font-medium">INGRESOS</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">${resumen.ingresosGenerados || 0}</p>
              <p className="text-yellow-200 text-sm">Generados hoy</p>
            </div>

            {/* Horas trabajadas */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">⏰</span>
                <span className="text-purple-200 text-sm font-medium">TIEMPO</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{resumen.horasTrabajadas || "00:00"}</p>
              <p className="text-purple-200 text-sm">Horas trabajadas</p>
            </div>

          </div>
        </div>
      )}

      {/* Lista de turnos - Tabla mejorada */}
      {selectedBarbero && (
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">🕐 Turnos del Día</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4">Cargando turnos...</p>
            </div>
          ) : turnos.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-gray-400 text-lg">No hay reservas para esta fecha</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">🕐 Hora</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">👤 Cliente</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">✂️ Servicio</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">📊 Estado</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">⚙️ Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {turnos.map((t, idx) => (
                    <tr 
                      key={t.hora} 
                      className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800/30'
                      }`}
                    >
                      <td className="p-4">
                        <span className="text-white font-semibold text-lg">{t.hora}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-200">{t.cliente || "—"}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{t.servicio}</p>
                          <p className="text-gray-400 text-sm">⏱️ {t.duracion} min</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(t.estado)}`}>
                          {t.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {t.estado === "RESERVADA" && (
                            <>
                              <button
                                onClick={() => handleCompletar(t._id)}
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                              >
                                ✓ Completar
                              </button>
                              <button
                                onClick={() => handleCancelar(t._id)}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
                              >
                                ✗ Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Mensaje inicial cuando no hay barbero seleccionado */}
      {!selectedBarbero && (
        <div className="bg-gray-800 rounded-xl shadow-xl p-12 text-center border border-gray-700">
          <span className="text-6xl mb-4 block">👨‍💼</span>
          <h3 className="text-2xl font-bold text-white mb-2">Selecciona un barbero</h3>
          <p className="text-gray-400">Elige un barbero arriba para ver su agenda del día</p>
        </div>
      )}
    </div>
  );
}