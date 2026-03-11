// === HOOK: hooks/useReservas.js ===
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { getBarberos } from '../services/barberosService';
import { getReservasPorBarberoDia, completarReserva, cancelarReserva, reagendarReserva } from '../services/reservasService';
import { getServicios } from '../services/serviciosService';
import { useApiCall } from './useApiCall';
import { useAsyncAction } from './useAsyncAction';
import { ensureArray } from '../utils/validateData';
import { toast } from 'react-hot-toast';

dayjs.locale('es');

export function useReservas() {
    const [barberos, setBarberos]             = useState([]);
    const [selectedBarbero, setSelectedBarbero] = useState(null);
    const [fecha, setFecha]                   = useState(dayjs().format('YYYY-MM-DD'));
    const [turnos, setTurnos]                 = useState([]);
    const [resumen, setResumen]               = useState({});
    const [servicios, setServicios]           = useState([]);

    // Modal Nueva Reserva
    const [showModal, setShowModal]           = useState(false);
    const [slotsDisponibles, setSlotsDisponibles] = useState([]);
    const [loadingSlots, setLoadingSlots]     = useState(false);
    const [savingReserva, setSavingReserva]   = useState(false);
    const [formReserva, setFormReserva]       = useState({
        barberoId: '', servicioId: '', fecha: dayjs().format('YYYY-MM-DD'),
        hora: '', nombreCliente: '', telefonoCliente: '', emailCliente: ''
    });

    // Modal Reagendar
    const [reagendarModal, setReagendarModal] = useState(null);
    const [reagendarForm, setReagendarForm]   = useState({ fecha: '', hora: '' });
    const [reagendarSlots, setReagendarSlots] = useState([]);
    const [loadingReagendarSlots, setLoadingReagendarSlots] = useState(false);
    const [savingReagendar, setSavingReagendar] = useState(false);

    // Cache util
    const getSlug = () => window.location.pathname.split('/')[1];

    // --- API Hooks ---
    const { execute: loadBarberos, error: barberosError } = useApiCall(getBarberos, {
        errorMessage: 'Error al cargar barberos',
        onSuccess: (data) => setBarberos(ensureArray(data))
    });

    const calcResumen = (reservas) => {
        const minutos = reservas.filter(r => r.estado === 'COMPLETADA').reduce((s, r) => s + (r.servicioId?.duracion || 0), 0);
        const h = Math.floor(minutos / 60), m = minutos % 60;
        return {
            totalTurnos: reservas.length,
            completados: reservas.filter(r => r.estado === 'COMPLETADA').length,
            cancelados:  reservas.filter(r => r.estado === 'CANCELADA').length,
            ingresosGenerados: reservas.filter(r => r.estado === 'COMPLETADA').reduce((s, r) => s + (r.precioTotal || 0), 0),
            horasTrabajadas: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        };
    };

    const { execute: fetchTurnos, loading, error: turnosError } = useApiCall(
        async () => {
            if (!selectedBarbero?._id) return [];
            return await getReservasPorBarberoDia(selectedBarbero._id, fecha);
        },
        {
            errorMessage: 'Error al cargar reservas',
            onSuccess: (reservas) => {
                const safe = ensureArray(reservas);
                setResumen(calcResumen(safe));
                setTurnos(safe);
            },
            onError: () => { setResumen({}); setTurnos([]); }
        }
    );

    const { execute: handleCompletar, loading: completando } = useAsyncAction(completarReserva, {
        successMessage: 'Reserva completada exitosamente',
        errorMessage: 'Error al completar reserva',
        confirmMessage: '¿Marcar esta reserva como completada?',
        onSuccess: () => fetchTurnos()
    });

    const { execute: handleCancelar, loading: cancelando } = useAsyncAction(cancelarReserva, {
        successMessage: 'Reserva cancelada',
        errorMessage: 'Error al cancelar reserva',
        confirmMessage: '¿Cancelar esta reserva?',
        onSuccess: () => fetchTurnos()
    });

    // Efectos
    useEffect(() => {
        loadBarberos();
        getServicios().then(setServicios).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedBarbero) fetchTurnos();
    }, [selectedBarbero, fecha]);

    // Slots disponibles para reagendar
    useEffect(() => {
        if (!reagendarModal || !reagendarForm.fecha) { setReagendarSlots([]); return; }
        const duracion  = reagendarModal.servicioId?.duracion || 30;
        const barberoId = reagendarModal.barberoId?._id || reagendarModal.barberoId || selectedBarbero?._id;
        if (!barberoId) return;
        setLoadingReagendarSlots(true);
        setReagendarSlots([]);
        setReagendarForm(prev => ({ ...prev, hora: '' }));
        import('../services/api').then(({ default: api }) => {
            api.get(`/barberias/${getSlug()}/admin/reservas/horarios-disponibles`, {
                params: { barberoId, fecha: reagendarForm.fecha, duracion }
            }).then(res => setReagendarSlots(ensureArray(res.data?.horariosDisponibles || res.data || [])))
              .catch(() => setReagendarSlots([]))
              .finally(() => setLoadingReagendarSlots(false));
        });
    }, [reagendarModal, reagendarForm.fecha]);

    // Slots disponibles para nueva reserva
    useEffect(() => {
        const { barberoId, servicioId, fecha: fechaModal } = formReserva;
        if (!barberoId || !servicioId || !fechaModal) { setSlotsDisponibles([]); return; }
        const servicio = servicios.find(s => s._id === servicioId);
        if (!servicio) return;
        setLoadingSlots(true);
        setSlotsDisponibles([]);
        setFormReserva(prev => ({ ...prev, hora: '' }));
        import('../services/api').then(({ default: api }) => {
            api.get(`/barberias/${getSlug()}/admin/reservas/horarios-disponibles`, {
                params: { barberoId, fecha: fechaModal, duracion: servicio.duracion }
            }).then(res => setSlotsDisponibles(ensureArray(res.data?.horariosDisponibles || res.data || [])))
              .catch(() => setSlotsDisponibles([]))
              .finally(() => setLoadingSlots(false));
        });
    }, [formReserva.barberoId, formReserva.servicioId, formReserva.fecha]);

    // Handlers
    const handleReagendar = async (e) => {
        e.preventDefault();
        if (!reagendarForm.fecha || !reagendarForm.hora) { toast.error('Elige una fecha y una hora'); return; }
        setSavingReagendar(true);
        try {
            await reagendarReserva(reagendarModal._id, { fecha: reagendarForm.fecha, hora: reagendarForm.hora });
            toast.success('Reserva reagendada exitosamente');
            setReagendarModal(null);
            setReagendarForm({ fecha: '', hora: '' });
            fetchTurnos();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error al reagendar');
        } finally { setSavingReagendar(false); }
    };

    const handleCrearReserva = async (e) => {
        e.preventDefault();
        if (!formReserva.barberoId || !formReserva.servicioId || !formReserva.fecha || !formReserva.hora || !formReserva.nombreCliente) {
            toast.error('Completa todos los campos obligatorios'); return;
        }
        setSavingReserva(true);
        try {
            const { default: crearReserva } = await import('../services/reservasService').then(m => ({ default: m.crearReserva }));
            await crearReserva(formReserva.barberoId, {
                servicioId: formReserva.servicioId, fecha: formReserva.fecha,
                hora: formReserva.hora, nombreCliente: formReserva.nombreCliente,
                emailCliente: formReserva.emailCliente, telefonoCliente: formReserva.telefonoCliente
            });
            toast.success('Reserva creada exitosamente');
            setShowModal(false);
            setFormReserva({ barberoId: '', servicioId: '', fecha: dayjs().format('YYYY-MM-DD'), hora: '', nombreCliente: '', telefonoCliente: '', emailCliente: '' });
            if (formReserva.barberoId === selectedBarbero?._id) fetchTurnos();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error al crear la reserva');
        } finally { setSavingReagendar(false); setSavingReserva(false); }
    };

    return {
        barberos, selectedBarbero, setSelectedBarbero, fecha, setFecha,
        turnos, resumen, loading, barberosError, turnosError,
        completando, cancelando, handleCompletar, handleCancelar,
        servicios, showModal, setShowModal,
        slotsDisponibles, loadingSlots, savingReserva, formReserva, setFormReserva,
        handleCrearReserva,
        reagendarModal, setReagendarModal, reagendarForm, setReagendarForm,
        reagendarSlots, loadingReagendarSlots, savingReagendar, handleReagendar
    };
}
