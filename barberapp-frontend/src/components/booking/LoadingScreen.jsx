// === ARCHIVO: components/booking/LoadingScreen.jsx ===
const LoadingScreen = () => (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mb-6" />
        <p className="font-black uppercase tracking-[0.6em] text-[10px] animate-pulse">Cargando Experiencia</p>
    </div>
);

export default LoadingScreen;
