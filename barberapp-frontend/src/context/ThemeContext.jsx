import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Cargar tema desde localStorage o usar 'light' por defecto
        const savedTheme = localStorage.getItem("theme");
        return savedTheme || "light";
    });

    useEffect(() => {
        // Aplicar clase al documento
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);

        // Guardar en localStorage
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === "light" ? "dark" : "light");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
