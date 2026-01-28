import React, { useState, useEffect } from "react";
import {
    obtenerResenasPendientes,
    obtenerResenasAprobadas,
    obtenerEstadisticas,
    aprobarResena,
    ocultarResena,
    mostrarResena
} from "../../services/resenasService";
import CalificacionEstrellas from "../../components/CalificacionEstrellas";
import "./GestionResenas.css";

const GestionResenas = () => {
    const [activeTab, setActiveTab] = useState("pendientes");
    const [resenas, setResenas] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, [activeTab]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [statsRes] = await Promise.all([
                obtenerEstadisticas()
            ]);
            setEstadisticas(statsRes.data.data);

            if (activeTab === "pendientes") {
                const res = await obtenerResenasPendientes();
                setResenas(res.data.data);
            } else if (activeTab === "aprobadas") {
                const res = await obtenerResenasAprobadas(true);
                setResenas(res.data.data);
            } else if (activeTab === "ocultas") {
                const res = await obtenerResenasAprobadas(false);
                setResenas(res.data.data);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            alert("Error al cargar las reseñas");
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (resenaId) => {
        if (!window.confirm("¿Aprobar esta reseña?")) return;
        setProcesando(resenaId);
        try {
            await aprobarResena(resenaId);
            await cargarDatos();
        } catch (error) {
            alert("Error al aprobar reseña");
        } finally {
            setProcesando(null);
        }
    };

    const handleOcultar = async (resenaId) => {
        if (!window.confirm("¿Ocultar esta reseña?")) return;
        setProcesando(resenaId);
        try {
            await ocultarResena(resenaId);
            await cargarDatos();
        } catch (error) {
            alert("Error al ocultar reseña");
        } finally {
            setProcesando(null);
        }
    };

    const handleMostrar = async (resenaId) => {
        if (!window.confirm("¿Mostrar esta reseña nuevamente?")) return;
        setProcesando(resenaId);
        try {
            await mostrarResena(resenaId);
            await cargarDatos();
        } catch (error) {
            alert("Error al mostrar reseña");
        } finally {
            setProcesando(null);
        }
    };

    return (
        <div className="gestion-resenas">
            <div className="header">
                <h1>⭐ Gestión de Reseñas</h1>
                <p>Modera y gestiona las reseñas de tus clientes</p>
            </div>

            {estadisticas && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-content">
                            <div className="stat-value">{estadisticas.promedio}</div>
                            <div className="stat-label">Promedio General</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <div className="stat-value">{estadisticas.total}</div>
                            <div className="stat-label">Total Reseñas</div>
                        </div>
                    </div>
                    <div className="stat-card alert">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <div className="stat-value">{estadisticas.pendientes}</div>
                            <div className="stat-label">Pendientes</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-value">{estadisticas.aprobadas}</div>
                            <div className="stat-label">Aprobadas</div>
                        </div>
                    </div>
                </div>
            )}

            {estadisticas && estadisticas.distribucion && (
                <div className="distribucion-card">
                    <h3>Distribución de Calificaciones</h3>
                    <div className="distribucion-bars">
                        {[5, 4, 3, 2, 1].map((stars) => (
                            <div key={stars} className="bar-row">
                                <span className="bar-label">{stars} ⭐</span>
                                <div className="bar-container">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${estadisticas.total > 0 ? (estadisticas.distribucion[stars] / estadisticas.total) * 100 : 0}%`
                                        }}
                                    />
                                </div>
                                <span className="bar-count">{estadisticas.distribucion[stars]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="tabs">
                <button
                    className={`tab ${activeTab === "pendientes" ? "active" : ""}`}
                    onClick={() => setActiveTab("pendientes")}
                >
                    Pendientes {estadisticas && `(${estadisticas.pendientes})`}
                </button>
                <button
                    className={`tab ${activeTab === "aprobadas" ? "active" : ""}`}
                    onClick={() => setActiveTab("aprobadas")}
                >
                    Aprobadas {estadisticas && `(${estadisticas.aprobadas})`}
                </button>
                <button
                    className={`tab ${activeTab === "ocultas" ? "active" : ""}`}
                    onClick={() => setActiveTab("ocultas")}
                >
                    Ocultas {estadisticas && `(${estadisticas.ocultas})`}
                </button>
            </div>

            <div className="resenas-list">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Cargando reseñas...</p>
                    </div>
                ) : resenas.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>No hay reseñas {activeTab}</p>
                    </div>
                ) : (
                    resenas.map((resena) => (
                        <div key={resena._id} className="resena-card">
                            <div className="resena-header-row">
                                <div className="cliente-info">
                                    <div className="avatar">{resena.nombreCliente.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <strong>{resena.nombreCliente}</strong>
                                        <p className="fecha">
                                            {new Date(resena.createdAt).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="barbero-badge">
                                    👤 {resena.barberoId?.nombre || "N/A"}
                                </div>
                            </div>

                            <div className="calificacion-row">
                                <CalificacionEstrellas value={resena.calificacionGeneral} readonly size="md" />
                                <span className="calificacion-numero">{resena.calificacionGeneral}/5</span>
                            </div>

                            {resena.comentario && (
                                <div className="comentario">
                                    <p>"{resena.comentario}"</p>
                                </div>
                            )}

                            <div className="calificaciones-detalle-mini">
                                {resena.calificacionServicio && (
                                    <div className="mini-rating">
                                        <span>Servicio:</span>
                                        <CalificacionEstrellas value={resena.calificacionServicio} readonly size="sm" />
                                    </div>
                                )}
                                {resena.calificacionAtencion && (
                                    <div className="mini-rating">
                                        <span>Atención:</span>
                                        <CalificacionEstrellas value={resena.calificacionAtencion} readonly size="sm" />
                                    </div>
                                )}
                                {resena.calificacionLimpieza && (
                                    <div className="mini-rating">
                                        <span>Limpieza:</span>
                                        <CalificacionEstrellas value={resena.calificacionLimpieza} readonly size="sm" />
                                    </div>
                                )}
                            </div>

                            <div className="acciones">
                                {activeTab === "pendientes" && (
                                    <button
                                        className="btn btn-aprobar"
                                        onClick={() => handleAprobar(resena._id)}
                                        disabled={procesando === resena._id}
                                    >
                                        ✅ Aprobar
                                    </button>
                                )}
                                {activeTab === "aprobadas" && (
                                    <button
                                        className="btn btn-ocultar"
                                        onClick={() => handleOcultar(resena._id)}
                                        disabled={procesando === resena._id}
                                    >
                                        👁️‍🗨️ Ocultar
                                    </button>
                                )}
                                {activeTab === "ocultas" && (
                                    <button
                                        className="btn btn-mostrar"
                                        onClick={() => handleMostrar(resena._id)}
                                        disabled={procesando === resena._id}
                                    >
                                        👁️ Mostrar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GestionResenas;
