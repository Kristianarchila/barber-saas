import React, { useState, useEffect } from 'react';
import { useApiRequest } from '../utils/apiErrorHandler';
import {
    ErrorAlert,
    NetworkError,
    EmptyState,
    LoadingSpinner,
    SkeletonLoader
} from '../components/ErrorComponents';
import { Calendar } from 'lucide-react';

/**
 * Example Component: Reservations List with Error Handling
 * Demonstrates proper error handling patterns
 */
export function ReservationsExample() {
    const [reservations, setReservations] = useState([]);
    const { loading, error, retryCount, execute, retry } = useApiRequest();

    const fetchReservations = async () => {
        try {
            const result = await execute(
                () => fetch('/api/reservas').then(res => res.json()),
                {
                    enableRetry: true,
                    maxRetries: 3,
                    onRetry: (attempt, delay) => {
                        console.log(`Reintentando... (${attempt}/3) en ${delay}ms`);
                    }
                }
            );
            setReservations(result.data || []);
        } catch (err) {
            // Error is already set by useApiRequest
            console.error('Failed to fetch reservations:', err);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    // Loading state with skeleton
    if (loading && reservations.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Reservas</h2>
                <SkeletonLoader count={5} height="h-24" />
                {retryCount > 0 && (
                    <p className="text-sm text-gray-600 mt-4 text-center">
                        Reintentando... ({retryCount}/3)
                    </p>
                )}
            </div>
        );
    }

    // Network error state
    if (error && error.code === 'ERR_NETWORK') {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Reservas</h2>
                <NetworkError onRetry={fetchReservations} />
            </div>
        );
    }

    // Generic error state with retry
    if (error) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Reservas</h2>
                <ErrorAlert
                    title="Error al cargar reservas"
                    message={error.userMessage || 'No se pudieron cargar las reservas'}
                    onRetry={error.isRetryable ? fetchReservations : null}
                    variant="error"
                />
            </div>
        );
    }

    // Empty state
    if (reservations.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Reservas</h2>
                <EmptyState
                    icon={Calendar}
                    title="No hay reservas"
                    message="Aún no tienes reservas programadas"
                    action={fetchReservations}
                    actionLabel="Recargar"
                />
            </div>
        );
    }

    // Success state with data
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Reservas</h2>

            <div className="space-y-4">
                {reservations.map(reserva => (
                    <div
                        key={reserva.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <h3 className="font-semibold text-lg">{reserva.nombreCliente}</h3>
                        <p className="text-gray-600 text-sm">
                            {reserva.fecha} - {reserva.hora}
                        </p>
                    </div>
                ))}
            </div>

            {/* Refresh button */}
            <button
                onClick={fetchReservations}
                disabled={loading}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
                {loading ? 'Cargando...' : 'Recargar'}
            </button>
        </div>
    );
}

/**
 * Example Component: Form with Error Handling
 */
export function CreateReservationExample() {
    const [formData, setFormData] = useState({
        nombreCliente: '',
        emailCliente: '',
        fecha: '',
        hora: ''
    });
    const [success, setSuccess] = useState(false);
    const { loading, error, execute, reset } = useApiRequest();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(false);
        reset();

        try {
            await execute(
                () => fetch('/api/reservas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                }).then(res => {
                    if (!res.ok) throw res;
                    return res.json();
                }),
                {
                    enableRetry: false // Don't retry POST requests
                }
            );

            setSuccess(true);
            setFormData({ nombreCliente: '', emailCliente: '', fecha: '', hora: '' });
        } catch (err) {
            // Error is handled by useApiRequest
        }
    };

    return (
        <div className="p-6 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Nueva Reserva</h2>

            {/* Success message */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-medium">
                        ✓ Reserva creada exitosamente
                    </p>
                </div>
            )}

            {/* Error message */}
            {error && (
                <ErrorAlert
                    title="Error al crear reserva"
                    message={error.userMessage}
                    onDismiss={reset}
                    variant="error"
                />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                    </label>
                    <input
                        type="text"
                        value={formData.nombreCliente}
                        onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={formData.emailCliente}
                        onChange={(e) => setFormData({ ...formData, emailCliente: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                    {loading ? 'Creando...' : 'Crear Reserva'}
                </button>
            </form>
        </div>
    );
}

export default {
    ReservationsExample,
    CreateReservationExample
};
