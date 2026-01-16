import { useState } from "react";
import { getDisponibilidad } from "../../services/turnosService";

export default function Disponibilidad() {
  const [barberoId, setBarberoId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [fecha, setFecha] = useState("");
  const [horas, setHoras] = useState([]);

  const handleBuscar = async () => {
    if (!barberoId || !servicioId || !fecha) {
      alert("Selecciona barbero, servicio y fecha");
      return;
    }

    const data = await getDisponibilidad(barberoId, fecha, servicioId);
    setHoras(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-4">Ver disponibilidad</h1>

      <div className="flex flex-col gap-3 max-w-sm">
        
        <input
          placeholder="barberoId"
          value={barberoId}
          onChange={e => setBarberoId(e.target.value)}
          className="p-2 bg-gray-700 rounded"
        />

        <input
          placeholder="servicioId"
          value={servicioId}
          onChange={e => setServicioId(e.target.value)}
          className="p-2 bg-gray-700 rounded"
        />

        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          className="p-2 bg-gray-700 rounded"
        />

        <button
          onClick={handleBuscar}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Buscar turnos
        </button>

      </div>

      <ul className="mt-6">
        {horas.map(h => (
          <li key={h} className="text-xl">{h}</li>
        ))}
      </ul>
    </div>
  );
}
