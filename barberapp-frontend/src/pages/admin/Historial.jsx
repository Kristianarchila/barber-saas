import { useEffect, useState } from "react";
import { getHistorialReservas } from "../../services/reservasService";
import dayjs from "dayjs";

export default function Historial() {
  const [reservas, setReservas] = useState([]);
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("");

  async function cargarHistorial() {
    const filtros = {};
    if (fecha) filtros.fecha = fecha;
    if (estado) filtros.estado = estado;

    const data = await getHistorialReservas(filtros);
    setReservas(data);
  }

  useEffect(() => {
    cargarHistorial();
  }, [fecha, estado]);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">📂 Historial de Reservas</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          className="bg-gray-800 p-2 rounded"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <select
          className="bg-gray-800 p-2 rounded"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="RESERVADA">Reservada</option>
          <option value="COMPLETADA">Completada</option>
          <option value="CANCELADA">Cancelada</option>
        </select>

        <button
          onClick={cargarHistorial}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          Filtrar
        </button>
      </div>

      {/* Tabla */}
      {reservas.length === 0 ? (
        <p className="text-gray-400">No hay reservas</p>
      ) : (
        <table className="w-full bg-gray-800 rounded">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2">Fecha</th>
              <th className="p-2">Hora</th>
              <th className="p-2">Cliente</th>
              <th className="p-2">Servicio</th>
              <th className="p-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r._id} className="border-b border-gray-700">
                <td className="p-2">{r.fecha}</td>
                <td className="p-2">{r.hora}</td>
                <td className="p-2">{r.clienteId?.nombre || "—"}</td>
                <td className="p-2">{r.servicioId?.nombre}</td>
                <td className="p-2">{r.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
