import api from "./api";

export async function getFinanzasAdmin() {
  const res = await api.get("/finanzas/resumen");
  return res.data;
}
