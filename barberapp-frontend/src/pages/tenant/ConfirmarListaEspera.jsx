import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import waitingListService from '../../services/waitingListService';

const ConfirmarListaEspera = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error, expired
    const [reserva, setReserva] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            handleConfirm();
        }
    }, [token]);

    const handleConfirm = async () => {
        try {
            setStatus('loading');
            const result = await waitingListService.convert(token);
            setReserva(result.reserva);
            setStatus('success');
        } catch (err) {
            console.error('Error confirming:', err);
            const errorMsg = err.response?.data?.error || err.message;
            setError(errorMsg);

            if (errorMsg.includes('expirado')) {
                setStatus('expired');
            } else {
                setStatus('error');
            }
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmando tu reserva...</h2>
                        <p className="text-gray-600">Por favor espera un momento</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center py-12">
                        <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-green-600" size={64} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Reserva Confirmada!</h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Tu reserva ha sido creada exitosamente desde la lista de espera
                        </p>

                        {reserva && (
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 max-w-md mx-auto mb-8 border border-purple-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Detalles de tu Reserva</h3>
                                <div className="space-y-3 text-left">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Fecha:</span>
                                        <span className="font-medium">{new Date(reserva.fecha).toLocaleDateString('es-CL')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Hora:</span>
                                        <span className="font-medium">{reserva.hora}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Barbero:</span>
                                        <span className="font-medium">{reserva.barbero}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Servicio:</span>
                                        <span className="font-medium">{reserva.servicio}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-8">
                            <p className="text-sm text-blue-800">
                                📧 Hemos enviado un email de confirmación con todos los detalles
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                );

            case 'expired':
                return (
                    <div className="text-center py-12">
                        <div className="bg-orange-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <Clock className="text-orange-600" size={64} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Tiempo Expirado</h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Lo sentimos, el tiempo para confirmar esta reserva ha expirado
                        </p>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md mx-auto mb-8">
                            <p className="text-sm text-orange-800 mb-4">
                                Las notificaciones de lista de espera tienen un plazo de 48 horas para ser confirmadas.
                            </p>
                            <p className="text-sm text-orange-800">
                                Si aún necesitas una reserva, puedes intentar reservar nuevamente o volver a unirte a la lista de espera.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center py-12">
                        <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <XCircle className="text-red-600" size={64} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Error al Confirmar</h2>
                        <p className="text-lg text-gray-600 mb-8">
                            {error || 'Hubo un problema al confirmar tu reserva'}
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto mb-8">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                                <div className="text-left">
                                    <p className="text-sm text-red-800 mb-2 font-medium">
                                        Posibles causas:
                                    </p>
                                    <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                                        <li>El enlace es inválido o ya fue usado</li>
                                        <li>El horario ya fue tomado por otro cliente</li>
                                        <li>La notificación expiró</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                            >
                                Volver al Inicio
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition"
                            >
                                Intentar Nuevamente
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default ConfirmarListaEspera;
