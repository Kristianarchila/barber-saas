import { useState, useEffect, useRef } from 'react';
import { Copy, CheckCheck, AlertCircle, Loader2, ExternalLink, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// USDT TRC-20 icon as inline SVG
const UsdtIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="inline">
        <circle cx="16" cy="16" r="16" fill="#26A17B" />
        <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657zm0-3.59v-2.366h5.414V8.5H8.595v2.927h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.122 0 1.048 3.309 1.92 7.71 2.121v7.585h3.912v-7.588c4.393-.202 7.694-1.073 7.694-2.12 0-1.046-3.3-1.917-7.694-2.12z" fill="white" />
    </svg>
);

const PLAN_DISPLAY_NAMES = {
    basico: 'Básico', BASIC: 'Básico',
    pro: 'Pro', PRO: 'Pro',
    premium: 'Premium', PREMIUM: 'Premium',
};

export default function UsdtPaymentModal({ plan, onClose, onSuccess }) {
    const [walletInfo, setWalletInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [txHash, setTxHash] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        api.get(`/subscriptions/wallet-info?plan=${plan}`)
            .then(r => setWalletInfo(r.data))
            .catch(err => toast.error(err.response?.data?.message || 'Error cargando info de pago'))
            .finally(() => setLoading(false));
    }, [plan]);

    const handleCopy = () => {
        if (!walletInfo?.walletAddress) return;
        navigator.clipboard.writeText(walletInfo.walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        toast.success('Dirección copiada');
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.post('/subscriptions/request-payment', { plan, txHash, notes });
            setSubmitted(true);
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al registrar pago');
        } finally {
            setSubmitting(false);
        }
    };

    const handleWhatsApp = () => {
        if (!walletInfo?.contactWhatsApp) return;
        const msg = encodeURIComponent(
            `Hola, acabo de enviar ${walletInfo.amountUsdt} USDT (TRC-20) para el plan ${PLAN_DISPLAY_NAMES[plan] || plan}.\nTx Hash: ${txHash || 'pendiente'}`
        );
        window.open(`https://wa.me/${walletInfo.contactWhatsApp.replace(/\D/g, '')}?text=${msg}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">

                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-5 text-white">
                    <div className="flex items-center gap-3 mb-1">
                        <UsdtIcon />
                        <div>
                            <h2 className="text-xl font-black">Pagar con USDT</h2>
                            <p className="text-emerald-100 text-sm">
                                Plan {PLAN_DISPLAY_NAMES[plan] || plan} · Red TRC-20
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="animate-spin text-teal-600" size={36} />
                        </div>
                    ) : submitted ? (
                        <div className="text-center py-8 space-y-3">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCheck size={32} className="text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">¡Pago Notificado!</h3>
                            <p className="text-gray-500 text-sm">
                                Recibirás la confirmación de activación en menos de 24 horas una vez verifiquemos tu transacción.
                            </p>
                            <button onClick={onClose} className="btn btn-primary mt-4 w-full">Cerrar</button>
                        </div>
                    ) : (
                        <>
                            {/* Monto */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                                <p className="text-sm text-emerald-700 font-medium mb-1">Monto exacto a enviar</p>
                                <p className="text-4xl font-black text-emerald-800">{walletInfo?.amountUsdt} <span className="text-2xl">USDT</span></p>
                                <p className="text-xs text-emerald-600 mt-1">Red: TRC-20 (TRON) · No uses otra red</p>
                            </div>

                            {/* Wallet Address */}
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Dirección de Destino (TRC-20)</p>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                                    <code className="flex-1 text-sm font-mono text-gray-800 break-all select-all" ref={inputRef}>
                                        {walletInfo?.walletAddress}
                                    </code>
                                    <button
                                        onClick={handleCopy}
                                        className={`flex-shrink-0 p-2 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-800'}`}
                                    >
                                        {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800">
                                    <strong>Importante:</strong> Envía <strong>solo USDT por la red TRC-20</strong>. Enviar en otra red resultará en pérdida de fondos.
                                </p>
                            </div>

                            {/* Tx Hash Input */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                                    Hash de Transacción <span className="text-gray-400 normal-case font-normal">(opcional pero recomendado)</span>
                                </label>
                                <input
                                    type="text"
                                    value={txHash}
                                    onChange={e => setTxHash(e.target.value)}
                                    placeholder="ej: a1b2c3d4e5f6..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 focus:outline-none focus:border-teal-400 transition-all"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                {walletInfo?.contactWhatsApp && (
                                    <button
                                        onClick={handleWhatsApp}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-xl transition-all"
                                    >
                                        <MessageCircle size={16} /> WhatsApp
                                    </button>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-2.5 transition-all disabled:opacity-60"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCheck size={16} />}
                                    Ya Pagué, Notificar Soporte
                                </button>
                            </div>

                            <button onClick={onClose} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
                                Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
