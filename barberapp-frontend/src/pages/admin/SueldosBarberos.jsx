import { useState, useEffect } from "react";
import {
    Users,
    DollarSign,
    FileText,
    TrendingUp,
    ArrowDownCircle,
    CheckCircle2,
    Calendar,
    ChevronRight,
    PlusCircle
} from "lucide-react";
import { Card, Button, Badge, Input } from "../../components/ui";
import { obtenerRendimientoBarberos } from "../../services/reportesService";
import { ErrorAlert } from "../../components/ErrorComponents";
import { useApiCall } from "../../hooks/useApiCall";
import dayjs from "dayjs";

export default function SueldosBarberos() {
    const [barberos, setBarberos] = useState([]);
    const [mesSeleccionado, setMesSeleccionado] = useState(dayjs().format('YYYY-MM'));

    // Hook para cargar nómina
    const { execute: fetchData, loading, error } = useApiCall(
        () => obtenerRendimientoBarberos(mesSeleccionado),
        {
            errorMessage: 'Error al cargar la nómina del personal.',
            onSuccess: (data) => setBarberos(data)
        }
    );

    // Hook para pagar comisiones (Placeholder logic)
    const { execute: handlePagar, loading: pagando } = useAsyncAction(
        async (barberoId, monto) => {
            // Aquí iría la llamada al servicio para registrar el pago
            // console.log(`Pagando ${monto} a barbero ${barberoId}`);
            // await sueldosService.registrarPago(barberoId, { monto, mes: mesSeleccionado });
            return new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
        },
        {
            successMessage: '✅ Pago registrado correctamente',
            errorMessage: 'Error al procesar el pago',
            confirmMessage: '¿Deseas registrar este pago en el sistema?',
            onSuccess: fetchData
        }
    );

    useEffect(() => {
        fetchData();
    }, [mesSeleccionado]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(amount || 0);
    };

    if (loading && barberos.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-12">
                <ErrorAlert
                    title="Error de Nómina"
                    message={error}
                    onRetry={fetchData}
                />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-24 lg:pb-8">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gradient-primary">
                        👥 Sueldos & Comisiones
                    </h1>
                    <p className="text-neutral-400 text-lg mt-2">
                        Gestión de pagos y adelantos (vales) del personal
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-2xl border-neutral-800">
                        <Calendar size={18} className="mr-2" />
                        {dayjs().format('MMMM YYYY')}
                    </Button>
                    <Button variant="primary" className="rounded-2xl shadow-glow-primary">
                        <PlusCircle size={18} className="mr-2" />
                        Registrar Vale
                    </Button>
                </div>
            </header>

            {/* STATS RAPIDOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900 border-neutral-800 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-primary-500 bg-opacity-10 rounded-2xl">
                            <DollarSign className="text-primary-500" size={24} />
                        </div>
                        <Badge variant="primary">Total Mes</Badge>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">A Pagar Personal</p>
                        <h3 className="text-3xl font-black text-white mt-1">
                            {formatCurrency(barberos.reduce((sum, b) => sum + b.comision, 0))}
                        </h3>
                    </div>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-error-500 bg-opacity-10 rounded-2xl">
                            <ArrowDownCircle className="text-error-500" size={24} />
                        </div>
                        <Badge variant="outline">Adelantos</Badge>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Vales Vigentes</p>
                        <h3 className="text-3xl font-black text-white mt-1">
                            {formatCurrency(barberos.reduce((sum, b) => sum + b.vales, 0))}
                        </h3>
                    </div>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-success-500 bg-opacity-10 rounded-2xl">
                            <TrendingUp className="text-success-500" size={24} />
                        </div>
                        <Badge variant="success">Productividad</Badge>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Generado Bruto</p>
                        <h3 className="text-3xl font-black text-white mt-1">
                            {formatCurrency(barberos.reduce((sum, b) => sum + b.ingresosTotales, 0))}
                        </h3>
                    </div>
                </Card>
            </div>

            {/* LISTADO DE BARBEROS */}
            <div className="space-y-4">
                <h2 className="text-xl font-black text-white px-2 uppercase tracking-widest text-neutral-500">Nómina Detallada</h2>

                <div className="grid grid-cols-1 gap-4">
                    {barberos.map((barbero) => {
                        const sueldoNeto = barbero.comision - barbero.vales;

                        return (
                            <Card key={barbero.barberoId} className="bg-neutral-950 border-neutral-800 p-0 overflow-hidden group hover:border-primary-500/50 transition-all">
                                <div className="flex flex-col lg:flex-row items-stretch">
                                    {/* INFO PERSONAL */}
                                    <div className="p-6 lg:w-1/4 border-b lg:border-b-0 lg:border-r border-neutral-800 bg-neutral-900/50 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-800 to-black flex items-center justify-center border border-neutral-700 shadow-xl group-hover:scale-105 transition-transform">
                                            <Users size={32} className="text-primary-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white group-hover:text-primary-500 transition-colors uppercase">{barbero.nombre}</h3>
                                            <Badge variant="outline" size="sm" className="mt-1">{barbero.porcentajeComision}% Comisión</Badge>
                                        </div>
                                    </div>

                                    {/* METRICAS */}
                                    <div className="p-6 flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8 items-center">
                                        <div>
                                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Generado</p>
                                            <p className="text-lg font-bold text-white mt-1">{formatCurrency(barbero.ingresosTotales)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Comisión</p>
                                            <p className="text-lg font-bold text-success-500 mt-1">{formatCurrency(barbero.comision)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Vales/Desc.</p>
                                            <p className="text-lg font-bold text-error-500 mt-1">-{formatCurrency(barbero.vales)}</p>
                                        </div>
                                        <div className="bg-primary-500/5 p-4 rounded-2xl border border-primary-500/10">
                                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">A Pagar</p>
                                            <p className="text-2xl font-black text-white mt-1">{formatCurrency(sueldoNeto)}</p>
                                        </div>
                                    </div>

                                    {/* ACCIONES */}
                                    <div className="p-6 lg:w-48 bg-neutral-900/30 flex lg:flex-col items-center justify-center gap-3">
                                        <button className="flex-1 lg:w-full py-3 px-4 rounded-xl bg-neutral-800 text-neutral-400 font-bold text-xs hover:bg-neutral-700 transition-all border border-neutral-700">
                                            Resumen
                                        </button>
                                        <Button
                                            onClick={() => handlePagar(barbero.barberoId, sueldoNeto)}
                                            disabled={pagando}
                                            className="flex-1 lg:w-full py-3 px-4 rounded-xl bg-primary-500 text-white font-black text-xs shadow-glow-primary hover:bg-primary-600 transition-all"
                                        >
                                            {pagando ? "..." : "PAGAR"}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* FOOTER VACIO REPRESENTATIVO */}
            <div className="py-12 border-t border-neutral-900 text-center">
                <FileText size={32} className="mx-auto text-neutral-800 mb-4" />
                <p className="text-neutral-600 font-bold uppercase tracking-widest text-xs italic opacity-50">Fin del listado de personal</p>
            </div>
        </div>
    );
}
