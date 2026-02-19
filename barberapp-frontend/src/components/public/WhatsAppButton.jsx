import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ phoneNumber = '+56912345678' }) {
    const handleWhatsApp = () => {
        const message = encodeURIComponent('¡Hola! Me gustaría reservar una cita.');
        window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    return (
        <button
            onClick={handleWhatsApp}
            /* z-[998] para estar sobre el contenido pero no tapar el menú del sidebar si se abre */
            className="fixed bottom-28 right-6 z-[998] w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="WhatsApp"
        >
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />
            <MessageCircle size={30} className="text-white fill-current relative z-10" />
        </button>
    );
}