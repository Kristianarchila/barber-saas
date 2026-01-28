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
    Check
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
            const msg = error.response?.data?.message || error.message;
            const detail = error.response?.data?.error || "";
            alert(`Error: ${msg}\n${detail}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneralSave = async () => {
        try {
            setSaving(true);
            await updateRevenueConfig({
                configuracionGeneral: generalForm
            });
            await fetchData();
            alert("Configuración actualizada correctamente");
        } catch (error) {
            alert(error.response?.data?.message || "Error al actualizar config");
        } finally {
            setSaving(false);
        }
    };

    const handleTaxSave = async () => {
        try {
            setSaving(true);
            await updateRevenueConfig({
                impuestos: taxForm
            });
            await fetchData();
            alert("Configuración de impuestos actualizada");
        } catch (error) {
            alert(error.response?.data?.message || "Error al actualizar config");
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
            alert("Error al guardar override");
        }
    };

    const handleAddOverrideServicio = async (servicioId) => {
        const servicio = servicios.find(s => s._id === servicioId);
        const pBarbero = prompt(`Porcentaje barbero para el servicio "${servicio.nombre}":`, "50");
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
            alert("Error al guardar override");
        }
    };

    const handleDeleteOverride = async (tipo, id) => {
        if (!confirm("¿Eliminar este ajuste específico y volver al valor por defecto?")) return;
        try {
            await deleteOverride(tipo, id);
            await fetchData();
        } catch (error) {
            alert("Error al eliminar override");
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <Skeleton variant="rectangular" height="h-20" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Skeleton variant="rectangular" height="h-48" />
                    <Skeleton variant="rectangular" height="h-48" className="md:col-span-3" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-slide-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gradient-primary flex items-center gap-3">
                        <PieChart size={40} className="text-primary-500" />
                        Configuración de Revenue Split
                    </h1>
                    <p className="text-neutral-400 text-lg mt-2">
                        Gestiona cómo se distribuyen los ingresos entre la barbería y tu equipo
                    </p>
                </div>
                <Button variant="ghost" onClick={fetchData} className="w-fit">
                    <RefreshCcw size={16} />
                    Actualizar datos
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* SIDEBAR TABS */}
                <div className="space-y-2">
                    {[
                        { id: 'general', label: 'General', icon: <Settings size={18} /> },
                        { id: 'barberos', label: 'Barberos', icon: <Users size={18} /> },
                        { id: 'servicios', label: 'Servicios', icon: <Scissors size={18} /> },
                        { id: 'impuestos', label: 'Impuestos & IVA', icon: <Percent size={18} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id
                                ? "bg-primary-500 text-white shadow-glow-primary"
                                : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="lg:col-span-3 space-y-6">

                    {/* TAB: GENERAL */}
                    {activeTab === 'general' && (
                        <Card className="overflow-hidden">
                            <div className="p-8 border-b border-neutral-800 bg-neutral-900 bg-opacity-30">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary-500 bg-opacity-20 rounded-2xl">
                                        <Settings className="text-primary-500" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Configuración General</h3>
                                        <p className="text-neutral-500">Porcentajes base y comportamiento del sistema</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* BARBERO SLIDER SIMULATION */}
                                    <div className="space-y-4 p-6 bg-neutral-900 rounded-3xl border border-neutral-800">
                                        <div className="flex justify-between items-center mb-6">
                                            <label className="text-lg font-black text-white">Split Predeterminado</label>
                                            <Badge variant="primary" size="lg" className="px-4 py-1.5">{generalForm.porcentajeDefaultBarbero}% Barbero</Badge>
                                        </div>

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
                                            className="w-full h-3 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                        />

                                        <div className="flex justify-between mt-4">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-neutral-500 uppercase">Barbero</p>
                                                <p className="text-3xl font-black text-white">{generalForm.porcentajeDefaultBarbero}%</p>
                                            </div>
                                            <div className="h-12 w-px bg-neutral-800" />
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-neutral-500 uppercase">Barbería</p>
                                                <p className="text-3xl font-black text-primary-500">{generalForm.porcentajeDefaultBarberia}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* OPTIONS */}
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-neutral-900 transition-colors border border-transparent hover:border-neutral-800 group">
                                            <div className="mt-1">
                                                <input
                                                    type="checkbox"
                                                    id="ajusteManual"
                                                    className="w-5 h-5 rounded-lg accent-primary-500"
                                                    checked={generalForm.permitirAjusteManual}
                                                    onChange={(e) => setGeneralForm({ ...generalForm, permitirAjusteManual: e.target.checked })}
                                                />
                                            </div>
                                            <label htmlFor="ajusteManual" className="cursor-pointer">
                                                <p className="font-bold text-white group-hover:text-primary-500 transition-colors">Permitir ajustes manuales</p>
                                                <p className="text-sm text-neutral-500">Permite editar montos específicos en el ledger después de cada reserva.</p>
                                            </label>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-neutral-900 transition-colors border border-transparent hover:border-neutral-800 group">
                                            <div className="mt-1">
                                                <input
                                                    type="checkbox"
                                                    id="requiereApro"
                                                    className="w-5 h-5 rounded-lg accent-primary-500"
                                                    checked={generalForm.requiereAprobacion}
                                                    onChange={(e) => setGeneralForm({ ...generalForm, requiereAprobacion: e.target.checked })}
                                                />
                                            </div>
                                            <label htmlFor="requiereApro" className="cursor-pointer">
                                                <p className="font-bold text-white group-hover:text-primary-500 transition-colors">Requiere aprobación manual</p>
                                                <p className="text-sm text-neutral-500">Las transacciones quedan pendientes hasta que el Admin o Barbero confirme el monto.</p>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-neutral-800">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full md:w-fit px-12"
                                        onClick={handleGeneralSave}
                                        disabled={saving}
                                    >
                                        {saving ? "Guardando..." : <><Save size={18} /> Guardar Cambios</>}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* TAB: BARBEROS */}
                    {activeTab === 'barberos' && (
                        <div className="space-y-6">
                            <Card>
                                <div className="p-8 border-b border-neutral-800 bg-neutral-900 bg-opacity-30 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-500 bg-opacity-20 rounded-2xl">
                                            <Users className="text-indigo-500" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white">Específicos por Barbero</h3>
                                            <p className="text-neutral-500">Define acuerdos personalizados por profesional</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-neutral-900 border-b border-neutral-800">
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-neutral-500 uppercase tracking-widest">Profesional</th>
                                                <th className="px-8 py-4 text-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">Acuerdo Actual</th>
                                                <th className="px-8 py-4 text-right text-[10px] font-black text-neutral-500 uppercase tracking-widest">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-900">
                                            {barberos.map(barbero => {
                                                const override = config?.overridesPorBarbero.find(o => o.barberoId === barbero._id && o.activo);
                                                return (
                                                    <tr key={barbero._id} className="hover:bg-neutral-900 transition-colors group">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <Avatar src={barbero.foto} name={barbero.nombre} size="md" className="border-2 border-neutral-800" />
                                                                <div>
                                                                    <p className="font-bold text-white">{barbero.nombre}</p>
                                                                    <p className="text-xs text-neutral-500">{barbero.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-center">
                                                            {override ? (
                                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 bg-opacity-20 rounded-2xl border border-indigo-500 border-opacity-30">
                                                                    <p className="text-lg font-black text-indigo-400">{override.porcentajeBarbero}%</p>
                                                                    <p className="text-[10px] font-black text-indigo-500 uppercase">Barbero</p>
                                                                </div>
                                                            ) : (
                                                                <Badge variant="neutral" size="sm">Predeterminado ({generalForm.porcentajeDefaultBarbero}%)</Badge>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleAddOverrideBarbero(barbero._id)}
                                                                    className="p-3 bg-neutral-800 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all shadow-sm"
                                                                    title="Editar Acuerdo"
                                                                >
                                                                    <Plus size={18} />
                                                                </button>
                                                                {override && (
                                                                    <button
                                                                        onClick={() => handleDeleteOverride('barbero', barbero._id)}
                                                                        className="p-3 bg-error-500 bg-opacity-10 rounded-xl text-error-500 hover:bg-error-500 hover:text-white transition-all shadow-sm"
                                                                        title="Restablecer a default"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            <div className="flex items-center gap-4 p-6 bg-info-500 bg-opacity-10 rounded-3xl border border-info-500 border-opacity-20">
                                <Info className="text-info-500 shrink-0" size={24} />
                                <p className="text-sm text-info-200">
                                    <span className="font-black">💡 Pro Tip:</span> Los acuerdos específicos por barbero tienen prioridad sobre la configuración general. Úsalos para premiar a tus mejores profesionales o incentivar a nuevos ingresos.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TAB: SERVICIOS */}
                    {activeTab === 'servicios' && (
                        <Card>
                            <div className="p-8 border-b border-neutral-800 bg-neutral-900 bg-opacity-30 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500 bg-opacity-20 rounded-2xl">
                                        <Scissors className="text-amber-500" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Override por Servicio</h3>
                                        <p className="text-neutral-500">Ajusta el split según la complejidad o costo del servicio</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-neutral-900 border-b border-neutral-800">
                                            <th className="px-8 py-4 text-left text-[10px] font-black text-neutral-500 uppercase tracking-widest">Servicio</th>
                                            <th className="px-8 py-4 text-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">Split Especial</th>
                                            <th className="px-8 py-4 text-right text-[10px] font-black text-neutral-500 uppercase tracking-widest">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-900">
                                        {servicios.map(servicio => {
                                            const override = config?.overridesPorServicio.find(o => o.servicioId === servicio._id && o.activo);
                                            return (
                                                <tr key={servicio._id} className="hover:bg-neutral-900 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <p className="font-bold text-white">{servicio.nombre}</p>
                                                        <p className="text-xs text-neutral-500">${servicio.precio}</p>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        {override ? (
                                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 bg-opacity-20 rounded-2xl border border-amber-500 border-opacity-30">
                                                                <p className="text-lg font-black text-amber-400">{override.porcentajeBarbero}%</p>
                                                                <p className="text-[10px] font-black text-amber-500 uppercase">Barbero</p>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="neutral" size="sm">Sin ajuste</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleAddOverrideServicio(servicio._id)}
                                                                className="p-3 bg-neutral-800 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all"
                                                            >
                                                                <Plus size={18} />
                                                            </button>
                                                            {override && (
                                                                <button
                                                                    onClick={() => handleDeleteOverride('servicio', servicio._id)}
                                                                    className="p-3 bg-error-500 bg-opacity-10 rounded-xl text-error-500 hover:bg-error-500 transition-all"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* TAB: IMPUESTOS */}
                    {activeTab === 'impuestos' && (
                        <Card>
                            <div className="p-8 border-b border-neutral-800 bg-neutral-900 bg-opacity-30">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-error-500 bg-opacity-20 rounded-2xl">
                                        <Percent className="text-error-500" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Taxes & Retenciones</h3>
                                        <p className="text-neutral-500">Configuración fiscal para cálculos automáticos</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* IVA */}
                                    <div className="space-y-6 p-6 bg-neutral-900 rounded-3xl border border-neutral-800">
                                        <div className="flex justify-between items-center bg-neutral-800 p-4 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="taxIva"
                                                    className="w-5 h-5 accent-error-500"
                                                    checked={taxForm.aplicarIVA}
                                                    onChange={(e) => setTaxForm({ ...taxForm, aplicarIVA: e.target.checked })}
                                                />
                                                <label htmlFor="taxIva" className="font-black text-white cursor-pointer uppercase text-xs">Calcular IVA (19%)</label>
                                            </div>
                                            <Badge variant={taxForm.aplicarIVA ? "error" : "neutral"} size="sm">{taxForm.aplicarIVA ? "ON" : "OFF"}</Badge>
                                        </div>

                                        <div className={`space-y-4 transition-all ${taxForm.aplicarIVA ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                                            <label className="block text-sm font-bold text-neutral-400">Porcentaje de IVA (%)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-neutral-800 text-white p-4 rounded-2xl border border-neutral-700 outline-none focus:border-error-500 transition-all"
                                                value={taxForm.iva}
                                                onChange={(e) => setTaxForm({ ...taxForm, iva: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    {/* RETENCIÓN */}
                                    <div className="space-y-6 p-6 bg-neutral-900 rounded-3xl border border-neutral-800">
                                        <div className="flex justify-between items-center bg-neutral-800 p-4 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="taxRet"
                                                    className="w-5 h-5 accent-warning-500"
                                                    checked={taxForm.aplicarRetencion}
                                                    onChange={(e) => setTaxForm({ ...taxForm, aplicarRetencion: e.target.checked })}
                                                />
                                                <label htmlFor="taxRet" className="font-black text-white cursor-pointer uppercase text-xs">Retención de Honorarios</label>
                                            </div>
                                            <Badge variant={taxForm.aplicarRetencion ? "warning" : "neutral"} size="sm">{taxForm.aplicarRetencion ? "ON" : "OFF"}</Badge>
                                        </div>

                                        <div className={`space-y-4 transition-all ${taxForm.aplicarRetencion ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                                            <label className="block text-sm font-bold text-neutral-400">Porcentaje de Retención (%)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-neutral-800 text-white p-4 rounded-2xl border border-neutral-700 outline-none focus:border-warning-500 transition-all"
                                                value={taxForm.retencion}
                                                onChange={(e) => setTaxForm({ ...taxForm, retencion: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-error-500 bg-opacity-5 rounded-3xl border border-error-500 border-opacity-10 flex gap-4">
                                    <AlertTriangle className="text-error-500 shrink-0" size={24} />
                                    <div>
                                        <p className="font-bold text-white uppercase text-xs mb-1">Aviso Importante</p>
                                        <p className="text-sm text-neutral-400">Los impuestos se calculan sobre el monto que corresponde al barbero. No alteran el precio final del servicio para el cliente.</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-neutral-800">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full md:w-fit px-12"
                                        onClick={handleTaxSave}
                                        disabled={saving}
                                    >
                                        {saving ? "Guardando..." : "Actualizar Impuestos"}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                </div>
            </div>

            {/* FOOTER INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                <div className="p-8 bg-neutral-900 bg-opacity-50 rounded-[40px] border border-neutral-800 flex items-start gap-4 shadow-xl">
                    <div className="p-4 bg-primary-500 bg-opacity-20 rounded-3xl">
                        <CheckCircle2 className="text-primary-500" size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-white mb-2">Transparencia Total</h4>
                        <p className="text-neutral-400 leading-relaxed">
                            El sistema registra automáticamente cada movimiento. Los barberos pueden ver su balance en tiempo real, lo que reduce errores y disputas.
                        </p>
                    </div>
                </div>

                <div className="p-8 bg-neutral-900 bg-opacity-50 rounded-[40px] border border-neutral-800 flex items-start gap-4 shadow-xl">
                    <div className="p-4 bg-accent-500 bg-opacity-20 rounded-3xl">
                        <PieChart className="text-accent-500" size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-white mb-2">Prioridad de Reglas</h4>
                        <p className="text-neutral-400 leading-relaxed">
                            Las reglas se aplican de lo más específico a lo general: <span className="text-white font-bold italic">Reserva &gt; Servicio &gt; Barbero &gt; Configuración General</span>.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
