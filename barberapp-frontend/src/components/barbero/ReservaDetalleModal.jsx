import dayjs from "dayjs";
import "dayjs/locale/es";
import {
    X,
    Clock,
    Calendar,
    User,
    Scissors,
    CheckCircle,
    XCircle,
    Phone,
    Mail,
    DollarSign,
    Info
} from "lucide-react";
import { Badge } from "../ui";
import WhatsAppButton from "../WhatsAppButton";

dayjs.locale("es");

const ESTADO_BADGE = {
    RESERVADA: { variant: "primary", label: "Reservada" },
    COMPLETADA: { variant: "success", label: "Completada" },
    CANCELADA: { variant: "destructive", label: "Cancelada" }
};

export default function ReservaDetalleModal({
    reserva,
    onClose,
    onCompletar,
    onCancelar,
    completando = false,
    cancelando = false,
}) {
    if (!reserva) return null;

    const badge = ESTADO_BADGE[reserva.estado] || ESTADO_BADGE.RESERVADA;
    const fechaFmt = dayjs(reserva.fecha).format("dddd D [de] MMMM [de] YYYY");
    const precio = reserva.precioSnapshot?.precioFinal ?? reserva.precio ?? 0;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">

                {/* HEADER — color según estado */}
                <div className={`p-6 relative ${reserva.estado === "CANCELADA"
                        ? "bg-red-600"
                        : reserva.estado === "COMPLETADA"
                            ? "bg-green-600"
                            : "bg-blue-600"
                    }`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                    >
                        <X size={18} className="text-white" />
                    </button>

                    <Badge
                        className="mb-3 bg-white/20 text-white border-white/30 border backdrop-blur-sm text-xs font-bold uppercase tracking-wide"
                    >
                        {badge.label}
                    </Badge>

                    <h2 className="text-white font-black text-xl leading-tight">
                        {reserva.servicioId?.nombre || "Servicio"}
                    </h2>
                    <p className="text-white/80 text-sm capitalize mt-1">{fechaFmt}</p>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-5">

                    {/* Hora y duración */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Horario</p>
                            <p className="text-gray-900 font-bold">
                                {reserva.hora}
                                {reserva.horaFin ? ` — ${reserva.horaFin}` : ""}
                            </p>
                        </div>
                    </div>

                    {/* Cliente */}
                    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">Cliente</p>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-black flex-shrink-0">
                                {(reserva.nombreCliente || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-gray-900 font-bold">{reserva.nombreCliente}</p>
                                {reserva.emailCliente && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Mail size={11} className="text-gray-400" />
                                        {reserva.emailCliente}
                                    </p>
                                )}
                            </div>
                        </div>

                        {reserva.telefonoCliente && (
                            <WhatsAppButton
                                phoneNumber={reserva.telefonoCliente}
                                message={`Hola ${reserva.nombreCliente}, te contacto sobre tu cita del ${dayjs(reserva.fecha).format("DD/MM/YYYY")} a las ${reserva.hora}.`}
                                label={reserva.telefonoCliente}
                                className="mt-1"
                            />
                        )}
                    </div>

                    {/* Servicio + precio */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                                <Scissors size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Servicio</p>
                                <p className="text-gray-900 font-semibold">{reserva.servicioId?.nombre || "—"}</p>
                            </div>
                        </div>
                        {precio > 0 && (
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Precio</p>
                                <p className="text-gray-900 font-black text-lg">
                                    ${precio.toLocaleString("es-CL")}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ACCIONES — solo si está RESERVADA */}
                    {reserva.estado === "RESERVADA" && (
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => { onCompletar(reserva._id || reserva.id); onClose(); }}
                                disabled={completando || cancelando}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                <CheckCircle size={18} />
                                {completando ? "Completando..." : "Completar"}
                            </button>
                            <button
                                onClick={() => { onCancelar(reserva._id || reserva.id); onClose(); }}
                                disabled={completando || cancelando}
                                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                            >
                                <XCircle size={18} />
                                {cancelando ? "Cancelando..." : "Cancelar"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
