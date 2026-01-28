export const useRol = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const isSuperAdmin = user.rol === "SUPER_ADMIN";
    const isAdmin = user.rol === "BARBERIA_ADMIN";
    const isBarbero = user.rol === "BARBERO";
    const isCliente = user.rol === "CLIENTE";

    return { rol: user.rol, isSuperAdmin, isAdmin, isBarbero, isCliente };
};
