// === ARCHIVO: pages/admin/Reservas.jsx ===
// Refactored: 770 lines → ~60 lines
// Lógica en useReservas.js, UI en components/admin/reservas/
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { Calendar, Users, Clock, CheckCircle, XCircle, Plus, CalendarClock } from 'lucide-react';
import { Skeleton } from '../../components/ui';
import { ErrorAlert } from '../../components/ErrorComponents';
import { ensureArray } from '../../utils/validateData';
import WhatsAppButton from '../../components/WhatsAppButton';
import { useReservas } from '../../hooks/useReservas';
import NuevaReservaModal from '../../components/admin/reservas/NuevaReservaModal';
import ReagendarModal    from '../../components/admin/reservas/ReagendarModal';

dayjs.locale('es');

const formatCurrency = (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(v || 0);

const getEstadoBadge = (estado) => {
    const m = {
        RESERVADA: 'badge-primary', CONFIRMADA: 'badge-success', COMPLETADA: 'badge-success',
        CANCELADA: 'badge-error', DISPONIBLE: 'badge-neutral', NO_ASISTIO: 'badge-warning'
    };
    const l = { RESERVADA: 'Reservada', CONFIRMADA: 'Confirmada', COMPLETADA: 'Completada', CANCELADA: 'Cancelada', DISPONIBLE: 'Disponible', NO_ASISTIO: 'No asistió' };
    return { cls: m[estado] || 'badge-neutral', label: l[estado] || estado };
};

export default function ReservasAdmin() {
    const {
        barberos, selectedBarbero, setSelectedBarbero, fecha, setFecha,
        turnos, resumen, loading, barberosError, turnosError,
        completando, cancelando, handleCompletar, handleCancelar,
        servicios, showModal, setShowModal,
        slotsDisponibles, loadingSlots, savingReserva, formReserva, setFormReserva, handleCrearReserva,
        reagendarModal, setReagendarModal, reagendarForm, setReagendarForm,
        reagendarSlots, loadingReagendarSlots, savingReagendar, handleReagendar
    } = useReservas();

    return (
        <div className="space-y-8 animate-slide-in">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="heading-1 flex items-center gap-3"><Calendar className="text-blue-600" size={32} /> Agenda del Día</h1>
                    <p className="body-large text-gray-600 mt-2">Control operativo de citas y disponibilidad de tus barberos</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary self-start md:self-center">
                    <Plus size={18} /> Nueva Reserva
                </button>
            </header>

            {barberosError && <ErrorAlert error={barberosError} />}
            {turnosError   && <ErrorAlert error={turnosError} />}

            {/* CONTROLES */}
            <div className="card card-padding shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="label flex items-center gap-2"><Users size={16} className="text-blue-600" /> Barbero en Sesión</label>
                        <select className="input" value={selectedBarbero?._id || ''} onChange={e => setSelectedBarbero(barberos.find(b => b._id === e.target.value) || null)}>
                            <option value="">Seleccione un profesional</option>
                            {ensureArray(barberos).map(b => <option key={b._id} value={b._id}>{b.nombre}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="label flex items-center gap-2"><Calendar size={16} className="text-blue-600" /> Fecha de Trabajo</label>
                        <input type="date" className="input" value={fecha} onChange={e => setFecha(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* RESUMEN DEL DÍA */}
            {selectedBarbero && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 overflow-hidden">
                            {selectedBarbero.foto ? <img src={selectedBarbero.foto} alt={selectedBarbero.nombre} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-blue-600">{selectedBarbero.nombre.charAt(0)}</span>}
                        </div>
                        <div>
                            <h2 className="heading-3">{selectedBarbero.nombre}</h2>
                            <p className="body-small text-gray-500">Agenda para el {dayjs(fecha).format('dddd, D [de] MMMM')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Reservas',            value: resumen.totalTurnos || 0,    cls: 'text-gray-900',  card: 'card card-padding shadow-sm' },
                            { label: 'Completadas',         value: resumen.completados || 0,    cls: 'text-green-600', card: 'card card-padding shadow-sm' },
                            { label: 'Ingresos Estimados',  value: formatCurrency(resumen.ingresosGenerados), cls: 'text-white text-2xl', card: 'card card-padding bg-gray-900 text-white shadow-lg', labelCls: 'text-gray-500' },
                            { label: 'Productividad',       value: `${resumen.totalTurnos > 0 ? Math.round((resumen.completados / resumen.totalTurnos) * 100) : 0}%`, cls: 'text-gray-900', card: 'card card-padding shadow-sm' },
                        ].map(({ label, value, cls, card, labelCls }) => (
                            <div key={label} className={card}>
                                <p className={`caption font-bold uppercase tracking-widest mb-2 ${labelCls || 'text-gray-400'}`}>{label}</p>
                                <p className={`text-3xl font-black ${cls}`}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TABLA DE TURNOS */}
            {selectedBarbero && (
                <div className="card overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/30">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-blue-600"><Clock size={24} /></div>
                        <div>
                            <h3 className="heading-4">Cronograma de Turnos</h3>
                            <p className="body-small text-gray-500">{turnos.length} servicios para hoy</p>
                        </div>
                    </div>
                    {loading ? (
                        <div className="p-12 space-y-4">{[1,2,3].map(i => <Skeleton key={i} variant="rectangular" height="h-20" />)}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr><th>Hora de Cita</th><th>Cliente</th><th>Servicio Solicitado</th><th>Estado</th><th className="text-right">Gestión</th></tr>
                                </thead>
                                <tbody>
                                    {ensureArray(turnos).map((t, idx) => {
                                        const { cls, label } = getEstadoBadge(t.estado);
                                        return (
                                            <tr key={t._id || idx} className="group hover:bg-gray-50/50 transition-all">
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Clock size={18} /></div>
                                                        <span className="body font-bold text-gray-900">{t.hora}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {t.clienteNombre ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-100">{t.clienteNombre.charAt(0)}</div>
                                                            <div>
                                                                <p className="body-small font-bold text-gray-900">{t.clienteNombre}</p>
                                                                {t.telefonoCliente && <WhatsAppButton phoneNumber={t.telefonoCliente} message={`Hola ${t.clienteNombre}, te contacto sobre tu reserva del ${dayjs(t.fecha).format('DD/MM/YYYY')} a las ${t.hora}`} className="mt-1" label={t.telefonoCliente} />}
                                                            </div>
                                                        </div>
                                                    ) : <span className="caption text-gray-400 italic">Sin asignar</span>}
                                                </td>
                                                <td>
                                                    <p className="body-small font-bold text-gray-900">{t.servicioId?.nombre || '—'}</p>
                                                    <p className="caption text-gray-400 uppercase tracking-widest">{t.servicioId?.duracion} min</p>
                                                </td>
                                                <td><span className={`badge ${cls}`}>{label}</span></td>
                                                <td className="text-right">
                                                    {(t.estado === 'RESERVADA' || t.estado === 'CONFIRMADA') && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleCompletar(t._id)} className="btn btn-ghost btn-sm text-green-600 hover:bg-green-50" title="Completar" disabled={completando || cancelando}>
                                                                {completando ? '...' : <CheckCircle size={18} />}
                                                            </button>
                                                            <button onClick={() => { setReagendarModal(t); setReagendarForm({ fecha: dayjs().format('YYYY-MM-DD'), hora: '' }); }} className="btn btn-ghost btn-sm text-blue-600 hover:bg-blue-50" title="Reagendar" disabled={completando || cancelando}>
                                                                <CalendarClock size={18} />
                                                            </button>
                                                            <button onClick={() => handleCancelar(t._id)} className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50" title="Cancelar" disabled={completando || cancelando}>
                                                                {cancelando ? '...' : <XCircle size={18} />}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ESTADO VACÍO */}
            {!selectedBarbero && (
                <div className="card card-padding py-24 text-center shadow-sm">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600"><Users size={40} /></div>
                    <h3 className="heading-2 mb-2">Selecciona un profesional</h3>
                    <p className="body-large text-gray-500 max-w-md mx-auto">Elige un barbero del menú superior para visualizar y gestionar su hoja de servicios diaria.</p>
                </div>
            )}

            {/* MODALES */}
            {showModal && (
                <NuevaReservaModal
                    barberos={barberos} servicios={servicios} formReserva={formReserva}
                    setFormReserva={setFormReserva} slotsDisponibles={slotsDisponibles}
                    loadingSlots={loadingSlots} savingReserva={savingReserva}
                    onSubmit={handleCrearReserva} onClose={() => setShowModal(false)}
                />
            )}
            {reagendarModal && (
                <ReagendarModal
                    reserva={reagendarModal} reagendarForm={reagendarForm}
                    setReagendarForm={setReagendarForm} reagendarSlots={reagendarSlots}
                    loadingReagendarSlots={loadingReagendarSlots} savingReagendar={savingReagendar}
                    onSubmit={handleReagendar} onClose={() => { setReagendarModal(null); setReagendarForm({ fecha: '', hora: '' }); }}
                />
            )}
        </div>
    );
}