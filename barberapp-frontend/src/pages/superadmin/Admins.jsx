import { useEffect, useState, useRef } from "react";
import {
    Users, Search, ShieldCheck, Store, X,
    CheckCircle, Save, RefreshCw, ChevronDown, Loader2
} from "lucide-react";
import {
    getAdminsSuperAdmin,
    actualizarSedesAdmin,
    getBarberias
} from "../../services/superAdminService";

// ─── SEDE ASSIGNMENT MODAL ────────────────────────────────────────────────────
function SedesModal({ admin, barberias, onClose, onSave }) {
    const [selected, setSelected] = useState(admin.barberiaIds.map(b => b._id || b));
    const [saving, setSaving] = useState(false);

    const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

    const handleSave = async () => {
        setSaving(true);
        try { await onSave(admin._id, selected); onClose(); }
        catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h3 className="font-black text-gray-900">Gestionar Sedes</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{admin.nombre}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-80 overflow-y-auto space-y-2">
                    {barberias.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-6">No hay barberías disponibles</p>
                    ) : barberias.map(b => {
                        const checked = selected.includes(b._id);
                        return (
                            <label key={b._id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${checked ? 'bg-gray-900 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-white border-white' : 'border-gray-300'}`}>
                                    {checked && <CheckCircle size={14} className="text-gray-900" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={checked} onChange={() => toggle(b._id)} />
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">{b.nombre.charAt(0)}</div>
                                    <span className="font-semibold text-sm">{b.nombre}</span>
                                </div>
                            </label>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
                    <span className="text-xs text-gray-400">{selected.length} sede{selected.length !== 1 ? 's' : ''} seleccionada{selected.length !== 1 ? 's' : ''}</span>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancelar</button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Admins() {
    const [admins, setAdmins] = useState([]);
    const [barberias, setBarberias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [adminModal, setAdminModal] = useState(null);
    const debounce = useRef(null);

    useEffect(() => { cargarDatos(); }, []);

    async function cargarDatos() {
        setLoading(true);
        try {
            const [adminsData, barberiasData] = await Promise.all([
                getAdminsSuperAdmin(),
                getBarberias({ limit: 100 })
            ]);
            setAdmins(adminsData);
            setBarberias(barberiasData.barberias || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    const handleSaveSedes = async (adminId, sedes) => {
        await actualizarSedesAdmin(adminId, sedes);
        cargarDatos();
    };

    const filtered = search
        ? admins.filter(a => a.nombre?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase()))
        : admins;

    return (
        <div className="space-y-8 animate-slide-in">
            {/* HEADER */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">SuperAdmin / Administradores</p>
                    <h1 className="text-3xl font-black text-gray-900">Administradores</h1>
                    <p className="text-gray-500 text-sm mt-1">Gestiona los admins y sus barberías asignadas</p>
                </div>
                <button onClick={cargarDatos} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
                </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: <Users size={20} className="text-blue-500" />, bg: 'bg-blue-50', label: 'Total Admins', value: admins.length, color: 'text-blue-700' },
                    { icon: <ShieldCheck size={20} className="text-green-500" />, bg: 'bg-green-50', label: 'Con Sedes Asignadas', value: admins.filter(a => a.barberiaIds?.length > 0).length, color: 'text-green-700' },
                    { icon: <Store size={20} className="text-purple-500" />, bg: 'bg-purple-50', label: 'Total Barberías', value: barberias.length, color: 'text-purple-700' },
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 ${s.bg} rounded-xl`}>{s.icon}</div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
                                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* SEARCH */}
            <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-all"
                />
            </div>

            {/* TABLE */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{filtered.length} administrador{filtered.length !== 1 ? 'es' : ''}</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                {['Administrador', 'Email', 'Sedes Asignadas', 'Estado', ''].map((h, i) => (
                                    <th key={i} className={`px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users size={32} className="text-gray-200" />
                                            <p className="text-gray-400 text-sm">No se encontraron administradores</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map(admin => (
                                <tr key={admin._id} className="border-b border-gray-50 hover:bg-gray-50 transition-all group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-black text-sm">
                                                {admin.nombre?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{admin.nombre}</p>
                                                <p className="text-xs text-gray-400 font-mono">{admin.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-gray-500 text-sm">{admin.email}</td>
                                    <td className="px-5 py-4">
                                        {admin.barberiaIds?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {admin.barberiaIds.slice(0, 2).map(b => (
                                                    <span key={b._id || b} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full">
                                                        {b.nombre || 'Sede'}
                                                    </span>
                                                ))}
                                                {admin.barberiaIds.length > 2 && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">+{admin.barberiaIds.length - 2}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sin sedes asignadas</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${admin.activo !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${admin.activo !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {admin.activo !== false ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => setAdminModal(admin)}
                                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all ml-auto"
                                        >
                                            <Store size={13} /> Sedes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {adminModal && (
                <SedesModal
                    admin={adminModal}
                    barberias={barberias}
                    onClose={() => setAdminModal(null)}
                    onSave={handleSaveSedes}
                />
            )}
        </div>
    );
}
