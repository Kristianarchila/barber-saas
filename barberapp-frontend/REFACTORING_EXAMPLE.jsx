/**
 * EJEMPLO DE REFACTORIZACIÓN
 * 
 * Este archivo muestra cómo refactorizar un componente existente
 * para usar Clean Architecture.
 * 
 * ANTES: Componente con lógica mezclada
 * DESPUÉS: Componente usando hooks de presentación
 */

// ============================================
// ❌ ANTES - Código Legacy
// ============================================

/*
import { useState, useEffect } from 'react';
import axios from 'axios';

function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reservas');
      setReservas(response.data.reservas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.put(`/api/reservas/${id}/cancelar`);
      fetchReservas(); // Refrescar
    } catch (error) {
      alert('Error al cancelar');
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`/api/reservas/${id}/completar`);
      fetchReservas();
    } catch (error) {
      alert('Error al completar');
    }
  };

  return (
    <div>
      {loading && <div>Cargando...</div>}
      {reservas.map(reserva => (
        <div key={reserva._id}>
          <h3>{reserva.nombreCliente}</h3>
          <p>{reserva.fecha} - {reserva.hora}</p>
          <span>{reserva.estado}</span>
          
          {(reserva.estado === 'RESERVADA' || reserva.estado === 'CONFIRMADA') && (
            <>
              <button onClick={() => handleComplete(reserva._id)}>Completar</button>
              <button onClick={() => handleCancel(reserva._id)}>Cancelar</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
*/

// ============================================
// ✅ DESPUÉS - Clean Architecture
// ============================================

import { useGetReservas } from '../presentation/hooks/useGetReservas';
import { useReservaActions } from '../presentation/hooks/useReservaActions';
import { Badge } from '../components/ui';

function ReservasPage() {
    // Hooks de presentación que encapsulan use cases
    const { reservas, loading, error, refresh } = useGetReservas({}, true);
    const { cancelReserva, completeReserva, loading: actionLoading } = useReservaActions();

    const handleCancel = async (id) => {
        if (!confirm('¿Cancelar esta reserva?')) return;

        try {
            await cancelReserva(id);
            refresh(); // Refrescar lista
        } catch (err) {
            alert(err.message);
        }
    };

    const handleComplete = async (id) => {
        try {
            await completeReserva(id);
            refresh();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="loading">Cargando reservas...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="reservas-page">
            <div className="header">
                <h1>Reservas</h1>
                <button onClick={refresh} disabled={loading}>
                    Refrescar
                </button>
            </div>

            <div className="reservas-list">
                {reservas.length === 0 ? (
                    <div className="empty-state">No hay reservas</div>
                ) : (
                    reservas.map(reserva => (
                        <div key={reserva.id} className="reserva-card">
                            <div className="reserva-info">
                                <h3>{reserva.clienteNombre}</h3>
                                <p>{reserva.fecha} - {reserva.hora}</p>

                                {/* Usar propiedades del ViewModel */}
                                <Badge variant={reserva.estadoColor}>
                                    {reserva.estadoLabel}
                                </Badge>
                            </div>

                            <div className="reserva-actions">
                                {/* Usar reglas de negocio de la entidad */}
                                {reserva.puedeSerCompletada && (
                                    <button
                                        onClick={() => handleComplete(reserva.id)}
                                        disabled={actionLoading}
                                        className="btn-success"
                                    >
                                        Completar
                                    </button>
                                )}

                                {reserva.puedeSerCancelada && (
                                    <button
                                        onClick={() => handleCancel(reserva.id)}
                                        disabled={actionLoading}
                                        className="btn-danger"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ReservasPage;

// ============================================
// 📊 COMPARACIÓN
// ============================================

/*
ANTES (Legacy):
- ❌ Lógica de negocio en el componente (if estado === 'RESERVADA'...)
- ❌ Llamadas directas a axios
- ❌ Manejo de errores inconsistente
- ❌ Difícil de testear
- ❌ Acoplado a la estructura del backend (nombreCliente, _id)

DESPUÉS (Clean Architecture):
- ✅ Lógica de negocio en domain (puedeSerCancelada, puedeSerCompletada)
- ✅ Use cases encapsulados en hooks
- ✅ Manejo de errores centralizado
- ✅ Fácil de testear (mock de hooks)
- ✅ Desacoplado del backend (clienteNombre, id)
- ✅ ViewModels con datos calculados (estadoColor, estadoLabel)
*/
