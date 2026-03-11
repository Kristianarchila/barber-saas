// === COMPONENTE: components/admin/reservas/NuevaReservaModal.jsx ===
import { X, Plus, Users, Clock, Calendar, Save, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { ensureArray } from '../../../utils/validateData';

const formatCurrency = (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(v || 0);

/**
 * NuevaReservaModal
 * Props: barberos, servicios, formReserva, setFormReserva,
 *        slotsDisponibles, loadingSlots, savingReserva,
 *        onSubmit, onClose
 */
export default function NuevaReservaModal({ barberos, servicios, formReserva, setFormReserva, slotsDisponibles, loadingSlots, savingReserva, onSubmit, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="card card-padding w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
                <button type="button" onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-900">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-xl"><Plus className="text-blue-600" size={22} /></div>
                    <div>
                        <h3 className="heading-3">Nueva Reserva</h3>
                        <p className="body text-gray-500">Agenda una cita para un cliente</p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                    {/* Barbero */}
                    <div className="space-y-2">
                        <label className="label flex items-center gap-2 required"><Users size={15} className="text-blue-600" /> Barbero *</label>
                        <select className="input" value={formReserva.barberoId} onChange={e => setFormReserva(prev => ({ ...prev, barberoId: e.target.value, hora: '' }))} required>
                            <option value="">Selecciona un barbero</option>
                            {ensureArray(barberos).map(b => <option key={b._id} value={b._id}>{b.nombre}</option>)}
                        </select>
                    </div>

                    {/* Servicio */}
                    <div className="space-y-2">
                        <label className="label flex items-center gap-2"><Clock size={15} className="text-blue-600" /> Servicio *</label>
                        <select className="input" value={formReserva.servicioId} onChange={e => setFormReserva(prev => ({ ...prev, servicioId: e.target.value, hora: '' }))} required>
                            <option value="">Selecciona un servicio</option>
                            {ensureArray(servicios).map(s => <option key={s._id} value={s._id}>{s.nombre} — {s.duracion} min — {formatCurrency(s.precio)}</option>)}
                        </select>
                    </div>

                    {/* Fecha */}
                    <div className="space-y-2">
                        <label className="label flex items-center gap-2"><Calendar size={15} className="text-blue-600" /> Fecha *</label>
                        <input type="date" className="input" value={formReserva.fecha} min={dayjs().format('YYYY-MM-DD')}
                            onChange={e => setFormReserva(prev => ({ ...prev, fecha: e.target.value, hora: '' }))} required />
                    </div>

                    {/* Hora */}
                    <div className="space-y-2">
                        <label className="label flex items-center gap-2"><Clock size={15} className="text-blue-600" /> Hora *</label>
                        {loadingSlots ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 className="animate-spin" size={18} />
                                <span className="body-small">Cargando horarios...</span>
                            </div>
                        ) : slotsDisponibles.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                {slotsDisponibles.map(slot => (
                                    <button key={slot} type="button" onClick={() => setFormReserva(prev => ({ ...prev, hora: slot }))}
                                        className={`py-2 px-1 rounded-lg text-sm font-bold transition-all ${formReserva.hora === slot ? 'bg-blue-600 text-white shadow' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="caption text-gray-400 italic">
                                {formReserva.barberoId && formReserva.servicioId ? 'Sin horarios disponibles para este día' : 'Selecciona barbero y servicio primero'}
                            </p>
                        )}
                    </div>

                    {/* Cliente */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="label">Nombre del cliente *</label>
                            <input type="text" className="input" placeholder="Ej: Juan Pérez" value={formReserva.nombreCliente}
                                onChange={e => setFormReserva(prev => ({ ...prev, nombreCliente: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                            <label className="label">Teléfono (opcional)</label>
                            <input type="tel" className="input" placeholder="+56 9 ..." value={formReserva.telefonoCliente}
                                onChange={e => setFormReserva(prev => ({ ...prev, telefonoCliente: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2 space-y-2">
                            <label className="label">Email (opcional)</label>
                            <input type="email" className="input" placeholder="cliente@correo.com" value={formReserva.emailCliente}
                                onChange={e => setFormReserva(prev => ({ ...prev, emailCliente: e.target.value }))} />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button type="button" className="btn btn-ghost flex-1" onClick={onClose} disabled={savingReserva}>Cancelar</button>
                        <button type="submit" className="btn btn-primary flex-[2]" disabled={savingReserva || !formReserva.hora}>
                            {savingReserva ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {savingReserva ? 'Guardando...' : 'Crear Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
