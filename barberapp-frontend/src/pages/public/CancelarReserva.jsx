import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { cancelarReservaByToken } from "../../services/publicService";

export default function CancelarReserva() {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const cancel = async () => {
            try {
                await cancelarReservaByToken(token);
                setSuccess(true);
            } catch (err) {
                setError(err.response?.data?.message || "Error al cancelar la reserva");
            } finally {
                setLoading(false);
            }
        };
        cancel();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                {loading ? (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-slate-400">Cancelando tu reserva...</p>
                    </div>
                ) : success ? (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">¡Reserva cancelada!</h2>
                        <p className="text-slate-400">
                            Tu cita ha sido cancelada correctamente. Esperamos verte pronto en otra ocasión.
                        </p>
                        <Link
                            to="/"
                            className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Lo sentimos</h2>
                        <p className="text-red-400/80">{error}</p>
                        <p className="text-slate-400 text-sm">
                            Si crees que esto es un error, por favor contacta directamente con la barbería.
                        </p>
                        <Link
                            to="/"
                            className="block w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
                        >
                            Ir a la página principal
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
