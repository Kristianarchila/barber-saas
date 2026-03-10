import { useState } from 'react';
import PropTypes from 'prop-types';
import { Clock, Scissors, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * CeldaReserva - Premium reservation cell for calendar grid
 * Shows barber avatar, client name, service, and an elegant tooltip
 */
export default function CeldaReserva({ reserva, onClick }) {
    const [showTooltip, setShowTooltip] = useState(false);

    // Accent colors per status (gradient stops + badge bg)
    const statusConfig = {
        RESERVADA:  { from: '#3b82f6', to: '#2563eb', badge: 'bg-blue-500',   label: 'Reservada',   Icon: AlertCircle },
        CONFIRMADA: { from: '#22c55e', to: '#16a34a', badge: 'bg-green-500',  label: 'Confirmada',  Icon: CheckCircle },
        COMPLETADA: { from: '#6b7280', to: '#4b5563', badge: 'bg-gray-500',   label: 'Completada',  Icon: CheckCircle },
        CANCELADA:  { from: '#ef4444', to: '#dc2626', badge: 'bg-red-500',    label: 'Cancelada',   Icon: XCircle     },
        NO_ASISTIO: { from: '#f97316', to: '#ea580c', badge: 'bg-orange-500', label: 'No asistió',  Icon: XCircle     },
    };

    const cfg = statusConfig[reserva.estado] || statusConfig.RESERVADA;

    // Barbero data (fallback placeholders)
    const barberoNombre = reserva.barbero?.nombre || '';
    const barberoFoto   = reserva.barbero?.foto   || null;
    const servicioNombre = reserva.servicio?.nombre || reserva.servcioNombre || 'Servicio';
    const hora = reserva.hora || reserva.timeSlot?.hora || '';
    const duracion = reserva.duracion || reserva.timeSlot?.duracion || 30;

    // Avatar initials fallback
    const initials = barberoNombre
        ? barberoNombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    return (
        <div
            className="relative group"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* ── PILL ─────────────────────────────────────── */}
            <button
                onClick={() => onClick(reserva)}
                className="w-full text-left rounded-xl overflow-hidden transition-all duration-200
                           hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none
                           focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900"
                style={{
                    background: `linear-gradient(135deg, ${cfg.from}22, ${cfg.to}15)`,
                    borderLeft: `3px solid ${cfg.from}`,
                    boxShadow: `0 2px 8px ${cfg.from}20`,
                }}
            >
                <div className="flex items-center gap-2 px-2 py-2">
                    {/* Barber avatar */}
                    <div
                        className="flex-shrink-0 w-8 h-8 rounded-full ring-2 overflow-hidden flex items-center justify-center text-white text-xs font-bold"
                        style={{ ringColor: cfg.from, background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})` }}
                    >
                        {barberoFoto ? (
                            <img
                                src={barberoFoto}
                                alt={barberoNombre}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                        ) : null}
                        <span
                            className="flex items-center justify-center w-full h-full"
                            style={{ display: barberoFoto ? 'none' : 'flex' }}
                        >
                            {initials}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                        {/* Client name */}
                        <div
                            className="text-xs font-bold truncate leading-tight"
                            style={{ color: cfg.from }}
                        >
                            {reserva.nombreCliente || 'Cliente'}
                        </div>
                        {/* Service + time */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Scissors size={9} className="text-neutral-400 flex-shrink-0" />
                            <span className="text-[10px] text-neutral-400 truncate">{servicioNombre}</span>
                        </div>
                        {hora && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Clock size={9} className="text-neutral-400 flex-shrink-0" />
                                <span className="text-[10px] text-neutral-500">{hora}</span>
                            </div>
                        )}
                    </div>

                    {/* Status dot */}
                    <div
                        className="flex-shrink-0 w-2 h-2 rounded-full mr-1"
                        style={{ background: cfg.from, boxShadow: `0 0 6px ${cfg.from}` }}
                    />
                </div>
            </button>

            {/* ── TOOLTIP ──────────────────────────────────── */}
            {showTooltip && (
                <div
                    className="absolute z-50 left-full ml-3 top-0 w-72 rounded-2xl overflow-hidden shadow-2xl pointer-events-none"
                    style={{ background: 'rgba(15, 15, 20, 0.97)', border: `1px solid ${cfg.from}40` }}
                >
                    {/* Header gradient bar */}
                    <div
                        className="px-4 py-3 flex items-center gap-3"
                        style={{ background: `linear-gradient(135deg, ${cfg.from}33, ${cfg.to}1a)` }}
                    >
                        {/* Barber avatar (large) */}
                        <div
                            className="flex-shrink-0 w-11 h-11 rounded-full ring-2 overflow-hidden flex items-center justify-center text-white text-sm font-bold"
                            style={{ border: `2px solid ${cfg.from}80`, background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})` }}
                        >
                            {barberoFoto ? (
                                <img src={barberoFoto} alt={barberoNombre} className="w-full h-full object-cover" />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-bold text-white text-sm truncate">
                                {reserva.nombreCliente || 'Cliente'}
                            </div>
                            {barberoNombre && (
                                <div className="text-xs text-neutral-400 truncate">
                                    con {barberoNombre}
                                </div>
                            )}
                        </div>
                        {/* Status badge */}
                        <span
                            className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ background: cfg.from }}
                        >
                            {cfg.label}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="px-4 py-3 space-y-2 text-sm">
                        <TooltipRow icon={<Clock size={13} className="text-neutral-400" />}>
                            <span className="text-white">{hora}</span>
                            <span className="text-neutral-500 ml-1">({duracion} min)</span>
                        </TooltipRow>

                        <TooltipRow icon={<Scissors size={13} className="text-neutral-400" />}>
                            <span className="text-neutral-300">{servicioNombre}</span>
                        </TooltipRow>

                        {reserva.emailCliente && (
                            <TooltipRow icon={<span className="text-neutral-400 text-[10px]">@</span>}>
                                <span className="text-neutral-400 text-xs">{reserva.emailCliente}</span>
                            </TooltipRow>
                        )}

                        {(reserva.precio > 0) && (
                            <div
                                className="mt-3 pt-2 border-t text-right font-bold text-base"
                                style={{ borderColor: `${cfg.from}30`, color: cfg.from }}
                            >
                                ${(reserva.precio || 0).toLocaleString('es-CL')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function TooltipRow({ icon, children }) {
    return (
        <div className="flex items-center gap-2">
            {icon}
            <span className="flex-1 flex items-center gap-1">{children}</span>
        </div>
    );
}

CeldaReserva.propTypes = {
    reserva: PropTypes.shape({
        _id: PropTypes.string,
        id: PropTypes.string,
        nombreCliente: PropTypes.string,
        emailCliente: PropTypes.string,
        estado: PropTypes.string.isRequired,
        hora: PropTypes.string,
        duracion: PropTypes.number,
        precio: PropTypes.number,
        timeSlot: PropTypes.shape({
            hora: PropTypes.string,
            duracion: PropTypes.number
        }),
        servicio: PropTypes.shape({ nombre: PropTypes.string }),
        barbero: PropTypes.shape({
            nombre: PropTypes.string,
            foto: PropTypes.string
        }),
    }).isRequired,
    onClick: PropTypes.func.isRequired
};
