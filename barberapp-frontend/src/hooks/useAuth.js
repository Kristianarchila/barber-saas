import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    const navigate = useNavigate();

    const login = (userData, token) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    const isAuthenticated = !!localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return { login, logout, isAuthenticated, user };
};
