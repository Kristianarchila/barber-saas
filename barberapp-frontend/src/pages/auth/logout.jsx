
export const logout = (navigate) => {
  // Limpiar TODO el localStorage
  localStorage.clear();
  
  // O si prefieres limpiar selectivamente:
  // localStorage.removeItem("token");
  // localStorage.removeItem("user");
  // localStorage.removeItem("barberoId");
  // localStorage.removeItem("adminId");
  // localStorage.removeItem("superadminId");
  // localStorage.removeItem("auth");
  
  console.log("✅ Sesión cerrada correctamente");
  
  // Redirigir al login
  navigate("/login");
};