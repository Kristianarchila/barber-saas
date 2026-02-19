import { createPortal } from "react-dom";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "./index";

/**
 * Modal de confirmación personalizado
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {function} props.onConfirm - Función a ejecutar al confirmar
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje del modal
 * @param {string} props.confirmText - Texto del botón de confirmar (default: "Confirmar")
 * @param {string} props.cancelText - Texto del botón de cancelar (default: "Cancelar")
 * @param {string} props.variant - Variante del modal: "danger", "warning", "success", "info" (default: "info")
 */
export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "info"
}) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: AlertTriangle,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            confirmBg: "bg-red-600 hover:bg-red-700",
            titleColor: "text-red-900"
        },
        warning: {
            icon: AlertTriangle,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            confirmBg: "bg-amber-600 hover:bg-amber-700",
            titleColor: "text-amber-900"
        },
        success: {
            icon: CheckCircle,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            confirmBg: "bg-green-600 hover:bg-green-700",
            titleColor: "text-green-900"
        },
        info: {
            icon: Info,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            confirmBg: "bg-blue-600 hover:bg-blue-700",
            titleColor: "text-blue-900"
        }
    };

    const style = variantStyles[variant] || variantStyles.info;
    const Icon = style.icon;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 slide-in-from-bottom-4">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className={`w-16 h-16 ${style.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon size={32} className={style.iconColor} />
                </div>

                {/* Content */}
                <div className="text-center space-y-4 mb-8">
                    <h3 className={`text-2xl font-black ${style.titleColor}`}>
                        {title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg py-3 font-semibold"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className={`flex-1 ${style.confirmBg} text-white rounded-lg py-3 font-semibold`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
