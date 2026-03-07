import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Store, ToggleLeft, ToggleRight, Save, Loader2, ExternalLink, Plus, X, Tag, Package } from "lucide-react";
import api from "../../../services/api";
import { Card, Button, Badge } from "../../../components/ui";

export default function MarketplaceAdmin() {
    const { slug } = useParams();
    const [config, setConfig] = useState({
        activo: false,
        descripcion: "Productos de cuidado y estilo",
        whatsapp: "",
        bannerUrl: "",
        categorias: [],
    });
    const [newCat, setNewCat] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get(`/barberias/me`);
                const mp = res.data.barberia?.marketplace || res.data.marketplace || {};
                setConfig(prev => ({ ...prev, ...mp }));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.patch(`/barberias/configuracion/marketplace`, { marketplace: config });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            if (e.response?.data?.error === 'FEATURE_NOT_AVAILABLE') {
                alert('🚀 El Marketplace está disponible desde el Plan Pro ($29/mes).\n\nActualiza tu plan en Configuración → Suscripción.');
            } else {
                alert(e.response?.data?.message || 'Error al guardar');
            }
        } finally { setSaving(false); }
    };

    const addCat = (e) => {
        e.preventDefault();
        if (!newCat.trim() || config.categorias.includes(newCat.trim())) return;
        setConfig(c => ({ ...c, categorias: [...c.categorias, newCat.trim()] }));
        setNewCat("");
    };

    const removeCat = (cat) => setConfig(c => ({ ...c, categorias: c.categorias.filter(x => x !== cat) }));

    if (loading) return <div className="flex items-center justify-center py-20 text-gray-400 gap-2"><Loader2 className="animate-spin" size={20} /> Cargando...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 pb-24 lg:pb-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3">
                        <Store className="text-blue-600" size={30} />
                        Marketplace / Tienda Online
                    </h1>
                    <p className="body-large text-gray-600 mt-2">
                        Activa tu tienda pública y gestiona qué productos se muestran
                    </p>
                </div>
                <div className="flex gap-3">
                    {config.activo && (
                        <a href={`/${slug}/tienda`} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-gray-700 font-black text-sm hover:bg-gray-50 transition-all">
                            <ExternalLink size={16} /> Ver tienda
                        </a>
                    )}
                    <Button onClick={handleSave} disabled={saving}
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-black">
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {saved ? "¡Guardado!" : "Guardar cambios"}
                    </Button>
                </div>
            </header>

            {/* Toggle card */}
            <Card className="p-8 border-none ring-1 ring-gray-100 bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="heading-4 mb-1">Estado de la tienda</h2>
                        <p className="text-sm text-gray-500">
                            {config.activo
                                ? "Tu tienda está activa y visible en tu página pública"
                                : "La tienda está desactivada — los clientes no la verán"}
                        </p>
                    </div>
                    <button onClick={() => setConfig(c => ({ ...c, activo: !c.activo }))}
                        className="transition-transform active:scale-95">
                        {config.activo
                            ? <ToggleRight size={52} className="text-green-500" />
                            : <ToggleLeft size={52} className="text-gray-300" />}
                    </button>
                </div>
                {config.activo && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                        <p className="text-sm text-green-700 font-bold">
                            ✅ Tienda activa en: <a href={`/${slug}/tienda`} target="_blank" rel="noreferrer"
                                className="underline">/{slug}/tienda</a>
                        </p>
                    </motion.div>
                )}
            </Card>

            {/* Config */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-8 border-none ring-1 ring-gray-100 bg-white space-y-5">
                    <h2 className="heading-4">Información de la tienda</h2>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Descripción</label>
                        <input value={config.descripcion} onChange={e => setConfig(c => ({ ...c, descripcion: e.target.value }))}
                            placeholder="Ej: Productos de cuidado y estilo"
                            className="w-full bg-gray-50 rounded-2xl px-5 py-3 text-sm font-bold border-none outline-none focus:ring-4 focus:ring-blue-100" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            WhatsApp para recibir pedidos
                        </label>
                        <input value={config.whatsapp} onChange={e => setConfig(c => ({ ...c, whatsapp: e.target.value }))}
                            placeholder="+56912345678"
                            className="w-full bg-gray-50 rounded-2xl px-5 py-3 text-sm font-bold border-none outline-none focus:ring-4 focus:ring-blue-100" />
                        <p className="text-xs text-gray-400">Los pedidos llegarán como mensaje de WhatsApp</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">URL Banner (opcional)</label>
                        <input value={config.bannerUrl} onChange={e => setConfig(c => ({ ...c, bannerUrl: e.target.value }))}
                            placeholder="https://..."
                            className="w-full bg-gray-50 rounded-2xl px-5 py-3 text-sm font-bold border-none outline-none focus:ring-4 focus:ring-blue-100" />
                    </div>
                </Card>

                <Card className="p-8 border-none ring-1 ring-gray-100 bg-white space-y-5">
                    <h2 className="heading-4 flex items-center gap-2"><Tag size={18} /> Categorías de productos</h2>
                    <p className="text-xs text-gray-500">Define las categorías de tu tienda. Los productos se asignarán a estas categorías.</p>

                    <form onSubmit={addCat} className="flex gap-2">
                        <input value={newCat} onChange={e => setNewCat(e.target.value)}
                            placeholder="Ej: Pomadas, Aceites, Herramientas..."
                            className="flex-1 bg-gray-50 rounded-2xl px-5 py-3 text-sm font-bold border-none outline-none focus:ring-4 focus:ring-blue-100" />
                        <button type="submit" className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-colors">
                            <Plus size={18} />
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                            {config.categorias.length === 0 && (
                                <p className="text-xs text-gray-400 italic">Sin categorías — agrega una arriba</p>
                            )}
                            {config.categorias.map(cat => (
                                <motion.span key={cat} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-2xl text-xs font-black text-gray-700">
                                    {cat}
                                    <button onClick={() => removeCat(cat)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <X size={12} />
                                    </button>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </Card>
            </div>

            {/* Products link */}
            <Card className="p-6 border-none ring-1 ring-gray-100 bg-blue-50/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><Package size={22} /></div>
                    <div className="flex-1">
                        <p className="font-black text-gray-900">Gestión de productos</p>
                        <p className="text-sm text-gray-500">
                            Para configurar qué productos aparecen en la tienda, ve a la sección de Productos y activa
                            <strong> "Disponible en tienda"</strong> en cada producto que quieras mostrar.
                        </p>
                    </div>
                    <a href="./productos" className="px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-black text-gray-700 hover:bg-gray-50 transition-all whitespace-nowrap">
                        Ir a Productos →
                    </a>
                </div>
            </Card>
        </div>
    );
}
