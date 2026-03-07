import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { validarToken, crearResena } from "../../services/resenasService";
import CalificacionEstrellas from "../../components/CalificacionEstrellas";
import "./DejarResena.css";

const DejarResena = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reservaData, setReservaData] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState(false);

    const [formData, setFormData] = useState({
        calificacionGeneral: 0,
        calificacionServicio: 0,
        calificacionAtencion: 0,
        calificacionLimpieza: 0,
        comentario: ""
    });

    useEffect(() => {
        const validar = async () => {
            if (!token) {
                setError("Token de reseña no proporcionado");
                setLoading(false);
                return;
            }

            try {
                const response = await validarToken(slug, token);
                if (response.success) {
                    setReservaData(response.data.reserva);
                }
            } catch (err) {
                if (err.yaEnviada) {
                    setError("Ya dejaste una reseña para este servicio. ¡Gracias!");
                } else if (err.expirado) {
                    setError("El plazo para dejar reseña ha expirado (30 días)");
                } else {
                    setError(err.message || "Token inválido o expirado");
                }
            } finally {
                setLoading(false);
            }
        };

        validar();
    }, [slug, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.calificacionGeneral === 0) {
            alert("Por favor, selecciona una calificación general");
            return;
        }

        setEnviando(true);
        try {
            await crearResena(slug, token, formData);
            setExito(true);
            setTimeout(() => {
                navigate(`/public/${slug}/book`);
            }, 3000);
        } catch (err) {
            alert(err.message || "Error al enviar la reseña");
        } finally {
            setEnviando(false);
        }
    };

    if (loading) {
        return (
            <div className="resena-container">
                <div className="resena-card">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Validando...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="resena-container">
                <div className="resena-card error-card">
                    <div className="error-icon">❌</div>
                    <h2>No se puede dejar reseña</h2>
                    <p>{error}</p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate(`/public/${slug}/book`)}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (exito) {
        return (
            <div className="resena-container">
                <div className="resena-card success-card">
                    <div className="success-icon">✅</div>
                    <h2>¡Gracias por tu reseña!</h2>
                    <p>Tu opinión será publicada tras moderación.</p>
                    <p className="redirect-text">Redirigiendo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="resena-container">
            <div className="resena-card">
                <div className="resena-header">
                    <h1>⭐ ¿Cómo fue tu experiencia?</h1>
                    <p className="subtitle">Tu opinión nos ayuda a mejorar</p>
                </div>

                {reservaData && (
                    <div className="servicio-info">
                        <h3>Detalles del servicio</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="icon">📅</span>
                                <div>
                                    <strong>Fecha</strong>
                                    <p>{new Date(reservaData.fecha).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <span className="icon">✂️</span>
                                <div>
                                    <strong>Servicio</strong>
                                    <p>{reservaData.servicio}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <span className="icon">👤</span>
                                <div>
                                    <strong>Atendido por</strong>
                                    <p>{reservaData.barbero}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="resena-form">
                    <div className="form-section">
                        <h3>Calificación</h3>

                        <CalificacionEstrellas
                            label="Calificación General *"
                            value={formData.calificacionGeneral}
                            onChange={(value) => setFormData({ ...formData, calificacionGeneral: value })}
                            size="lg"
                        />

                        <div className="calificaciones-detalle">
                            <CalificacionEstrellas
                                label="Calidad del Servicio"
                                value={formData.calificacionServicio}
                                onChange={(value) => setFormData({ ...formData, calificacionServicio: value })}
                                size="md"
                            />

                            <CalificacionEstrellas
                                label="Atención al Cliente"
                                value={formData.calificacionAtencion}
                                onChange={(value) => setFormData({ ...formData, calificacionAtencion: value })}
                                size="md"
                            />

                            <CalificacionEstrellas
                                label="Limpieza del Local"
                                value={formData.calificacionLimpieza}
                                onChange={(value) => setFormData({ ...formData, calificacionLimpieza: value })}
                                size="md"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <label htmlFor="comentario">
                            <h3>Cuéntanos más (opcional)</h3>
                        </label>
                        <textarea
                            id="comentario"
                            value={formData.comentario}
                            onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                            placeholder="Comparte tu experiencia con nosotros..."
                            maxLength={500}
                            rows={5}
                        />
                        <div className="char-count">
                            {formData.comentario.length}/500 caracteres
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={enviando || formData.calificacionGeneral === 0}
                    >
                        {enviando ? "Enviando..." : "Enviar Reseña"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DejarResena;
