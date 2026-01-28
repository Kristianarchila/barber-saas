import { useState, useEffect } from "react";
import { getTransactions, marcarComoPagado, getBalanceBarbero } from "../../../services/transactionService";
import { getBarberos } from "../../../services/barberosService";
import { Card, Button, Badge, Skeleton, Avatar } from "../../../components/ui";
import {
    CreditCard,
    Search,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    DollarSign,
    Wallet,
    Users,
    AlertCircle,
    FileText,
    Filter,
    RefreshCcw,
    ArrowRight
} from "lucide-react";

export default function Pagos() {
    const [loading, setLoading] = useState(true);
    const [barberosBalances, setBarberosBalances] = useState([]);
    const [selectedBarbero, setSelectedBarbero] = useState(null);
    const [barberoTransactions, setBarberoTransactions] = useState([]);
    const [loadingBarbero, setLoadingBarbero] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
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

            setBarberosBalances(balances);
        } catch (error) {
            console.error("Error fetching payouts data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBarberoTransactions = async (barberoId) => {
        try {
            setLoadingBarbero(true);
            const data = await getTransactions({
                barberoId,
                estado: 'aprobado',
                limit: 100
            });
            setBarberoTransactions(data.transactions);
        } catch (error) {
            console.error("Error fetching barbero transactions:", error);
        } finally {
            setLoadingBarbero(false);
        }
    };

    const handleSelectBarbero = (b) => {
        setSelectedBarbero(b);
        fetchBarberoTransactions(b._id);
    };

    const handlePaySelection = async () => {
        if (!confirm(`¿Deseas marcar las ${barberoTransactions.length} transacciones como pagadas para ${selectedBarbero.nombre}?`)) return;

        try {
            setLoadingBarbero(true);
            await Promise.all(
                barberoTransactions.map(tx => marcarComoPagado(tx._id, { metodoPago: 'efectivo' }))
            );
            alert("Pagos procesados correctamente");
            fetchData();
            setSelectedBarbero(null);
        } catch (error) {
            alert("Error procesando pagos");
        } finally {
            setLoadingBarbero(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount || 0);
    };

    return (
        <div className="space-y-8 animate-slide-in pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gradient-primary flex items-center gap-3">
                        <CreditCard size={40} className="text-primary-500" />
                        Liquidación de Pagos
                    </h1>
                    <p className="text-neutral-400 text-lg mt-2">
                        Gestiona los montos acumulados y paga a tu equipo de barberos
                    </p>
                </div>
                <Button variant="ghost" onClick={fetchData} className="bg-neutral-900 border-neutral-800">
                    <RefreshCcw size={18} />
                    Refrescar Balances
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LISTA DE BARBEROS Y SUS BALANCES */}
                <div className="lg:col-span-5 space-y-6">
                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em] px-4">Balances del Staff</h3>

                    {loading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height="h-32" className="rounded-3xl" />)
                    ) : (
                        barberosBalances.map(b => (
                            <Card
                                key={b._id}
                                onClick={() => handleSelectBarbero(b)}
                                className={`cursor-pointer transition-all border-2 ${selectedBarbero?._id === b._id
                                        ? "border-primary-500 bg-primary-500 bg-opacity-5 shadow-glow-primary"
                                        : "border-neutral-900 bg-neutral-900 hover:border-neutral-800"
                                    } rounded-[32px] overflow-hidden group`}
                            >
                                <div className="p-6 flex items-center gap-4">
                                    <Avatar src={b.foto} name={b.nombre} size="lg" className="border-2 border-neutral-800" />
                                    <div className="flex-1">
                                        <h4 className="text-lg font-black text-white">{b.nombre}</h4>
                                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider group-hover:text-primary-500 transition-colors">Ver Detalles de Pago</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-white">{formatCurrency(b.balance.pendiente.totalMontoBarero || b.balance.pendiente.totalMontoBarbero)}</p>
                                        <Badge variant="warning" className="text-[10px] font-black uppercase">Pendiente</Badge>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-black bg-opacity-20 flex justify-between items-center text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={12} className="text-success-500" />
                                        <span>Pagado histórico: {formatCurrency(b.balance.pagado.totalMontoBarbero)}</span>
                                    </div>
                                    <ArrowRight size={14} className={selectedBarbero?._id === b._id ? "text-primary-500" : ""} />
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* DETALLE DE PAGO SELECCIONADO */}
                <div className="lg:col-span-7">
                    {selectedBarbero ? (
                        <div className="space-y-6 animate-slide-in">
                            <Card className="bg-neutral-900 border-neutral-800 rounded-[40px] overflow-hidden">
                                <div className="p-8 border-b border-neutral-800 bg-neutral-800 bg-opacity-30">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="p-4 bg-primary-500 bg-opacity-20 rounded-[28px] shadow-glow-primary">
                                                <Wallet className="text-primary-500" size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white">Resumen para {selectedBarbero.nombre}</h3>
                                                <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest mt-1">Corte de caja pendiente</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-4xl font-black text-white">{formatCurrency(selectedBarbero.balance.pendiente.totalMontoBarero || selectedBarbero.balance.pendiente.totalMontoBarbero)}</p>
                                            <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest">Monto total a liquidar</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="mb-6 flex items-center justify-between">
                                        <h4 className="font-black text-white uppercase text-xs tracking-widest flex items-center gap-2">
                                            <FileText size={16} className="text-primary-500" />
                                            Desglose de reservas ({barberoTransactions.length})
                                        </h4>
                                        {barberoTransactions.length > 0 && (
                                            <Button
                                                variant="primary"
                                                size="md"
                                                className="rounded-2xl px-6"
                                                onClick={handlePaySelection}
                                                disabled={loadingBarbero}
                                            >
                                                <CheckCircle2 size={18} />
                                                Liquidar {formatCurrency(selectedBarbero.balance.pendiente.totalMontoBarero || selectedBarbero.balance.pendiente.totalMontoBarbero)}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                                        {loadingBarbero ? (
                                            [1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height="h-20" className="rounded-2xl" />)
                                        ) : barberoTransactions.length > 0 ? (
                                            barberoTransactions.map(tx => (
                                                <div key={tx._id} className="p-5 bg-black bg-opacity-30 rounded-[24px] border border-neutral-800 border-opacity-50 hover:border-neutral-700 transition-all flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center font-black text-neutral-500 text-xs">
                                                            {dayjs(tx.fecha).format('DD')}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm">{tx.servicioId?.nombre}</p>
                                                            <p className="text-[10px] text-neutral-500 uppercase font-black tracking-tighter">Reserva: {tx.reservaId?.nombreCliente}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-white">{formatCurrency(tx.montosFinales.montoBarbero)}</p>
                                                        <p className="text-[10px] text-success-500 font-bold uppercase">Split {tx.montosFinales.porcentajeAplicado?.barbero}%</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-neutral-500 italic">
                                                No hay transacciones pendientes para liquidar.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] border-2 border-dashed border-neutral-800 rounded-[40px] flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                                <Users className="text-neutral-800" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-neutral-500">Selecciona un profesional</h3>
                            <p className="text-neutral-700 mt-2 max-w-sm">
                                Haz clic en uno de tus barberos para ver el detalle de sus transacciones pendientes y procesar sus pagos.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
