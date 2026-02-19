import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "../ui";
import { toast } from "react-hot-toast";

export default function AvatarUpload({ currentAvatar, onUpload, loading }) {
    const [preview, setPreview] = useState(currentAvatar);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona una imagen válida');
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 5MB');
            return;
        }

        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            setSelectedFile(file);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        await onUpload(selectedFile);
        setSelectedFile(null);
    };

    const handleCancel = () => {
        setPreview(currentAvatar);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* AVATAR PREVIEW */}
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 bg-gray-100">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Camera size={40} />
                        </div>
                    )}
                </div>

                {/* OVERLAY BUTTON */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Camera size={24} className="text-white" />
                </button>
            </div>

            {/* HIDDEN FILE INPUT */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* ACTIONS */}
            {selectedFile && (
                <div className="flex gap-2">
                    <Button
                        onClick={handleUpload}
                        loading={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                    >
                        <Upload size={16} className="mr-1" /> Subir Foto
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-gray-200 text-gray-700"
                        size="sm"
                    >
                        <X size={16} className="mr-1" /> Cancelar
                    </Button>
                </div>
            )}

            {!selectedFile && (
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-gray-200 text-gray-700"
                    size="sm"
                >
                    <Camera size={16} className="mr-1" /> Cambiar Foto
                </Button>
            )}

            <p className="text-xs text-gray-500 text-center">
                Formatos: JPG, PNG. Máximo 5MB
            </p>
        </div>
    );
}
