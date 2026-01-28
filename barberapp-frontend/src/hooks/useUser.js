import { useState, useEffect } from "react";

export const useUser = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser) setUser(storedUser);
    }, []);

    const updateUser = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    return { user, updateUser };
};
