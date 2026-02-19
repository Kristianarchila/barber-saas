/**
 * Utilidades para manejo de horas y fechas
 */

/**
 * Convierte una cadena de hora "HH:mm" a minutos totales desde las 00:00
 * @param {string} horaStr 
 * @returns {number}
 */
const horaToMin = (horaStr) => {
    const [h, m] = horaStr.split(":").map(Number);
    return h * 60 + m;
};

/**
 * Convierte minutos totales a una cadena de hora "HH:mm"
 * @param {number} totalMin 
 * @returns {string}
 */
const minToHora = (totalMin) => {
    const hh = String(Math.floor(totalMin / 60) % 24).padStart(2, "0");
    const mm = String(totalMin % 60).padStart(2, "0");
    return `${hh}:${mm}`;
};

/**
 * Suma minutos a una hora en formato "HH:mm"
 * @param {string} horaStr 
 * @param {number} mins 
 * @returns {string}
 */
const sumarMinutos = (horaStr, mins) => {
    const total = horaToMin(horaStr) + mins;
    return minToHora(total);
};

module.exports = {
    horaToMin,
    minToHora,
    sumarMinutos
};
