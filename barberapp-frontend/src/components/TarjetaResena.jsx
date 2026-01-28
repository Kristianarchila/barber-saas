import React from "react";
import PropTypes from "prop-types";
import CalificacionEstrellas from "./CalificacionEstrellas";
import "./TarjetaResena.css";

const TarjetaResena = ({ resena, showBarbero = true }) => {
    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="tarjeta-resena">
            <div className="resena-header">
                <div className="cliente-info">
                    <div className="avatar">
                        {resena.nombreCliente.charAt(0).toUpperCase()}
                    </div>
                    <div className="cliente-datos">
                        <h4 className="cliente-nombre">{resena.nombreCliente}</h4>
                        <p className="resena-fecha">{formatearFecha(resena.createdAt)}</p>
                    </div>
                </div>
                {showBarbero && resena.barberoId && (
                    <div className="barbero-badge">
                        <span className="barbero-icon">✂️</span>
                        {resena.barberoId.nombre}
                    </div>
                )}
            </div>

            <div className="resena-calificacion">
                <CalificacionEstrellas
                    value={resena.calificacionGeneral}
                    readonly
                    size="md"
                />
                <span className="calificacion-numero">
                    {resena.calificacionGeneral.toFixed(1)}
                </span>
            </div>

            {resena.comentario && (
                <div className="resena-comentario">
                    <p>"{resena.comentario}"</p>
                </div>
            )}

            {(resena.calificacionServicio || resena.calificacionAtencion || resena.calificacionLimpieza) && (
                <div className="calificaciones-detalle">
                    {resena.calificacionServicio && (
                        <div className="detalle-item">
                            <span className="detalle-label">Servicio</span>
                            <CalificacionEstrellas
                                value={resena.calificacionServicio}
                                readonly
                                size="sm"
                            />
                        </div>
                    )}
                    {resena.calificacionAtencion && (
                        <div className="detalle-item">
                            <span className="detalle-label">Atención</span>
                            <CalificacionEstrellas
                                value={resena.calificacionAtencion}
                                readonly
                                size="sm"
                            />
                        </div>
                    )}
                    {resena.calificacionLimpieza && (
                        <div className="detalle-item">
                            <span className="detalle-label">Limpieza</span>
                            <CalificacionEstrellas
                                value={resena.calificacionLimpieza}
                                readonly
                                size="sm"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

TarjetaResena.propTypes = {
    resena: PropTypes.shape({
        nombreCliente: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        calificacionGeneral: PropTypes.number.isRequired,
        calificacionServicio: PropTypes.number,
        calificacionAtencion: PropTypes.number,
        calificacionLimpieza: PropTypes.number,
        comentario: PropTypes.string,
        barberoId: PropTypes.shape({
            nombre: PropTypes.string
        })
    }).isRequired,
    showBarbero: PropTypes.bool
};

export default TarjetaResena;
