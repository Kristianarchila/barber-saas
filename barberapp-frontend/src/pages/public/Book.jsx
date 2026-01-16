import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import gsap from "gsap";
// Asegúrate de que estas rutas sean correctas en tu proyecto
import { getDisponibilidad } from "../../services/turnosService";
import { crearReserva  } from "../../services/reservasService";
import { getServiciosPublicos, getBarberosPublicos } from "../../services/publicService";

export default function Reservar() {
  // --- 1. ESTADOS ---
  const [fechaSeleccionada, setFechaSeleccionada] = useState(dayjs().format("YYYY-MM-DD"));
  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // --- 2. REFS PARA ANIMACIONES GSAP ---
  const headerRef = useRef(null);
  const footerRef = useRef(null);

  // --- 3. EFECTOS DE CARGA (API) ---
  useEffect(() => {
    async function fetchData() {
      try {
        const [s, b] = await Promise.all([getServiciosPublicos(), getBarberosPublicos()]);
        setServicios(s || []);
        setBarberos(b || []);
      } catch (err) {
        console.error("Error de conexión con el servidor:", err);
        setErrorMsg("No se pudo conectar con el servidor (ERR_CONNECTION_REFUSED).");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchDisponibilidad() {
      if (!selectedServicio || !selectedBarbero || !fechaSeleccionada) return;
      try {
        setCargando(true);
        setErrorMsg(null);
        const data = await getDisponibilidad(selectedBarbero._id, fechaSeleccionada, selectedServicio._id);
        setDisponibilidad(data.turnosDisponibles || []);
      } catch (err) {
        setDisponibilidad([]);
        setErrorMsg("Error al obtener disponibilidad.");
      } finally {
        setCargando(false);
      }
    }
    fetchDisponibilidad();
  }, [selectedServicio, selectedBarbero, fechaSeleccionada]);

  // --- 4. ANIMACIONES GSAP ---
  useEffect(() => {
    if (servicios.length > 0) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(headerRef.current, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1.2 })
        .fromTo(".step-anim", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.8 }, "-=0.6");
    }
  }, [servicios]);

  useEffect(() => {
    if (horaSeleccionada && footerRef.current) {
      gsap.fromTo(footerRef.current, { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)" });
    }
  }, [horaSeleccionada]);

  // --- 5. LÓGICA DE CALENDARIO Y RESERVA ---
  const dias = Array.from({ length: 10 }).map((_, i) => {
    const d = dayjs().add(i, "day");
    return { fecha: d.format("YYYY-MM-DD"), dia: d.format("ddd"), num: d.format("DD") };
  });

  const handleConfirmarReserva = async () => {
    if (!emailCliente || !nombreCliente) return setErrorMsg("Completa tus datos de contacto.");
    try {
      setEnviando(true);
      await crearReserva(selectedBarbero._id, {
        fecha: fechaSeleccionada,
        hora: horaSeleccionada,
        nombreCliente,
        emailCliente,
        servicioId: selectedServicio._id,
      });
      setMensaje("¡Reserva confirmada!");
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Error al procesar la reserva.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black pb-48 font-sans antialiased">
      {/* HEADER */}
      <header ref={headerRef} className="bg-black py-16 px-6 border-b-4 border-[#D4AF37] shadow-2xl relative overflow-hidden text-center">
        <h1 className="text-5xl font-serif font-light text-white tracking-[0.2em] uppercase">
          Kristian <span className="font-bold text-[#D4AF37]">Studio</span>
        </h1>
        <p className="text-[10px] tracking-[0.5em] text-gray-400 mt-4 uppercase">Luxury Grooming Experience</p>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-12">
        {/* PASO 1: SERVICIO - DISEÑO PREMIUM CON TAILWIND */}
<section className="step-anim mb-12">
  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mb-8">
    01. Selección de Servicio
  </h2>
  
  {/* Grid optimizado */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[550px] overflow-y-auto pr-2 pb-2 scrollbar-thin scrollbar-thumb-[#D4AF37] scrollbar-track-transparent">
    {servicios.map((s, index) => (
      <div
        key={s._id}
        onClick={() => { setSelectedServicio(s); setHoraSeleccionada(""); }}
        className={`group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
          selectedServicio?._id === s._id 
            ? "shadow-2xl scale-[1.02] ring-2 ring-[#D4AF37]" 
            : "shadow-md hover:shadow-xl hover:scale-[1.01]"
        }`}
      >
        {/* Barra superior decorativa */}
        <div className={`h-1 w-full transition-all duration-300 ${
          selectedServicio?._id === s._id 
            ? "bg-gradient-to-r from-[#D4AF37] to-[#f4d03f]" 
            : "bg-gray-100 group-hover:bg-gray-200"
        }`} />
        
        {/* Contenido principal */}
        <div className="p-6">
          {/* Header: Nombre y badge de duración */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-base text-black mb-2 leading-tight">
                {s.nombre}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  selectedServicio?._id === s._id
                    ? "bg-[#D4AF37] text-white"
                    : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                }`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {s.duracion} min
                </span>
              </div>
            </div>
            
            {/* Checkmark animado */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              selectedServicio?._id === s._id
                ? "bg-black scale-100"
                : "bg-transparent border-2 border-gray-200 scale-90 group-hover:border-gray-300"
            }`}>
              {selectedServicio?._id === s._id && (
                <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Descripción (si existe) */}
          {s.descripcion && (
            <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">
              {s.descripcion}
            </p>
          )}
          
          {/* Separador sutil */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />
          
          {/* Footer: Precio y acción */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">
                Precio
              </p>
              <p className="font-serif text-2xl font-bold text-black">
                ${s.precio.toLocaleString()}
              </p>
            </div>
            
            <div className={`px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
              selectedServicio?._id === s._id
                ? "bg-black text-white"
                : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
            }`}>
              {selectedServicio?._id === s._id ? "✓ Seleccionado" : "Seleccionar"}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

        {/* PASO 2: BARBERO (MODIFICADO CON IMAGEN) */}
        <section className="step-anim mb-12">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8">02. Profesional</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
            {barberos.map((b) => (
              <button key={b._id} onClick={() => { setSelectedBarbero(b); setHoraSeleccionada(""); }} className="flex-shrink-0 text-center group">
                {/* Contenedor circular de la imagen */}
                <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-500 overflow-hidden shadow-sm ${
                  selectedBarbero?._id === b._id ? "border-[#D4AF37] bg-black" : "border-gray-100 bg-white group-hover:border-black"
                }`}>
                  {b.foto ? (
                    <img 
                      src={b.foto} 
                      alt={b.nombre} 
                      className={`w-full h-full object-cover transition-transform duration-700 ${selectedBarbero?._id === b._id ? "scale-110" : "scale-100"}`}
                    />
                  ) : (
                    <span className={`text-xs font-bold uppercase ${selectedBarbero?._id === b._id ? "text-white" : "text-black"}`}>
                      {b.nombre.substring(0, 2)}
                    </span>
                  )}
                </div>
                {/* Nombre del barbero */}
                <p className={`text-[10px] font-bold mt-4 uppercase tracking-widest transition-colors ${selectedBarbero?._id === b._id ? "text-black" : "text-gray-300"}`}>
                  {b.nombre}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* PASO 3: FECHA */}
        <section className="step-anim mb-12">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8">03. Fecha</h2>
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {dias.map((d) => (
              <button
                key={d.fecha}
                onClick={() => setFechaSeleccionada(d.fecha)}
                className={`flex flex-col items-center justify-center min-w-[70px] py-5 border transition-all ${
                  fechaSeleccionada === d.fecha ? "bg-[#D4AF37] border-[#D4AF37] text-white shadow-lg" : "bg-white border-gray-100 text-gray-400 hover:border-black"
                }`}
              >
                <span className="text-[9px] uppercase font-black mb-1">{d.dia}</span>
                <span className="text-xl font-serif font-bold">{d.num}</span>
              </button>
            ))}
          </div>
        </section>

        {/* PASO 4: HORARIOS */}
        <section className="step-anim mb-12">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8">04. Horario</h2>
          {cargando ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {disponibilidad.map((hora) => (
                <button
                  key={hora}
                  onClick={() => setHoraSeleccionada(hora)}
                  className={`py-4 text-[11px] font-bold border transition-all ${
                    horaSeleccionada === hora ? "bg-black text-white border-black" : "bg-white text-black border-gray-100 hover:border-black"
                  }`}
                >
                  {hora}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER FLOTANTE */}
      {horaSeleccionada && (
        <div ref={footerRef} className="fixed bottom-0 left-0 w-full bg-white border-t-4 border-black p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-50">
          <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest">Resumen de Cita</p>
              <h4 className="font-serif text-2xl uppercase tracking-tighter">{selectedServicio?.nombre}</h4>
              <p className="text-[11px] text-gray-400 uppercase font-medium">{dayjs(fechaSeleccionada).format('DD MMMM')} — {horaSeleccionada} HS</p>
            </div>
            <div className="w-full md:w-auto flex flex-col gap-3">
              <div className="flex gap-2">
                <input className="flex-1 border-b border-gray-200 py-2 outline-none focus:border-[#D4AF37] transition-colors text-xs uppercase" placeholder="NOMBRE" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} />
                <input className="flex-1 border-b border-gray-200 py-2 outline-none focus:border-[#D4AF37] transition-colors text-xs uppercase" placeholder="EMAIL" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} />
              </div>
              <button onClick={handleConfirmarReserva} disabled={enviando} className="bg-black text-white py-4 px-10 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-[#D4AF37] transition-all active:scale-95 disabled:opacity-50">
                {enviando ? "PROCESANDO..." : "RESERVAR AHORA"}
              </button>
            </div>
          </div>
          {mensaje && <p className="text-center text-green-600 text-[10px] font-bold mt-4 uppercase">{mensaje}</p>}
          {errorMsg && <p className="text-center text-red-600 text-[10px] font-bold mt-4 uppercase">{errorMsg}</p>}
        </div>
      )}
    </div>
  );
}