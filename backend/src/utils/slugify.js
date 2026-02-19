// backend/src/utils/slugify.js
module.exports = function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^a-z0-9]+/g, "-")     // espacios y símbolos -> -
    .replace(/^-+|-+$/g, "");        // trim de guiones
};
