import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "../ui";

export default function ExportButton({ onExportCSV, onExportPDF, label = "Exportar" }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="outline"
                className="border-gray-200 px-6 py-3 rounded-lg"
            >
                <Download size={20} className="mr-2" /> {label}
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                        <button
                            onClick={() => {
                                onExportCSV();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                        >
                            <FileSpreadsheet size={18} className="text-green-600" />
                            <div>
                                <p className="font-semibold text-sm">Exportar CSV</p>
                                <p className="text-xs text-gray-500">Para Excel/Sheets</p>
                            </div>
                        </button>

                        <div className="border-t border-gray-100" />

                        <button
                            onClick={() => {
                                onExportPDF();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                        >
                            <FileText size={18} className="text-red-600" />
                            <div>
                                <p className="font-semibold text-sm">Exportar PDF</p>
                                <p className="text-xs text-gray-500">Documento imprimible</p>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
