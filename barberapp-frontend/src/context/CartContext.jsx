import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "barber_cart";

export function CartProvider({ children, slug }) {
    const storageKey = `${STORAGE_KEY}_${slug}`;
    const [items, setItems] = useState(() => {
        try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); }
        catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(items));
    }, [items, storageKey]);

    const addItem = (producto, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i._id === producto._id);
            if (existing) {
                return prev.map(i => i._id === producto._id
                    ? { ...i, qty: Math.min(i.qty + qty, i.stock) }
                    : i);
            }
            return [...prev, { ...producto, qty }];
        });
    };

    const removeItem = (id) => setItems(prev => prev.filter(i => i._id !== id));

    const updateQty = (id, qty) => {
        if (qty <= 0) { removeItem(id); return; }
        setItems(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((s, i) => s + (i.precioDescuento || i.precio) * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
};
