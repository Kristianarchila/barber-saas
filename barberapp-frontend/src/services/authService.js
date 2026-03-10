import api from "./api";

export async function login(credentials) {
  // credentials = { email, password }
  const res = await api.post("/auth/login", credentials);
  // Asumo que el backend responde algo como:
  // { token, usuario: { rol, barberiaId, nombre, ... } }
  return res.data;
}

export async function signup(userData) {
  // userData = { nombre, email, password }
  const res = await api.post("/auth/register", userData);
  return res.data;
}

export async function requestPasswordReset(email) {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
}

export async function resetPassword(token, newPassword) {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return res.data;
}
