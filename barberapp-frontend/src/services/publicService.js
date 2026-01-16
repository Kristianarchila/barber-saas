import api from "./api";

// Servicios visibles públicamente
export async function getServiciosPublicos() {
  const res = await api.get("/public/servicios");
  return res.data;
}

// Barberos visibles públicamente
export async function getBarberosPublicos() {
  const res = await api.get("/public/barberos");
  return res.data;
}
