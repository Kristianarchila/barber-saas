const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Helper para agregar encabezado común a los reportes
 */
const addHeader = (doc, barberia, titulo) => {
    // Logo o nombre de la barbería
    doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(barberia.nombre, 50, 50);

    // Información de contacto
    doc.fontSize(10).font("Helvetica");
    let y = 75;
    if (barberia.direccion) {
        doc.text(barberia.direccion, 50, y);
        y += 12;
    }
    if (barberia.telefono) {
        doc.text(`Tel: ${barberia.telefono}`, 50, y);
        y += 12;
    }
    if (barberia.configuracion?.emailNotificaciones) {
        doc.text(barberia.configuracion.emailNotificaciones, 50, y);
    }

    // Título del reporte
    doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(titulo, 50, 130);

    // Fecha de generación
    doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Generado: ${new Date().toLocaleString("es-ES")}`, 50, 155);

    // Línea divisoria
    doc
        .moveTo(50, 175)
        .lineTo(550, 175)
        .stroke();

    return 190; // Posición Y inicial para el contenido
};

/**
 * Helper para agregar pie de página
 */
const addFooter = (doc, pageNumber) => {
    doc
        .fontSize(8)
        .font("Helvetica")
        .text(
            `Página ${pageNumber} - ${new Date().toLocaleDateString("es-ES")}`,
            50,
            doc.page.height - 50,
            { align: "center", width: doc.page.width - 100 }
        );
};

/**
 * Generar reporte financiero
 */
const generateFinancialReport = async (barberia, data, startDate, endDate) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Encabezado
            let y = addHeader(
                doc,
                barberia,
                `Reporte Financiero\n${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            );

            // Resumen general
            doc.fontSize(14).font("Helvetica-Bold").text("Resumen General", 50, y);
            y += 25;

            const items = [
                ["Ingresos Totales", `$${data.totalIngresos.toLocaleString()}`],
                ["Gastos Totales", `$${data.totalGastos.toLocaleString()}`],
                ["Ganancia Neta", `$${data.gananciaNeta.toLocaleString()}`],
                ["Total Reservas", data.totalReservas],
                ["Total Ventas Productos", data.totalVentas],
            ];

            doc.fontSize(11).font("Helvetica");
            items.forEach(([label, value]) => {
                doc.text(label, 50, y);
                doc.text(value, 400, y, { align: "right", width: 150 });
                y += 20;
            });

            y += 20;

            // Desglose por servicios
            if (data.ingresospPorServicio && data.ingresosPorServicio.length > 0) {
                doc.fontSize(14).font("Helvetica-Bold").text("Ingresos por Servicio", 50, y);
                y += 25;

                // Tabla
                doc.fontSize(10).font("Helvetica-Bold");
                doc.text("Servicio", 50, y);
                doc.text("Cantidad", 300, y);
                doc.text("Ingresos", 450, y);
                y += 15;

                doc.moveTo(50, y).lineTo(550, y).stroke();
                y += 10;

                doc.font("Helvetica");
                data.ingresosPorServicio.forEach((item) => {
                    doc.text(item.servicio, 50, y);
                    doc.text(item.cantidad.toString(), 300, y);
                    doc.text(`$${item.ingresos.toLocaleString()}`, 450, y);
                    y += 15;

                    // Nueva página si es necesario
                    if (y > 700) {
                        doc.addPage();
                        y = 50;
                    }
                });
            }

            // Pie de página
            addFooter(doc, 1);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generar reporte de caja
 */
const generateCajaReport = async (barberia, movimientos, fecha) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            let y = addHeader(
                doc,
                barberia,
                `Cierre de Caja - ${fecha.toLocaleDateString("es-ES")}`
            );

            // Resumen
            const totalIngresos = movimientos
                .filter((m) => m.tipo === "ingreso")
                .reduce((sum, m) => sum + m.monto, 0);
            const totalEgresos = movimientos
                .filter((m) => m.tipo === "egreso")
                .reduce((sum, m) => sum + m.monto, 0);
            const saldo = totalIngresos - totalEgresos;

            doc.fontSize(12).font("Helvetica-Bold");
            doc.text("Total Ingresos:", 50, y);
            doc.text(`$${totalIngresos.toLocaleString()}`, 450, y);
            y += 20;
            doc.text("Total Egresos:", 50, y);
            doc.text(`$${totalEgresos.toLocaleString()}`, 450, y);
            y += 20;
            doc.text("Saldo:", 50, y);
            doc.text(`$${saldo.toLocaleString()}`, 450, y);
            y += 40;

            // Detalle de movimientos
            doc.fontSize(14).font("Helvetica-Bold").text("Detalle de Movimientos", 50, y);
            y += 25;

            // Encabezados de tabla
            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("Hora", 50, y);
            doc.text("Tipo", 120, y);
            doc.text("Concepto", 200, y);
            doc.text("Monto", 450, y);
            y += 15;

            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 10;

            // Movimientos
            doc.font("Helvetica");
            movimientos.forEach((mov) => {
                const hora = new Date(mov.createdAt).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                });

                doc.text(hora, 50, y);
                doc.text(mov.tipo, 120, y);
                doc.text(mov.concepto, 200, y, { width: 230 });
                doc.text(
                    `${mov.tipo === "egreso" ? "-" : ""}$${mov.monto.toLocaleString()}`,
                    450,
                    y
                );
                y += 20;

                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
            });

            addFooter(doc, 1);
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generar factura/recibo
 */
const generateInvoice = async (reserva, barberia) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on("data", buffers.push.bind(buffers));
            doc.on("end", () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            let y = addHeader(doc, barberia, "FACTURA / RECIBO");

            // Información de la reserva
            doc.fontSize(11).font("Helvetica").text(`N° Reserva: ${reserva._id}`, 50, y);
            y += 20;
            doc.text(
                `Fecha: ${new Date(reserva.fecha).toLocaleDateString("es-ES")}`,
                50,
                y
            );
            doc.text(`Hora: ${reserva.hora}`, 350, y);
            y += 30;

            // Información del cliente
            doc.fontSize(12).font("Helvetica-Bold").text("Cliente:", 50, y);
            y += 15;
            doc.fontSize(11).font("Helvetica");
            doc.text(reserva.nombreCliente, 50, y);
            y += 15;
            if (reserva.emailCliente) {
                doc.text(reserva.emailCliente, 50, y);
                y += 15;
            }
            if (reserva.telefonoCliente) {
                doc.text(reserva.telefonoCliente, 50, y);
                y += 30;
            } else {
                y += 15;
            }

            // Detalle del servicio
            doc.fontSize(12).font("Helvetica-Bold").text("Detalle:", 50, y);
            y += 20;

            // Tabla
            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("Servicio", 50, y);
            doc.text("Precio", 450, y);
            y += 15;

            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 10;

            doc.font("Helvetica");
            if (reserva.servicioId) {
                doc.text(reserva.servicioId.nombre, 50, y);
                doc.text(`$${reserva.servicioId.precio.toLocaleString()}`, 450, y);
                y += 20;
            }

            y += 20;
            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 10;

            // Total
            doc.fontSize(12).font("Helvetica-Bold");
            doc.text("TOTAL:", 350, y);
            doc.text(
                `$${reserva.servicioId?.precio.toLocaleString() || "0"}`,
                450,
                y
            );

            y += 50;
            doc
                .fontSize(10)
                .font("Helvetica")
                .text("¡Gracias por su preferencia!", 50, y, { align: "center" });

            addFooter(doc, 1);
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateFinancialReport,
    generateCajaReport,
    generateInvoice,
};
