import { useState, useEffect } from "react";
import { User, Mail, Lock, Save, Eye, EyeOff, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

export default function MiCuenta() {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);

    // Datos del perfil
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [savingPerfil, setSavingPerfil] = useState(false);

    // Cambio de contraseña
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    useEffect(() => { fetchPerfil(); }, []);

    const fetchPerfil = async () => {
        try {
            setLoading(true);
            const res = await api.get("/auth/me");
            const u = res.data.user;
            setPerfil(u);
            setNombre(u.nombre || "");
            setTelefono(u.telefono || "");
        } catch {
            toast.error("No se pudo cargar el perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePerfil = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) { toast.error("El nombre no puede estar vacío"); return; }
        setSavingPerfil(true);
        try {
            const res = await api.patch("/auth/me", { nombre, telefono });
            setPerfil(res.data.user);
            toast.success("Perfil actualizado");
        } catch (err) {
            toast.error(err.response?.data?.message || "Error al guardar");
        } finally { setSavingPerfil(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!pwForm.currentPassword || !pwForm.newPassword) {
            toast.error("Completa todos los campos"); return;
        }
        if (pwForm.newPassword.length < 8) {
            toast.error("La nueva contraseña debe tener al menos 8 caracteres"); return;
        }
        if (pwForm.newPassword !== pwForm.confirm) {
            toast.error("Las contraseñas nuevas no coinciden"); return;
        }
        setSavingPw(true);
        try {
            await api.patch("/auth/me/password", {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword
            });
            toast.success("Contraseña cambiada correctamente");
            setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Error al cambiar contraseña");
        } finally { setSavingPw(false); }
    };

    const pwStrength = (pw) => {
        if (!pw) return null;
        if (pw.length >= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^a-zA-Z0-9]/.test(pw)) return { label: "Fuerte", color: "bg-green-500", width: "w-full" };
        if (pw.length >= 8) return { label: "Aceptable", color: "bg-amber-400", width: "w-2/3" };
        return { label: "Débil", color: "bg-red-400", width: "w-1/3" };
    };
    const strength = pwStrength(pwForm.newPassword);

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-slide-in">

            {/* HEADER */}
            <header>
                <h1 className="heading-1 flex items-center gap-3">
                    <User className="text-blue-600" size={30} />
                    Mi Cuenta
                </h1>
                <p className="body text-gray-500 mt-1">Actualiza tu información personal y seguridad</p>
            </header>

            {/* AVATAR + INFO */}
            <div className="card card-padding shadow-sm ring-1 ring-gray-100 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-black flex-shrink-0">
                    {(perfil?.nombre || "A").charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="heading-4 text-gray-900">{perfil?.nombre}</p>
                    <p className="body-small text-gray-500">{perfil?.email}</p>
                    <span className="badge bg-blue-50 text-blue-700 ring-1 ring-blue-200 mt-1.5 inline-block capitalize">
                        {perfil?.rol?.replace("_", " ").toLowerCase() || "admin"}
                    </span>
                </div>
            </div>

            {/* DATOS PERSONALES */}
            <div className="card card-padding shadow-sm ring-1 ring-gray-100 space-y-6">
                <h2 className="heading-3 flex items-center gap-2">
                    <User size={18} className="text-blue-600" />
                    Datos Personales
                </h2>

                <form onSubmit={handleSavePerfil} className="space-y-5">
                    <div className="space-y-2">
                        <label className="label">Nombre completo</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            className="input"
                            placeholder="Tu nombre..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="label">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={perfil?.email || ""}
                                readOnly
                                className="input pl-10 bg-gray-50 text-gray-400 cursor-not-allowed"
                            />
                        </div>
                        <p className="caption text-gray-400">El email no puede cambiarse desde aquí.</p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={savingPerfil}
                            className="btn btn-primary"
                        >
                            {savingPerfil ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {savingPerfil ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>

            {/* SEGURIDAD */}
            <div className="card card-padding shadow-sm ring-1 ring-gray-100 space-y-6">
                <h2 className="heading-3 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-blue-600" />
                    Cambiar Contraseña
                </h2>

                <form onSubmit={handleChangePassword} className="space-y-5">
                    {/* Contraseña actual */}
                    <div className="space-y-2">
                        <label className="label">Contraseña actual</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={pwForm.currentPassword}
                                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                                className="input pl-10 pr-12"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Nueva contraseña */}
                    <div className="space-y-2">
                        <label className="label">Nueva contraseña</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showNew ? "text" : "password"}
                                value={pwForm.newPassword}
                                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                                className="input pl-10 pr-12"
                                placeholder="Mínimo 8 caracteres"
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {strength && (
                            <div className="space-y-1">
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                                </div>
                                <p className={`caption font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                            </div>
                        )}
                    </div>

                    {/* Confirmar */}
                    <div className="space-y-2">
                        <label className="label">Confirmar nueva contraseña</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={pwForm.confirm}
                                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                                className={`input pr-10 ${pwForm.confirm && pwForm.confirm !== pwForm.newPassword ? 'ring-2 ring-red-300 border-red-300' : ''}`}
                                placeholder="Repite la nueva contraseña"
                                autoComplete="new-password"
                            />
                            {pwForm.confirm && pwForm.confirm === pwForm.newPassword && pwForm.newPassword && (
                                <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                        </div>
                        {pwForm.confirm && pwForm.confirm !== pwForm.newPassword && (
                            <p className="caption text-red-500">Las contraseñas no coinciden</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={savingPw || !pwForm.currentPassword || !pwForm.newPassword || pwForm.newPassword !== pwForm.confirm}
                            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {savingPw ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                            {savingPw ? "Actualizando..." : "Cambiar Contraseña"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
