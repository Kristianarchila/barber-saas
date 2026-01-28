import api from "./api";

/**
 * Obtener configuración de email de la barbería (ADMIN)
 */
export const getEmailConfig = async () => {
  const res = await api.get("/barberias/configuracion/email");
  return res.data;
};

/**
 * Actualizar configuración de email de la barbería (ADMIN)
 */
export const updateEmailConfig = async (data) => {
  const res = await api.patch("/barberias/configuracion/email", data);
  return res.data;
};

/**
 * Probar configuración de email antes de guardar (ADMIN)
 */
export const testEmailConfig = async (data) => {
  const res = await api.post("/barberias/configuracion/email/test", data);
  return res.data;
};
