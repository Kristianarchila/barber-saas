import { useState, useEffect } from "react";
import { getRevenueConfig, updateRevenueConfig, setOverrideBarbero, setOverrideServicio, deleteOverride } from "../../../services/revenueService";
import { getBarberos } from "../../../services/barberosService";
import { getServicios } from "../../../services/serviciosService";
import { Card, Button, Badge, Skeleton, Avatar } from "../../../components/ui";
import {
    PieChart,
    Settings,
    Save,
    Users,
    Scissors,
    Info,
    AlertTriangle,
    CheckCircle2,
    RefreshCcw,
    Plus,
    Trash2,
    Percent,
    Check,
    ChevronRight,
    GripVertical
} from "lucide-react";

export default function RevenueConfig() {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [barberos, setBarberos] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [saving, setSaving] = useState(false);

    // Tab local para configuración
    const [activeTab, setActiveTab] = useState('general'); // 'general', 'barberos', 'servicios', 'impuestos'

    // Form states
    const [generalForm, setGeneralForm] = useState({
        porcentajeDefaultBarbero: 50,
        porcentajeDefaultBarberia: 50,
        permitirAjusteManual: true,
        requiereAprobacion: false
    });

    const [taxForm, setTaxForm] = useState({
        iva: 0,
        retencion: 0,
        aplicarIVA: false,
        aplicarRetencion: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [configData, barberosData, serviciosData] = await Promise.all([
                getRevenueConfig(),
                getBarberos(),
                getServicios()
            ]);

            setConfig(configData);
            setBarberos(barberosData);
            setServicios(serviciosData);

            if (configData) {
                setGeneralForm({
                    porcentajeDefaultBarbero: configData.configuracionGeneral.porcentajeDefaultBarbero,
                    porcentajeDefaultBarberia: configData.configuracionGeneral.porcentajeDefaultBarberia,
                    permitirAjusteManual: configData.configuracionGeneral.permitirAjusteManual,
                    requiereAprobacion: configData.configuracionGeneral.requiereAprobacion
                });
                setTaxForm(configData.impuestos || {
                    iva: 0,
                    retencion: 0,
                    aplicarIVA: false,
                    aplicarRetencion: false
                });
            }
        } catch (error) {
            console.error("Error fetching revenue config:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneralSave = async () => {
        try {
            setSaving(true);
            await updateRevenueConfig({ configuracionGeneral: generalForm });
            await fetchData();
            // Notificación simplificada
        } catch (error) {
            alert("Error al actualizar");
        } finally {
            setSaving(false);
        }
    };

    const handleTaxSave = async () => {
        try {
            setSaving(true);
            await updateRevenueConfig({ impuestos: taxForm });
            await fetchData();
        } catch (error) {
            alert("Error al actualizar");
        } finally {
            setSaving(false);
        }
    };

    const handleAddOverrideBarbero = async (barberoId) => {
        const barbero = barberos.find(b => b._id === barberoId);
        const pBarbero = prompt(`Porcentaje para ${barbero.nombre}:`, "50");
        if (pBarbero === null) return;
        const val = parseInt(pBarbero);
        if (isNaN(val) || val < 0 || val > 100) return alert("Porcentaje inválido");

        try {
            await setOverrideBarbero(barberoId, {
                porcentajeBarbero: val,
                porcentajeBarberia: 100 - val
            });
            await fetchData();
        } catch (error) {
            alert("Error al guardar");
        }
    };

    const handleAddOverrideServicio = async (servicioId) => {
        const servicio = servicios.find(s => s._id === servicioId);
        const pBarbero = prompt(`Porcentaje barbero para "${servicio.nombre}":`, "50");
        if (pBarbero === null) return;
        const val = parseInt(pBarbero);
        if (isNaN(val) || val < 0 || val > 100) return alert("Porcentaje inválido");

        try {
            await setOverrideServicio(servicioId, {
                porcentajeBarbero: val,
                porcentajeBarberia: 100 - val
            });
            await fetchData();
        } catch (error) {
            alert("Error al guardar");
        }
    };

    const handleDeleteOverride = async (tipo, id) => {
        if (!confirm("¿Eliminar acuerdo específico?")) return;
        try {
            await deleteOverride(tipo, id);
            await fetchData();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    if (loading) {
        return (
            <div className="space-y-10 animate-pulse">
                <div className="h-12 bg-gray-100 rounded-2xl w-1/3" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="h-64 bg-gray-50 rounded-3xl" />
                    <div className="lg:col-span-3 h-96 bg-gray-50 rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <PieChart className="text-blue-600" size={32} />
                        Ingeniería de Comisiones
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Configura el algoritmo de distribución de ingresos (Revenue Split)
                    </p>
                </div>
                <Button variant="outline" onClick={fetchData} className="rounded-2xl px-6 py-4 font-black gap-2 border-gray-200">
                    <RefreshCcw size={18} />
                    Sincronizar
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* SIDEBAR TABS */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: 'general', label: 'General', icon: <Settings size={18} /> },
                        { id: 'barberos', label: 'Barberos', icon: <Users size={18} /> },
                        { id: 'servicios', label: 'Servicios', icon: <Scissors size={18} /> },
                        { id: 'impuestos', label: 'Impuestos & IVA', icon: <Percent size={18} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-sm transition-all ${activeTab === tab.id
                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-100"
                                : "text-gray-400 hover:text-gray-900 hover:bg-gray-50/50"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {tab.icon}
                                {tab.label}
                            </div>
                            {activeTab === tab.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="lg:col-span-9">
                    {/* TAB: GENERAL */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <Card className="p-0 shadow-sm border-none ring-1 ring-gray-100 bg-white overflow-hidden">
                                <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                                    <h3 className="heading-3 text-gray-900">Configuración Base</h3>
                                    <p className="caption font-black text-gray-400 uppercase tracking-widest mt-1">Porcentajes y comportamiento global</p>
                                </div>

                                <div className="p-10 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {/* RANGE SLIDER ESTRATÉGICO */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <label className="body-small font-black text-gray-900 uppercase">Distribución Estándar</label>
                                                <Badge className="bg-blue-50 text-blue-700 font-extrabold px-3 py-1 border-none tracking-widest">
                                                    {generalForm.porcentajeDefaultBarbero}% STAFF
                                                </Badge>
                                            </div>

                                            <div className="relative pt-4">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="5"
                                                    value={generalForm.porcentajeDefaultBarbero}
                                                    onChange={(e) => setGeneralForm({
                                                        ...generalForm,
                                                        porcentajeDefaultBarbero: parseInt(e.target.value),
                                                        porcentajeDefaultBarberia: 100 - parseInt(e.target.value)
                                                    })}
                                                    className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                                                />
                                                <div className="flex justify-between mt-6">
                                                    <div className="p-6 bg-gray-50 rounded-2xl flex-1 mr-3 text-center">
                                                        <p className="caption font-black text-gray-400 uppercase tracking-tighter mb-1">Corte Barbero</p>
                                                        <p className="text-3xl font-black text-gray-900">{generalForm.porcentajeDefaultBarbero}%</p>
                                                    </div>
                                                    <div className="p-6 bg-blue-50 rounded-2xl flex-1 text-center">
                                                        <p className="caption font-black text-blue-600/60 uppercase tracking-tighter mb-1">Corte Casa</p>
                                                        <p className="text-3xl font-black text-blue-700">{generalForm.porcentajeDefaultBarberia}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* OPCIONES DE COMPORTAMIENTO */}
                                        <div className="space-y-4">
                                            {[
                                                {
                                                    id: 'ajusteManual',
                                                    title: 'Flexibilidad de Ajuste',
                                                    desc: 'Permite editar montos manualmente en el ledger.',
                                                    checked: generalForm.permitirAjusteManual,
                                                    action: () => setGeneralForm({ ...generalForm, permitirAjusteManual: !generalForm.permitirAjusteManual })
                                                },
                                                {
                                                    id: 'requiereApro',
                                                    title: 'Auditoría de Pagos',
                                                    desc: 'Requiere confirmación antes de liquidar balance.',
                                                    checked: generalForm.requiereAprobacion,
                                                    action: () => setGeneralForm({ ...generalForm, requiereAprobacion: !generalForm.requiereAprobacion })
                                                }
                                            ].map(opt => (
                                                <div key={opt.id} onClick={opt.action} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${opt.checked ? "border-blue-600 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="body font-black text-gray-900">{opt.title}</span>
                                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${opt.checked ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                                                            {opt.checked && <Check size={14} className="text-white" />}
                                                        </div>
                                                    </div>
                                                    <p className="caption font-medium text-gray-500">{opt.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-gray-50 flex justify-end">
                                        <Button
                                            onClick={handleGeneralSave}
                                            disabled={saving}
                                            className="bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black shadow-lg flex items-center gap-3"
                                        >
                                            <Save size={20} />
                                            {saving ? "Sincronizando..." : "Aplicar Algoritmo"}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB: BARBEROS */}
                    {activeTab === 'barberos' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <Card className="p-0 shadow-sm border-none ring-1 ring-gray-100 bg-white overflow-hidden">
                                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                    <h3 className="heading-3 text-gray-900 font-black">Escalamiento por Profesional</h3>
                                    <p className="caption font-black text-gray-400 uppercase tracking-widest">Acuerdos Individuales</p>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {barberos.map(barbero => {
                                        const override = config?.overridesPorBarbero.find(o => o.barberoId === barbero._id && o.activo);
                                        return (
                                            <div key={barbero._id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50/30 transition-colors">
                                                <div className="flex items-center gap-5">
                                                    <Avatar src={barbero.foto} name={barbero.nombre} size="lg" className="ring-2 ring-gray-100" />
                                                    <div>
                                                        <p className="body-large font-black text-gray-900">{barbero.nombre}</p>
                                                        <p className="caption font-bold text-gray-400">{barbero.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8">
                                                    {override ? (
                                                        <div className="px-5 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                            <p className="text-sm font-black text-indigo-700 uppercase tracking-tighter">Acuerdo VIP</p>
                                                            <p className="text-2xl font-black text-indigo-900">{override.porcentajeBarbero}% Barbero</p>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="neutral" className="bg-gray-100 text-gray-500 border-none font-black px-4">Standard ({generalForm.porcentajeDefaultBarbero}%)</Badge>
                                                    )}

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAddOverrideBarbero(barbero._id)}
                                                            className="p-4 bg-gray-50 rounded-2xl text-gray-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Settings size={20} />
                                                        </button>
                                                        {override && (
                                                            <button
                                                                onClick={() => handleDeleteOverride('barbero', barbero._id)}
                                                                className="p-4 bg-red-50 rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                            >
                                                                <Trash2 size={20} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB: SERVICIOS */}
                    {activeTab === 'servicios' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <Card className="p-0 shadow-sm border-none ring-1 ring-gray-100 bg-white overflow-hidden">
                                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                    <h3 className="heading-3 text-gray-900 font-black">Complejidad de Servicios</h3>
                                    <p className="caption font-black text-gray-400 uppercase tracking-widest">Split por Item</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">
                                    {servicios.map(servicio => {
                                        const override = config?.overridesPorServicio.find(o => o.servicioId === servicio._id && o.activo);
                                        return (
                                            <div key={servicio._id} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 group hover:border-blue-200 transition-all flex justify-between items-center">
                                                <div>
                                                    <p className="body font-black text-gray-900">{servicio.nombre}</p>
                                                    <p className="caption font-black text-blue-600 mt-1">${servicio.precio}</p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {override ? (
                                                        <Badge className="bg-amber-50 text-amber-700 border-none font-black px-3 py-1">{override.porcentajeBarbero}%</Badge>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-gray-300 uppercase">Default</span>
                                                    )}
                                                    <button
                                                        onClick={() => handleAddOverrideServicio(servicio._id)}
                                                        className="p-3 bg-white rounded-xl text-gray-400 hover:text-blue-600 shadow-sm ring-1 ring-gray-200"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB: IMPUESTOS */}
                    {activeTab === 'impuestos' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <Card className="p-10 shadow-sm border-none ring-1 ring-gray-100 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* IVA CONFIG */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-red-50 text-red-600 rounded-[24px]">
                                                <Percent size={28} />
                                            </div>
                                            <div>
                                                <h4 className="heading-4">Impuesto al Valor Agregado</h4>
                                                <p className="caption font-bold text-gray-400">IVA Regional</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                                <span className="body-small font-black text-gray-900 uppercase">Aplicar IVA</span>
                                                <button
                                                    onClick={() => setTaxForm({ ...taxForm, aplicarIVA: !taxForm.aplicarIVA })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${taxForm.aplicarIVA ? "bg-red-500" : "bg-gray-200"}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${taxForm.aplicarIVA ? "left-7" : "left-1"}`} />
                                                </button>
                                            </div>

                                            <div className={`${!taxForm.aplicarIVA && "opacity-40 grayscale pointer-events-none"}`}>
                                                <label className="caption font-black text-gray-500 uppercase mb-3 block">Porcentaje IVA (%)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-gray-50 border-none rounded-2xl p-5 text-xl font-black text-gray-900 focus:ring-2 focus:ring-red-100"
                                                    value={taxForm.iva}
                                                    onChange={(e) => setTaxForm({ ...taxForm, iva: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* RETENCIONES CONFIG */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-amber-50 text-amber-600 rounded-[24px]">
                                                <AlertTriangle size={28} />
                                            </div>
                                            <div>
                                                <h4 className="heading-4">Retenciones de Honorarios</h4>
                                                <p className="caption font-bold text-gray-400">Prevención Fiscal</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                                                <span className="body-small font-black text-gray-900 uppercase">Aplicar Retención</span>
                                                <button
                                                    onClick={() => setTaxForm({ ...taxForm, aplicarRetencion: !taxForm.aplicarRetencion })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${taxForm.aplicarRetencion ? "bg-amber-500" : "bg-gray-200"}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${taxForm.aplicarRetencion ? "left-7" : "left-1"}`} />
                                                </button>
                                            </div>

                                            <div className={`${!taxForm.aplicarRetencion && "opacity-40 grayscale pointer-events-none"}`}>
                                                <label className="caption font-black text-gray-500 uppercase mb-3 block">Porcentaje Retención (%)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-gray-50 border-none rounded-2xl p-5 text-xl font-black text-gray-900 focus:ring-2 focus:ring-amber-100"
                                                    value={taxForm.retencion}
                                                    onChange={(e) => setTaxForm({ ...taxForm, retencion: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 text-gray-400 max-w-md">
                                        <Info size={20} className="shrink-0" />
                                        <p className="caption font-bold">Nota: Estos ajustes fiscales afectan los balances netos liquidados a los profesionales.</p>
                                    </div>
                                    <Button
                                        onClick={handleTaxSave}
                                        disabled={saving}
                                        className="bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black w-full md:w-auto"
                                    >
                                        Actualizar Tasas
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* AUDITORÍA Y TRANSPARENCIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
                <Card className="p-8 border-none ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] flex gap-6 items-start">
                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h4 className="body-large font-black text-gray-900 mb-1">Cálculo de Precisión Algorítmica</h4>
                        <p className="body-small text-gray-500 leading-relaxed">El sistema aplica el split en tiempo real al finalizar cada servicio, descontando impuestos y calculando la utilidad neta para la casa automáticamente.</p>
                    </div>
                </Card>
                <Card className="p-8 border-none ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] flex gap-6 items-start">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                        <GripVertical size={32} />
                    </div>
                    <div>
                        <h4 className="body-large font-black text-gray-900 mb-1">Priorización de Reglas</h4>
                        <p className="body-small text-gray-500 leading-relaxed">El motor de revenue prioriza: <span className="font-black text-blue-600">Servicio Especial &gt; Barbero Honorario &gt; Configuración General</span>. Garantizando siempre el acuerdo más justo.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
