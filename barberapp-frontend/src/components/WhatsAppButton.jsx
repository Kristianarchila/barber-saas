import { MessageCircle } from 'lucide-react';

/**
 * WhatsAppButton Component
 * Displays a WhatsApp button that opens a chat with the provided phone number
 * 
 * @param {string} phoneNumber - Phone number in format +56912345678
 * @param {string} message - Optional pre-filled message
 * @param {string} className - Additional CSS classes
 * @param {boolean} showIcon - Whether to show the WhatsApp icon
 * @param {string} label - Button label text
 */
export default function WhatsAppButton({
    phoneNumber,
    message = '',
    className = '',
    showIcon = true,
    label = 'WhatsApp'
}) {
    if (!phoneNumber) return null;

    // Clean phone number (remove spaces, dashes, parentheses)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Ensure phone starts with country code
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+56${cleanPhone}`;

    // Build WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone.replace('+', '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium ${className}`}
            title={`Contactar por WhatsApp: ${phoneNumber}`}
        >
            {showIcon && <MessageCircle size={16} />}
            {label}
        </a>
    );
}
