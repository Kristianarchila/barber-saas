import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, Plus, Pencil, Trash2, AlertTriangle, X,
    ChevronDown, Loader2, ArrowUpDown, BarChart2
} from "lucide-react";
import inventarioService from "../../services/inventarioService";
import { obtenerProductos } from "../../services/productosService";
import { Card, Button, Badge } from "../../components/ui";
import dayjs from "dayjs";

const UNIDADES = ["unidad", "kg", "litro", "caja", "paquete"];

const fmt = (n) => new Intl.NumberFormat("es-CL").format(n || 0);

const EMPTY_FORM = {
    productoId: "", cantidadActual: 0, stockMinimo: 5,
    stockMaximo: 100, ubicacion: "", unidadMedida: "unidad"
};

export default function Inventario() {
    const { slug } = useParams();
    const [inventario, setInventario] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("todos");

    // Modals
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(null);    // item to edit
    const [modalMov, setModalMov] = useState(null);          // item for movement

    const cargar = async () => {
        try {
            setLoading(true);
            const [invData, alertasData, prodsData] = await Promise.all([
                inventarioService.getInventario(slug),
                inventarioService.getAlertasStock(slug),
                obtenerProductos(slug),
            ]);
            setInventario(invData.inventario || []);
            setAlertas(alertasData.alertas || []);
            setProductos(prodsData.productos || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { cargar(); }, [slug]);

    const handleEliminar = async (item) => {
        if (!window.confirm(`¿Eliminar ${item.producto?.nombre} del inventario?`)) return;
        try {
            await inventarioService.deleteInventario(slug, item._id);
            await cargar();
        } catch (e) { alert("Error al eliminar"); }
    };

    const inventarioFiltrado = filtro === "bajoStock"
        ? inventario.filter(i => i.bajoPuntoReorden)
        : inventario;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <Package className="text-blue-600" size={30} />
                        Inventario
                    </h1>
                    <p className="body-large text-gray-600 mt-2">Control de existencias y reposición</p>
                </div>
                <Button onClick={() => setModalCrear(true)}
                    className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-black">
                    <Plus size={18} /> Nuevo Producto
                </Button>
            </header>

            {/* Alerta bajo stock */}
            {alertas.length > 0 && (
                <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="font-black text-amber-900">Reposición Necesaria</p>
                        <p className="text-sm text-amber-700">
                            <strong>{alertas.length}</strong> {alertas.length === 1 ? "producto" : "productos"} bajo el punto de reorden
                        </p>
                    </div>
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total productos", val: inventario.length, color: "text-gray-900" },
                    { label: "Bajo stock", val: alertas.length, color: "text-amber-600" },
                    { label: "Stock OK", val: inventario.length - alertas.length, color: "text-green-600" },
                    { label: "Productos", val: productos.length, color: "text-blue-600" },
                ].map(k => (
                    <Card key={k.label} className="p-5 border-none ring-1 ring-gray-100 bg-white">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{k.label}</p>
                        <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.val}</p>
                    </Card>
                ))}
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
                {[
                    { id: "todos", label: `Todos (${inventario.length})` },
                    { id: "bajoStock", label: `Bajo Stock (${alertas.length})` },
                ].map(f => (
                    <button key={f.id} onClick={() => setFiltro(f.id)}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all
                            ${filtro === f.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Tabla */}
            <Card className="p-0 border-none ring-1 ring-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-sm text-gray-400 font-bold gap-2">
                        <Loader2 className="animate-spin" size={18} /> Cargando inventario...
                    </div>
                ) : inventarioFiltrado.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                        <Package size={48} className="opacity-20" />
                        <p className="font-black text-sm">
                            {filtro === "bajoStock" ? "Sin productos bajo stock" : "No hay productos en inventario"}
                        </p>
                        {filtro === "todos" && (
                            <Button onClick={() => setModalCrear(true)}
                                className="mt-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2">
                                <Plus size={16} /> Añadir primer producto
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100">
                                    {["Producto", "Stock actual", "Mín / Máx", "Unidad", "Ubicación", "Estado", ""].map(h => (
                                        <th key={h} className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {inventarioFiltrado.map(item => (
                                    <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className={`hover:bg-gray-50/40 transition-colors group ${item.bajoPuntoReorden ? "bg-amber-50/20" : ""}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.producto?.imagen ? (
                                                    <img src={item.producto.imagen} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
                                                        <Package size={16} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{item.producto?.nombre || "—"}</p>
                                                    <p className="text-xs text-gray-400">{item.producto?.categoria || ""}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xl font-black ${item.bajoPuntoReorden ? "text-amber-600" : "text-gray-900"}`}>
                                                {fmt(item.cantidadActual)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-bold">
                                            {item.stockMinimo} / {item.stockMaximo}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 capitalize">
                                            {item.unidadMedida}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.ubicacion || <span className="text-gray-300 italic">Sin ubicación</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`border-none text-xs font-black px-3 ${item.bajoPuntoReorden
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-green-50 text-green-700"}`}>
                                                {item.bajoPuntoReorden ? "REPOSICIÓN" : "OK"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setModalMov(item)} title="Registrar movimiento"
                                                    className="p-2 hover:bg-blue-50 rounded-xl text-blue-500 transition-colors">
                                                    <ArrowUpDown size={15} />
                                                </button>
                                                <button onClick={() => setModalEditar(item)} title="Editar"
                                                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                                                    <Pencil size={15} />
                                                </button>
                                                <button onClick={() => handleEliminar(item)} title="Eliminar"
                                                    className="p-2 hover:bg-red-50 rounded-xl text-red-400 transition-colors">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal Crear */}
            <AnimatePresence>
                {modalCrear && (
                    <ModalCrear
                        slug={slug}
                        productos={productos}
                        inventario={inventario}
                        onClose={() => setModalCrear(false)}
                        onSuccess={cargar}
                    />
                )}
            </AnimatePresence>

            {/* Modal Editar */}
            <AnimatePresence>
                {modalEditar && (
                    <ModalEditar
                        slug={slug}
                        item={modalEditar}
                        onClose={() => setModalEditar(null)}
                        onSuccess={cargar}
                    />
                )}
            </AnimatePresence>

            {/* Modal Movimiento */}
            <AnimatePresence>
                {modalMov && (
                    <ModalMovimiento
                        slug={slug}
                        item={modalMov}
                        onClose={() => setModalMov(null)}
                        onSuccess={cargar}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Modal Crear ─────────────────────────────────── */
function ModalCrear({ slug, productos, inventario, onClose, onSuccess }) {
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);

    // Filter out products already in inventory
    const productosDisponibles = productos.filter(
        p => !inventario.some(i => i.producto?._id === p._id || i.producto === p._id)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.productoId) return alert("Seleccioná un producto");
        try {
            setSaving(true);
            await inventarioService.createInventario(slug, {
                productoId: form.productoId,
                cantidadActual: Number(form.cantidadActual),
                stockMinimo: Number(form.stockMinimo),
                stockMaximo: Number(form.stockMaximo),
                ubicacion: form.ubicacion,
                unidadMedida: form.unidadMedida,
            });
            onSuccess();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Error al crear el ítem");
        } finally { setSaving(false); }
    };

    return (
        <ModalShell title="Nuevo ítem de inventario" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Producto *">
                    <select value={form.productoId} onChange={e => setForm(f => ({ ...f, productoId: e.target.value }))} required
                        className="select-field">
                        <option value="">Seleccionar producto</option>
                        {productosDisponibles.map(p => (
                            <option key={p._id} value={p._id}>{p.nombre}</option>
                        ))}
                    </select>
                </Field>
                <div className="grid grid-cols-3 gap-3">
                    <Field label="Stock inicial">
                        <input type="number" min="0" value={form.cantidadActual}
                            onChange={e => setForm(f => ({ ...f, cantidadActual: e.target.value }))}
                            className="input-field" />
                    </Field>
                    <Field label="Stock mín.">
                        <input type="number" min="0" value={form.stockMinimo}
                            onChange={e => setForm(f => ({ ...f, stockMinimo: e.target.value }))}
                            className="input-field" />
                    </Field>
                    <Field label="Stock máx.">
                        <input type="number" min="0" value={form.stockMaximo}
                            onChange={e => setForm(f => ({ ...f, stockMaximo: e.target.value }))}
                            className="input-field" />
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Unidad de medida">
                        <select value={form.unidadMedida} onChange={e => setForm(f => ({ ...f, unidadMedida: e.target.value }))}
                            className="select-field">
                            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </Field>
                    <Field label="Ubicación">
                        <input type="text" value={form.ubicacion} placeholder="ej: Estante A"
                            onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
                            className="input-field" />
                    </Field>
                </div>
                <ModalFooter onClose={onClose} saving={saving} label="Agregar al Inventario" />
            </form>
        </ModalShell>
    );
}

/* ─── Modal Editar ─────────────────────────────────── */
function ModalEditar({ slug, item, onClose, onSuccess }) {
    const [form, setForm] = useState({
        stockMinimo: item.stockMinimo,
        stockMaximo: item.stockMaximo,
        ubicacion: item.ubicacion || "",
        unidadMedida: item.unidadMedida || "unidad",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await inventarioService.updateInventario(slug, item._id, {
                stockMinimo: Number(form.stockMinimo),
                stockMaximo: Number(form.stockMaximo),
                ubicacion: form.ubicacion,
                unidadMedida: form.unidadMedida,
            });
            onSuccess();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Error al actualizar");
        } finally { setSaving(false); }
    };

    return (
        <ModalShell title={`Editar: ${item.producto?.nombre}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Stock mínimo">
                        <input type="number" min="0" value={form.stockMinimo}
                            onChange={e => setForm(f => ({ ...f, stockMinimo: e.target.value }))}
                            className="input-field" />
                    </Field>
                    <Field label="Stock máximo">
                        <input type="number" min="0" value={form.stockMaximo}
                            onChange={e => setForm(f => ({ ...f, stockMaximo: e.target.value }))}
                            className="input-field" />
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Unidad de medida">
                        <select value={form.unidadMedida} onChange={e => setForm(f => ({ ...f, unidadMedida: e.target.value }))}
                            className="select-field">
                            {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </Field>
                    <Field label="Ubicación">
                        <input type="text" value={form.ubicacion} placeholder="ej: Estante A"
                            onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
                            className="input-field" />
                    </Field>
                </div>
                <ModalFooter onClose={onClose} saving={saving} label="Guardar cambios" />
            </form>
        </ModalShell>
    );
}

/* ─── Modal Movimiento ─────────────────────────────── */
function ModalMovimiento({ slug, item, onClose, onSuccess }) {
    const [form, setForm] = useState({ tipo: "entrada", cantidad: "", motivo: "", observaciones: "" });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.cantidad || !form.motivo) return alert("Cantidad y motivo son requeridos");
        try {
            setSaving(true);
            await inventarioService.registrarMovimiento(slug, item._id, { ...form, cantidad: Number(form.cantidad) });
            onSuccess();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Error al registrar movimiento");
        } finally { setSaving(false); }
    };

    return (
        <ModalShell title={`Movimiento: ${item.producto?.nombre}`} onClose={onClose}>
            <p className="text-xs text-gray-400 font-bold -mt-2 mb-4">
                Stock actual: <span className="text-gray-700">{item.cantidadActual} {item.unidadMedida}</span>
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Tipo">
                    <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                        className="select-field">
                        <option value="entrada">Entrada (+)</option>
                        <option value="salida">Salida (−)</option>
                        <option value="ajuste">Ajuste manual</option>
                        <option value="devolucion">Devolución</option>
                    </select>
                </Field>
                <Field label={`Cantidad ${form.tipo === "ajuste" ? "(nuevo total)" : ""}`}>
                    <input type="number" min="0" value={form.cantidad} required
                        onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))}
                        className="input-field" />
                </Field>
                <Field label="Motivo *">
                    <input type="text" value={form.motivo} required placeholder="ej: Compra a distribuidor"
                        onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                        className="input-field" />
                </Field>
                <Field label="Observaciones">
                    <textarea value={form.observaciones} rows={2} placeholder="Opcional"
                        onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                        className="input-field resize-none" />
                </Field>
                <ModalFooter onClose={onClose} saving={saving} label="Registrar movimiento" />
            </form>
        </ModalShell>
    );
}

/* ─── Shared modal components ──────────────────────── */
function ModalShell({ title, onClose, children }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-md">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-black text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </motion.div>
        </motion.div>
    );
}

function Field({ label, children }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

function ModalFooter({ onClose, saving, label }) {
    return (
        <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-50">
                Cancelar
            </button>
            <button type="submit" disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-gray-900 text-white text-sm font-black hover:bg-black flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                {label}
            </button>
        </div>
    );
}

/* Global field styles injected via className */
// .input-field and .select-field defined inline below since no CSS module
const style = document.createElement("style");
style.textContent = `
.input-field, .select-field {
    width: 100%; background: #f9fafb; border: none; border-radius: 1rem;
    padding: 10px 14px; font-size: 0.875rem; font-weight: 700; outline: none;
    appearance: none;
}
.input-field:focus, .select-field:focus { box-shadow: 0 0 0 3px #e0e7ff; }
`;
if (!document.querySelector("#inv-style")) { style.id = "inv-style"; document.head.appendChild(style); }
