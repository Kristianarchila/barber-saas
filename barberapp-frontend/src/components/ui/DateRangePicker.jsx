import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const PRESETS = [
    { id: "hoy", label: "Hoy", fn: () => { const d = dayjs().format("YYYY-MM-DD"); return { i: d, f: d }; } },
    { id: "ayer", label: "Ayer", fn: () => { const d = dayjs().subtract(1, "day").format("YYYY-MM-DD"); return { i: d, f: d }; } },
    { id: "7d", label: "Últimos 7d", fn: () => ({ i: dayjs().subtract(6, "day").format("YYYY-MM-DD"), f: dayjs().format("YYYY-MM-DD") }) },
    { id: "15d", label: "Últimos 15d", fn: () => ({ i: dayjs().subtract(14, "day").format("YYYY-MM-DD"), f: dayjs().format("YYYY-MM-DD") }) },
    { id: "mes", label: "Este mes", fn: () => ({ i: dayjs().startOf("month").format("YYYY-MM-DD"), f: dayjs().format("YYYY-MM-DD") }) },
    { id: "mes_ant", label: "Mes anterior", fn: () => ({ i: dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD"), f: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD") }) },
    { id: "3m", label: "Últimos 3m", fn: () => ({ i: dayjs().subtract(3, "month").startOf("month").format("YYYY-MM-DD"), f: dayjs().format("YYYY-MM-DD") }) },
    { id: "anio", label: "Este año", fn: () => ({ i: dayjs().startOf("year").format("YYYY-MM-DD"), f: dayjs().format("YYYY-MM-DD") }) },
];

const DOW = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function MonthGrid({ viewMonth, selectedStart, selectedEnd, hoveredDay, onClickDay, onHoverDay, isPickingEnd }) {
    const firstDow = (viewMonth.startOf("month").day() + 6) % 7;
    const daysInMonth = viewMonth.daysInMonth();

    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(viewMonth.date(d));

    const rangeEnd = selectedEnd || (isPickingEnd ? hoveredDay : null);

    return (
        <div style={{ width: 252 }}>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {DOW.map(d => (
                    <div key={d} className="flex items-center justify-center" style={{ width: 36, height: 28 }}>
                        <span className="text-[10px] font-black text-gray-300 uppercase">{d}</span>
                    </div>
                ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                    if (!day) return <div key={`_${idx}`} style={{ width: 36, height: 36 }} />;

                    const fmt = day.format("YYYY-MM-DD");
                    const isStart = selectedStart && day.isSame(selectedStart, "day");
                    const isEnd = rangeEnd && day.isSame(rangeEnd, "day");
                    const isEdge = isStart || isEnd;
                    const isToday = day.isSame(dayjs(), "day");

                    let inRange = false;
                    if (selectedStart && rangeEnd) {
                        const [lo, hi] = selectedStart.isBefore(rangeEnd)
                            ? [selectedStart, rangeEnd]
                            : [rangeEnd, selectedStart];
                        inRange = day.isAfter(lo, "day") && day.isBefore(hi, "day");
                    }

                    return (
                        <div key={fmt}
                            style={{ width: 36, height: 36 }}
                            className={`flex items-center justify-center cursor-pointer select-none transition-all
                                ${inRange ? "bg-gray-100" : ""}
                                ${isEdge ? "" : "rounded-xl"}
                                ${isStart && rangeEnd ? "rounded-l-xl rounded-r-none" : ""}
                                ${isEnd && selectedStart ? "rounded-r-xl rounded-l-none" : ""}
                                ${isEdge && !rangeEnd ? "rounded-xl" : ""}
                            `}
                            onClick={() => onClickDay(day)}
                            onMouseEnter={() => onHoverDay(day)}
                        >
                            <span className={`
                                w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold transition-all
                                ${isEdge
                                    ? "bg-gray-900 text-white shadow-md"
                                    : isToday
                                        ? "ring-2 ring-gray-200 text-gray-900 hover:bg-gray-50"
                                        : "text-gray-700 hover:bg-gray-100"
                                }
                            `}>
                                {day.date()}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function DateRangePicker({ fechaInicio, fechaFin, onChange, label = "Período" }) {
    const [open, setOpen] = useState(false);
    const [viewLeft, setViewLeft] = useState(() => dayjs(fechaInicio).startOf("month"));
    const [selStart, setSelStart] = useState(() => dayjs(fechaInicio));
    const [selEnd, setSelEnd] = useState(() => dayjs(fechaFin));
    const [hovered, setHovered] = useState(null);
    const [pickingEnd, setPickingEnd] = useState(false);
    const [activePreset, setActive] = useState(null);
    const wrapperRef = useRef();

    const viewRight = viewLeft.add(1, "month");

    useEffect(() => {
        const h = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const handleClick = (day) => {
        setActive(null);
        if (!pickingEnd) {
            setSelStart(day);
            setSelEnd(null);
            setPickingEnd(true);
        } else {
            const [s, e] = day.isBefore(selStart) ? [day, selStart] : [selStart, day];
            setSelStart(s);
            setSelEnd(e);
            setPickingEnd(false);
            setHovered(null);
            commit(s, e);
        }
    };

    const commit = (s, e) => {
        onChange({ fechaInicio: s.format("YYYY-MM-DD"), fechaFin: e.format("YYYY-MM-DD") });
        setOpen(false);
    };

    const applyPreset = (p) => {
        const { i, f } = p.fn();
        const s = dayjs(i), e = dayjs(f);
        setSelStart(s);
        setSelEnd(e);
        setViewLeft(s.startOf("month"));
        setPickingEnd(false);
        setHovered(null);
        setActive(p.id);
        onChange({ fechaInicio: i, fechaFin: f });
        setOpen(false);
    };

    const displayLabel = () => {
        if (!selStart) return "Seleccionar período";
        const s = selStart.format("DD MMM YYYY");
        if (!selEnd || selEnd.isSame(selStart, "day")) return s;
        return `${s}  —  ${selEnd.format("DD MMM YYYY")}`;
    };

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Trigger */}
            <button
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all select-none shadow-sm hover:shadow-md group
                    ${open ? "border-gray-400 bg-white" : "border-gray-200 bg-white hover:border-gray-400"}`}
            >
                <Calendar size={16} className="text-gray-400 flex-shrink-0 group-hover:text-gray-700" />
                <div className="text-left min-w-0">
                    {label && <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">{label}</p>}
                    <p className="text-sm font-black text-gray-900 leading-tight whitespace-nowrap">{displayLabel()}</p>
                </div>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 z-[100] bg-white rounded-3xl shadow-2xl border border-gray-100 flex overflow-hidden"
                        style={{ minWidth: 500 }}
                    >
                        {/* Presets */}
                        <div className="flex flex-col gap-0.5 p-3 bg-gray-50 border-r border-gray-100 min-w-[130px]">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 py-1 mb-1">Acceso rápido</p>
                            {PRESETS.map(p => (
                                <button key={p.id} onClick={() => applyPreset(p)}
                                    className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all w-full
                                        ${activePreset === p.id
                                            ? "bg-gray-900 text-white"
                                            : "text-gray-600 hover:bg-white hover:shadow-sm"}`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Calendar area */}
                        <div className="p-4 flex flex-col gap-3">
                            {/* Nav */}
                            <div className="flex items-center justify-between">
                                <button onClick={() => setViewLeft(v => v.subtract(1, "month"))}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="flex gap-[116px]">
                                    <span className="text-sm font-black text-gray-900 capitalize w-[126px] text-center">
                                        {viewLeft.format("MMMM YYYY")}
                                    </span>
                                    <span className="text-sm font-black text-gray-900 capitalize w-[126px] text-center">
                                        {viewRight.format("MMMM YYYY")}
                                    </span>
                                </div>
                                <button onClick={() => setViewLeft(v => v.add(1, "month"))}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Two month grids */}
                            <div className="flex gap-4">
                                <MonthGrid
                                    viewMonth={viewLeft}
                                    selectedStart={selStart}
                                    selectedEnd={selEnd}
                                    hoveredDay={hovered}
                                    isPickingEnd={pickingEnd}
                                    onClickDay={handleClick}
                                    onHoverDay={d => pickingEnd && setHovered(d)}
                                />
                                <div className="w-px bg-gray-100 self-stretch" />
                                <MonthGrid
                                    viewMonth={viewRight}
                                    selectedStart={selStart}
                                    selectedEnd={selEnd}
                                    hoveredDay={hovered}
                                    isPickingEnd={pickingEnd}
                                    onClickDay={handleClick}
                                    onHoverDay={d => pickingEnd && setHovered(d)}
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-1">
                                <p className="text-xs text-gray-400 font-bold">
                                    {pickingEnd
                                        ? "Ahora seleccioná la fecha final"
                                        : selStart && selEnd
                                            ? `${selStart.format("DD/MM/YY")} → ${selEnd.format("DD/MM/YY")}`
                                            : "Seleccioná el inicio"}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setOpen(false); setPickingEnd(false); }}
                                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                                        Cancelar
                                    </button>
                                    {!pickingEnd && selStart && selEnd && (
                                        <button
                                            onClick={() => commit(selStart, selEnd)}
                                            className="px-5 py-2 text-xs font-black bg-gray-900 text-white rounded-xl hover:bg-black transition-all">
                                            Aplicar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
