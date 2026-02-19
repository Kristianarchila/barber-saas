import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    RefreshCcw,
    Check,
    CheckCircle2,
    ChevronRight,
    FileText,
    Loader2,
    Users,
    CreditCard
} from "lucide-react";
import { getBarberos } from "../../../services/barberosService";
import { getBalanceBarbero, getTransactions, marcarComoPagado } from "../../../services/transactionService";
import { Button, Badge, Avatar, Card } from "../../../components/ui";
import { ErrorAlert } from "../../../components/ErrorComponents";
import { useApiCall } from "../../../hooks/useApiCall";
import { useAsyncAction } from "../../../hooks/useAsyncAction";

export default function Pagos() {
    const [barberosBalances, setBarberosBalances] = useState([]);
    const [selectedBarbero, setSelectedBarbero] = useState(null);
    const [barberoTransactions, setBarberoTransactions] = useState([]);

    // Hook para cargar balances de todos los barberos
    const { execute: fetchData, loading, error } = useApiCall(
        async () => {
            const barberosData = await getBarberos();
            // Obtener balance para cada barbero
            const balances = await Promise.all(
                barberosData.map(async (b) => {
                    const bal = await getBalanceBarbero(b._id);
                    return {
                        ...b,
                        balance: bal
                    };
                })
            );
            return balances;
        },
        {
            errorMessage: 'Error al cargar los balances del staff.',
            onSuccess: (balances) => setBarberosBalances(balances)
        }
    );

    // Hook para cargar transacciones de un barbero específico
    const { execute: fetchBarberoTransactions, loading: loadingBarbero, error: errorBarbero } = useApiCall(
        async (barberoId) => {
            return await getTransactions({
                barberoId,
                estado: 'aprobado',
                limit: 100
            });
        },
        {
            errorMessage: 'Error al cargar las transacciones del profesional.',
            onSuccess: (data) => setBarberoTransactions(data.transactions)
        }
    );

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectBarbero = (b) => {
        setSelectedBarbero(b);
        fetchBarberoTransactions(b._id);
    };

    // Hook para procesar pagos (liquidación)
    const { execute: handlePaySelection, loading: procesandoPago } = useAsyncAction(
        async () => {
            if (barberoTransactions.length === 0) return;
            return await Promise.all(
                barberoTransactions.map(tx => marcarComoPagado(tx._id, { metodoPago: 'efectivo' }))
            );
        },
        {
            successMessage: '✅ Pagos procesados y liquidados correctamente',
            errorMessage: 'Error al procesar la liquidación',
            confirmMessage: `¿Deseas marcar las transacciones como pagadas y cerrar este periodo?`,
            onSuccess: () => {
                fetchData();
                setSelectedBarbero(null);
            }
        }
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount || 0);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <Wallet className="text-blue-600" size={32} />
                        Liquidación de Haberes
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Control de comisiones y cierres de pagos al staff
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchData}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black transition-all hover:bg-gray-50 border-gray-200"
                >
                    <RefreshCcw size={20} />
                    Actualizar Balances
                </Button>
            </header>

            {error && (
                <div className="max-w-4xl mx-auto mb-8">
                    <ErrorAlert
                        title="Error en Liquidaciones"
                        message={error}
                        onRetry={fetchData}
                        variant="error"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* LISTA DE BARBEROS Y SUS BALANCES */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="caption font-black text-gray-400 uppercase tracking-widest">Estado de Cuentas Staff</h3>
                        <Badge className="bg-blue-50 text-blue-600 border-none font-black px-3 py-1 text-[10px]">
                            {barberosBalances.length} PROFESIONALES
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => <Card key={i} className="h-32 bg-gray-50 animate-pulse border-none" />)
                        ) : (
                            barberosBalances.map(b => (
                                <motion.div
                                    key={b._id}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => handleSelectBarbero(b)}
                                    className={`relative cursor-pointer transition-all ${selectedBarbero?._id === b._id
                                        ? "scale-[1.02]"
                                        : ""
                                        }`}
                                >
                                    <Card className={`p-6 shadow-sm border-none ring-1 transition-all ${selectedBarbero?._id === b._id
                                        ? "ring-blue-500 bg-white"
                                        : "ring-gray-100 hover:ring-blue-200 bg-white"
                                        }`}>
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <Avatar src={b.foto} name={b.nombre} className="w-16 h-16 ring-4 ring-gray-50 shadow-sm" />
                                                {selectedBarbero?._id === b._id && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center">
                                                        <Check size={12} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="body-large font-black text-gray-900 truncate">{b.nombre}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    <span className="caption font-black text-gray-400 uppercase tracking-tighter">Staff Activo</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black text-gray-900">
                                                    {formatCurrency(b.balance.pendiente.totalMontoBarero || b.balance.pendiente.totalMontoBarbero)}
                                                </p>
                                                <span className="caption font-black text-amber-500 uppercase tracking-widest text-[9px]">A Liquidar</span>
                                            </div>
                                        </div>
                                        <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center">
                                            <div className="flex items-center gap-2 caption font-black text-gray-400">
                                                <CheckCircle2 size={12} className="text-green-600" />
                                                Pagado histórico: {formatCurrency(b.balance.pagado.totalMontoBarbero)}
                                            </div>
                                            <ChevronRight size={18} className={selectedBarbero?._id === b._id ? "text-blue-600" : "text-gray-300"} />
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* DETALLE DE PAGO SELECCIONADO */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {selectedBarbero ? (
                            <motion.div
                                key={selectedBarbero._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <Card className="p-10 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 pb-10 border-b border-gray-50">
                                        <div className="flex items-center gap-6">
                                            <div className="p-5 bg-blue-50 rounded-[24px] text-blue-600">
                                                <CreditCard size={40} />
                                            </div>
                                            <div>
                                                <h3 className="heading-3 text-gray-900">Corte de Caja Staff</h3>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <Avatar src={selectedBarbero.foto} name={selectedBarbero.nombre} className="w-6 h-6" />
                                                    <p className="body-small font-black text-gray-500">{selectedBarbero.nombre}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right p-6 bg-gray-50 rounded-[24px] min-w-[200px] ring-1 ring-gray-100">
                                            <p className="caption font-black text-gray-400 uppercase tracking-widest mb-1">Monto Liquidable</p>
                                            <p className="text-4xl font-black text-gray-900 leading-tight">
                                                {formatCurrency(selectedBarbero.balance.pendiente.totalMontoBarero || selectedBarbero.balance.pendiente.totalMontoBarbero)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-8 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <h4 className="heading-4 flex items-center gap-2">
                                                <FileText size={20} className="text-blue-600" />
                                                Ledger de Transacciones Pendientes
                                            </h4>
                                            <p className="caption font-bold text-gray-400 mt-1">{barberoTransactions.length} servicios realizados sin liquidar</p>
                                        </div>
                                        {barberoTransactions.length > 0 && (
                                            <Button
                                                onClick={handlePaySelection}
                                                disabled={procesandoPago || loadingBarbero}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-black shadow-xl transition-all flex items-center gap-3 active:scale-95"
                                            >
                                                {procesandoPago ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={24} />}
                                                {procesandoPago ? "Procesando..." : "Emitir Pago Completo"}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                        {loadingBarbero ? (
                                            <div className="space-y-4">
                                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}
                                            </div>
                                        ) : errorBarbero ? (
                                            <div className="py-10">
                                                <ErrorAlert
                                                    title="Error al cargar transacciones"
                                                    message={errorBarbero}
                                                    onRetry={() => fetchBarberoTransactions(selectedBarbero._id)}
                                                />
                                            </div>
                                        ) : barberoTransactions.length > 0 ? (
                                            barberoTransactions.map(tx => (
                                                <motion.div
                                                    key={tx._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-5 bg-gray-50/50 rounded-[20px] border border-gray-100 hover:border-blue-100 hover:bg-white transition-all group flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 bg-white rounded-[18px] flex flex-col items-center justify-center shadow-sm border border-gray-100 group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">
                                                            <span className="text-xs font-black text-gray-400 uppercase group-hover:text-blue-100">{dayjs(tx.fecha).format('MMM')}</span>
                                                            <span className="text-xl font-black text-gray-900 group-hover:text-white leading-none">{dayjs(tx.fecha).format('DD')}</span>
                                                        </div>
                                                        <div>
                                                            <p className="body-small font-black text-gray-900">{tx.servicioId?.nombre}</p>
                                                            <div className="flex items-center gap-4 mt-1">
                                                                <p className="caption font-black text-gray-400">Cliente: <span className="text-blue-600">{tx.reservaId?.nombreCliente}</span></p>
                                                                <p className="caption font-black text-gray-400">Time: {tx.reservaId?.hora}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="body-small font-black text-gray-900 leading-none">{formatCurrency(tx.montosFinales.montoBarbero)}</p>
                                                        <Badge className="bg-green-50 text-green-700 border-none font-black text-[9px] mt-2 px-2 py-0.5">
                                                            COMISIÓN {tx.montosFinales.porcentajeAplicado?.barbero}%
                                                        </Badge>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center flex flex-col items-center">
                                                <div className="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center mb-6">
                                                    <CheckCircle2 size={40} className="text-gray-200" />
                                                </div>
                                                <h4 className="heading-4 text-gray-400">Balance en Cero</h4>
                                                <p className="body-small text-gray-400 mt-2">Este profesional ya ha sido liquidado completamente.</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[600px] bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-32 h-32 bg-white rounded-[40px] shadow-sm flex items-center justify-center mb-10 ring-1 ring-gray-100">
                                    <Users className="text-gray-200" size={64} />
                                </div>
                                <h3 className="heading-3 text-gray-400">Gestión de Staff</h3>
                                <p className="body-large text-gray-400 max-w-sm mt-4 leading-relaxed">
                                    Selecciona un profesional del panel izquierdo para auditar sus servicios pendientes y emitir liquidaciones.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
