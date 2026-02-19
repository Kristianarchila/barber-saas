import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';

/**
 * Exporta datos a CSV
 * @param {Array} data - Datos a exportar
 * @param {string} filename - Nombre del archivo
 */
export function exportToCSV(data, filename) {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exporta citas a PDF
 * @param {Array} citas - Array de citas
 * @param {string} filename - Nombre del archivo
 */
export function exportCitasToPDF(citas, filename) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Historial de Citas', 14, 22);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 30);

    // Preparar datos para la tabla
    const tableData = citas.map(c => [
        dayjs(c.fecha).format('DD/MM/YYYY'),
        c.hora,
        c.nombreCliente || 'N/A',
        c.servicioId?.nombre || 'N/A',
        c.estado,
        `$${c.servicioId?.precio || 0}`
    ]);

    // Tabla
    doc.autoTable({
        startY: 35,
        head: [['Fecha', 'Hora', 'Cliente', 'Servicio', 'Estado', 'Monto']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // blue-600
        styles: { fontSize: 9 }
    });

    doc.save(`${filename}.pdf`);
}

/**
 * Exporta transacciones a PDF
 * @param {Array} transacciones - Array de transacciones
 * @param {string} filename - Nombre del archivo
 */
export function exportTransaccionesToPDF(transacciones, filename) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Historial de Transacciones', 14, 22);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 30);

    // Preparar datos para la tabla
    const tableData = transacciones.map(t => [
        dayjs(t.fecha || t.createdAt).format('DD/MM/YYYY'),
        t.reservaId?.servicioId?.nombre || t.descripcion || 'N/A',
        t.reservaId?.nombreCliente || 'N/A',
        `$${t.montoBruto || 0}`,
        `$${t.montoBarbero || t.montosFinales?.montoBarbero || 0}`,
        t.pagado ? 'Pagado' : 'Pendiente'
    ]);

    // Tabla
    doc.autoTable({
        startY: 35,
        head: [['Fecha', 'Servicio', 'Cliente', 'Monto Bruto', 'Mi Ganancia', 'Estado']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // blue-600
        styles: { fontSize: 8 }
    });

    doc.save(`${filename}.pdf`);
}

/**
 * Exporta citas a CSV
 * @param {Array} citas - Array de citas
 * @param {string} filename - Nombre del archivo
 */
export function exportCitasToCSV(citas, filename) {
    const data = citas.map(c => ({
        Fecha: dayjs(c.fecha).format('DD/MM/YYYY'),
        Hora: c.hora,
        Cliente: c.nombreCliente || 'N/A',
        Servicio: c.servicioId?.nombre || 'N/A',
        Estado: c.estado,
        Monto: c.servicioId?.precio || 0
    }));

    exportToCSV(data, filename);
}

/**
 * Exporta transacciones a CSV
 * @param {Array} transacciones - Array de transacciones
 * @param {string} filename - Nombre del archivo
 */
export function exportTransaccionesToCSV(transacciones, filename) {
    const data = transacciones.map(t => ({
        Fecha: dayjs(t.fecha || t.createdAt).format('DD/MM/YYYY'),
        Servicio: t.reservaId?.servicioId?.nombre || t.descripcion || 'N/A',
        Cliente: t.reservaId?.nombreCliente || 'N/A',
        'Monto Bruto': t.montoBruto || 0,
        'Mi Ganancia': t.montoBarbero || t.montosFinales?.montoBarbero || 0,
        Estado: t.pagado ? 'Pagado' : 'Pendiente'
    }));

    exportToCSV(data, filename);
}
