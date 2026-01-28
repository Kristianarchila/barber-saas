import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { obtenerResenasPublicas, obtenerEstadisticasPublicas } from "../services/resenasService";
import TarjetaResena from "./TarjetaResena";
import CalificacionEstrellas from "./CalificacionEstrellas";
import "./ListaResenas.css";

const ListaResenas = ({ barberiaSlug, barberoId = null, limit = 5 }) => {
    const [resenas, setResenas] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        cargarResenas();
        cargarEstadisticas();
    }, [barberiaSlug, barberoId, page]);

    const cargarResenas = async () => {
        try {
            setLoading(true);
            const params = { page, limit };
            if (barberoId) params.barberoId = barberoId;

            const response = await obtenerResenasPublicas(barberiaSlug, params);

            if (response.success) {
                setResenas(response.data.resenas);
                setHasMore(response.data.page < response.data.totalPages);
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error("Error cargando reseñas:", err);
            setError("Error al cargar las reseñas");
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const response = await obtenerEstadisticasPublicas(barberiaSlug);
            if (response.success) {
                setEstadisticas(response.data);
            }
        } catch (err) {
            console.error("Error cargando estadísticas:", err);
        }
    };

    const handleVerMas = () => {
        setPage(prev => prev + 1);
    };

    if (loading && page === 1) {
        return (
            <div className="lista-resenas-loading">
                <div className="spinner"></div>
                <p>Cargando reseñas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="lista-resenas-error">
                <p>{error}</p>
            </div>
        );
    }

    if (!resenas || resenas.length === 0) {
        return (
            <div className="lista-resenas-empty">
                <div className="empty-icon">⭐</div>
                <h3>Aún no hay reseñas</h3>
                <p>Sé el primero en dejar tu opinión</p>
            </div>
        );
    }

    return (
        <div className="lista-resenas">
            {estadisticas && estadisticas.total > 0 && (
                <div className="resenas-header">
                    <div className="resenas-stats">
                        <div className="promedio-general">
                            <div className="promedio-numero">{estadisticas.promedio}</div>
                            <CalificacionEstrellas value={estadisticas.promedio} readonly size="lg" />
                            <p className="total-resenas">
                                Basado en {estadisticas.total} {estadisticas.total === 1 ? 'reseña' : 'reseñas'}
                            </p>
                        </div>

                        {estadisticas.distribucion && (
                            <div className="distribucion">
                                {[5, 4, 3, 2, 1].map((stars) => (
                                    <div key={stars} className="distribucion-row">
                                        <span className="stars-label">{stars} ⭐</span>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    width: `${estadisticas.total > 0 ? (estadisticas.distribucion[stars] / estadisticas.total) * 100 : 0}%`
                                                }}
                                            />
                                        </div>
                                        <span className="count">{estadisticas.distribucion[stars]}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="resenas-lista">
                {resenas.map((resena) => (
                    <TarjetaResena
                        key={resena._id}
                        resena={resena}
                        showBarbero={!barberoId}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="ver-mas-container">
                    <button
                        className="btn-ver-mas"
                        onClick={handleVerMas}
                        disabled={loading}
                    >
                        {loading ? "Cargando..." : "Ver más reseñas"}
                    </button>
                </div>
            )}
        </div>
    );
};

ListaResenas.propTypes = {
    barberiaSlug: PropTypes.string.isRequired,
    barberoId: PropTypes.string,
    limit: PropTypes.number
};

export default ListaResenas;
