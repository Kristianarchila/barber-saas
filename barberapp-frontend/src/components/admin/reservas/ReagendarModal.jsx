// === COMPONENTE: components/admin/reservas/ReagendarModal.jsx ===
import { X, CalendarClock, Save, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * ReagendarModal
 * Props: reserva (objeto reserva), reagendarForm, setReagendarForm,
 *        reagendarSlots, loadingReagendarSlots, savingReagendar,
 *        onSubmit, onClose
 */
export default function ReagendarModal({ reserva, reagendarForm, setReagendarForm, reagendarSlots, loadingReagendarSlots, savingReagendar, onSubmit, onClose }) {
    if (!reserva) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="card card-padding w-full max-w-lg relative shadow-2xl animate-slide-in">
                <button type="button" onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-800">
                    <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-xl"><CalendarClock className="text-blue-600" size={22} /></div>
                    <div>
                        <h3 className="heading-3">Reagendar Cita</h3>
                        <p className="body-small text-gray-500">{reserva.clienteNombre} · {reserva.servicioId?.nombre || 'Servicio'}</p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="label">Nueva fecha</label>
                        <input type="date" min={dayjs().format('YYYY-MM-DD')} value={reagendarForm.fecha}
                            onChange={e => setReagendarForm(prev => ({ ...prev, fecha: e.target.value }))} className="input" />
                    </div>

                    <div className="space-y-2">
                        <label className="label">
                            Hora disponible
                            {loadingReagendarSlots && <Loader2 size={14} className="animate-spin inline ml-2 text-gray-400" />}
                        </label>
                        {!reagendarForm.fecha ? (
                            <p className="caption text-gray-400 italic">Elige una fecha para ver los horarios</p>
                        ) : loadingReagendarSlots ? (
                            <p className="caption text-gray-400">Buscando horarios...</p>
                        ) : reagendarSlots.length === 0 ? (
                            <p className="caption text-amber-600 font-semibold">Sin horarios disponibles para esa fecha</p>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {reagendarSlots.map(slot => (
                                    <button key={slot} type="button" onClick={() => setReagendarForm(prev => ({ ...prev, hora: slot }))}
                                        className={`py-2 rounded-xl text-sm font-bold border transition-all ${reagendarForm.hora === slot ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`}>
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancelar</button>
                        <button type="submit" disabled={savingReagendar || !reagendarForm.fecha || !reagendarForm.hora} className="btn btn-primary flex-1">
                            {savingReagendar ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {savingReagendar ? 'Guardando...' : 'Confirmar Reagendado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
