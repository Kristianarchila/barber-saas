import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import {
    changePlanManually,
    extendPeriodManually,
    activateManually,
    deactivateManually,
    recordPaymentManually,
    getSubscriptionHistory
} from '../../services/suscripcionesService';

export default function GestionSuscripcionModal({ open, onClose, barberia, onSuccess }) {
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [history, setHistory] = useState(null);

    // Form states
    const [newPlan, setNewPlan] = useState(barberia?.plan || 'FREE');
    const [reason, setReason] = useState('');
    const [months, setMonths] = useState(1);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentConcept, setPaymentConcept] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Transferencia');
    const [paymentReference, setPaymentReference] = useState('');

    useEffect(() => {
        if (open && tab === 4) {
            loadHistory();
        }
    }, [open, tab]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await getSubscriptionHistory(barberia._id);
            setHistory(data);
        } catch (err) {
            setError('Error al cargar historial: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePlan = async () => {
        if (!reason.trim()) {
            setError('Debes proporcionar una razón para el cambio');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await changePlanManually(barberia._id, newPlan, reason);
            setSuccess(`Plan cambiado a ${newPlan} exitosamente`);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            setError('Error al cambiar plan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExtendPeriod = async () => {
        if (!reason.trim()) {
            setError('Debes proporcionar una razón para la extensión');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await extendPeriodManually(barberia._id, months, reason);
            setSuccess(`Período extendido por ${months} mes(es) exitosamente`);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            setError('Error al extender período: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async () => {
        try {
            setLoading(true);
            setError(null);
            await activateManually(barberia._id, reason);
            setSuccess('Suscripción activada exitosamente');
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            setError('Error al activar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!reason.trim()) {
            setError('Debes proporcionar una razón para la desactivación');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await deactivateManually(barberia._id, reason);
            setSuccess('Suscripción desactivada exitosamente');
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            setError('Error al desactivar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            setError('El monto debe ser mayor a 0');
            return;
        }
        if (!paymentConcept.trim()) {
            setError('Debes proporcionar un concepto de pago');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await recordPaymentManually(
                barberia._id,
                parseFloat(paymentAmount),
                paymentConcept,
                {
                    paymentMethod,
                    reference: paymentReference
                }
            );
            setSuccess('Pago registrado exitosamente');
            setPaymentAmount('');
            setPaymentConcept('');
            setPaymentReference('');
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            setError('Error al registrar pago: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount);
    };

    if (!open) return null;

    const tabs = [
        'Cambiar Plan',
        'Extender Período',
        'Activar/Desactivar',
        'Registrar Pago',
        'Historial'
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                {/* HEADER */}
                <div className="p-6 border-b border-neutral-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-white">
                            Gestionar Suscripción
                        </h2>
                        <p className="text-neutral-400 text-sm mt-1">
                            {barberia?.nombre}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-800 rounded-lg transition-all"
                    >
                        <X className="text-neutral-400" size={24} />
                    </button>
                </div>

                {/* TABS */}
                <div className="border-b border-neutral-700 px-6">
                    <div className="flex gap-2 overflow-x-auto">
                        {tabs.map((tabName, index) => (
                            <button
                                key={index}
                                onClick={() => setTab(index)}
                                className={`px-4 py-3 font-semibold text-sm whitespace-nowrap transition-all ${tab === index
                                    ? 'text-primary-500 border-b-2 border-primary-500'
                                    : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                {tabName}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* ALERTS */}
                    {error && (
                        <div className="mb-4 p-4 bg-error-500/20 border border-error-500/50 rounded-xl text-error-400 flex items-center justify-between">
                            <span>{error}</span>
                            <button onClick={() => setError(null)}>
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-success-500/20 border border-success-500/50 rounded-xl text-success-400 flex items-center justify-between">
                            <span>{success}</span>
                            <button onClick={() => setSuccess(null)}>
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {/* TAB 0: CHANGE PLAN */}
                    {tab === 0 && (
                        <div className="space-y-4">
                            <div className="p-4 bg-neutral-800/50 rounded-xl">
                                <p className="text-neutral-400 text-sm mb-2">Plan actual:</p>
                                <Badge variant="primary">{barberia?.plan || 'FREE'}</Badge>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Nuevo Plan</label>
                                <select
                                    value={newPlan}
                                    onChange={(e) => setNewPlan(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                                >
                                    <option value="FREE">FREE - Gratuito</option>
                                    <option value="BASIC">BÁSICO - $29.990</option>
                                    <option value="PRO">PRO - $59.990</option>
                                    <option value="PREMIUM">PREMIUM - $99.990</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Razón del cambio</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    placeholder="Ej: Cliente pagó plan BASIC por transferencia"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-all resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 1: EXTEND PERIOD */}
                    {tab === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-white font-semibold mb-2">Meses a extender</label>
                                <input
                                    type="number"
                                    value={months}
                                    onChange={(e) => setMonths(parseInt(e.target.value))}
                                    min="1"
                                    max="12"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Razón de la extensión</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    placeholder="Ej: Promoción especial - 3 meses gratis"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-all resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 2: ACTIVATE/DEACTIVATE */}
                    {tab === 2 && (
                        <div className="space-y-4">
                            <div className="p-4 bg-neutral-800/50 rounded-xl">
                                <p className="text-neutral-400 text-sm mb-2">Estado actual:</p>
                                <Badge variant="success">{barberia?.subscriptionStatus || 'N/A'}</Badge>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">
                                    Razón (opcional para activar, requerido para desactivar)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    placeholder="Ej: Pago confirmado / Cliente solicitó cancelación"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="success"
                                    onClick={handleActivate}
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    Activar
                                </Button>
                                <Button
                                    variant="error"
                                    onClick={handleDeactivate}
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    Desactivar
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: RECORD PAYMENT */}
                    {tab === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-white font-semibold mb-2">Monto (CLP)</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    min="0"
                                    step="1000"
                                    placeholder="15000"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Concepto</label>
                                <input
                                    type="text"
                                    value={paymentConcept}
                                    onChange={(e) => setPaymentConcept(e.target.value)}
                                    placeholder="Ej: Pago plan BASIC - Mes de Febrero"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">Método de Pago</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-all"
                                >
                                    <option value="Transferencia">Transferencia Bancaria</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-2">
                                    Referencia / Comprobante (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={paymentReference}
                                    onChange={(e) => setPaymentReference(e.target.value)}
                                    placeholder="Ej: TRF-2026-001"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 4: HISTORY */}
                    {tab === 4 && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center p-8">
                                    <Loader className="animate-spin text-primary-500" size={32} />
                                </div>
                            ) : history ? (
                                <>
                                    {/* Summary */}
                                    <div className="p-4 bg-neutral-800/50 rounded-xl space-y-2">
                                        <h3 className="text-lg font-bold text-white mb-3">Resumen</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-neutral-400">Total cambios:</p>
                                                <p className="text-white font-bold">{history.summary.totalChanges}</p>
                                            </div>
                                            <div>
                                                <p className="text-neutral-400">Total pagos:</p>
                                                <p className="text-white font-bold">{history.summary.totalManualPayments}</p>
                                            </div>
                                            <div>
                                                <p className="text-neutral-400">Monto total:</p>
                                                <p className="text-white font-bold">
                                                    {formatCurrency(history.summary.totalManualPaymentAmount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-neutral-400">Gestión manual:</p>
                                                <p className="text-white font-bold">
                                                    {history.summary.isManagedManually ? 'Sí' : 'No'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Change History */}
                                    {history.changeHistory.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-3">Historial de Cambios</h3>
                                            <div className="space-y-2">
                                                {history.changeHistory.map((change, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <Badge variant="primary" size="sm">{change.type}</Badge>
                                                            <span className="text-xs text-neutral-500">
                                                                {formatDate(change.date)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-white">
                                                            {JSON.stringify(change.from)} → {JSON.stringify(change.to)}
                                                        </p>
                                                        {change.reason && (
                                                            <p className="text-xs text-neutral-400 mt-1">
                                                                Razón: {change.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Manual Payments */}
                                    {history.manualPayments.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-3">Pagos Manuales</h3>
                                            <div className="space-y-2">
                                                {history.manualPayments.map((payment, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-lg font-bold text-success-400">
                                                                {formatCurrency(payment.amount)}
                                                            </span>
                                                            <span className="text-xs text-neutral-500">
                                                                {formatDate(payment.date)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-white">{payment.concept}</p>
                                                        <p className="text-xs text-neutral-400 mt-1">
                                                            Método: {payment.metadata?.paymentMethod || '-'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-center text-neutral-500 p-8">
                                    No hay historial disponible
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-neutral-700 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cerrar
                    </Button>
                    {tab === 0 && (
                        <Button
                            variant="primary"
                            onClick={handleChangePlan}
                            disabled={loading || !reason.trim()}
                        >
                            {loading ? <Loader className="animate-spin" size={18} /> : 'Cambiar Plan'}
                        </Button>
                    )}
                    {tab === 1 && (
                        <Button
                            variant="primary"
                            onClick={handleExtendPeriod}
                            disabled={loading || !reason.trim()}
                        >
                            {loading ? <Loader className="animate-spin" size={18} /> : 'Extender'}
                        </Button>
                    )}
                    {tab === 3 && (
                        <Button
                            variant="primary"
                            onClick={handleRecordPayment}
                            disabled={loading || !paymentAmount || !paymentConcept.trim()}
                        >
                            {loading ? <Loader className="animate-spin" size={18} /> : 'Registrar Pago'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
