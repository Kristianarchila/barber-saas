import React, { useState } from "react";
import PropTypes from "prop-types";
import "./CalificacionEstrellas.css";

const CalificacionEstrellas = ({
    value = 0,
    onChange,
    readonly = false,
    size = "md",
    label
}) => {
    const [hoverValue, setHoverValue] = useState(0);

    const handleClick = (rating) => {
        if (!readonly && onChange) {
            onChange(rating);
        }
    };

    const handleMouseEnter = (rating) => {
        if (!readonly) {
            setHoverValue(rating);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverValue(0);
        }
    };

    const sizeClasses = {
        sm: "stars-sm",
        md: "stars-md",
        lg: "stars-lg"
    };

    const displayValue = hoverValue || value;

    return (
        <div className="calificacion-estrellas">
            {label && <label className="stars-label">{label}</label>}
            <div
                className={`stars-container ${sizeClasses[size]} ${readonly ? 'readonly' : 'interactive'}`}
                onMouseLeave={handleMouseLeave}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= displayValue ? 'filled' : 'empty'}`}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        role={readonly ? "img" : "button"}
                        aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                        tabIndex={readonly ? -1 : 0}
                        onKeyDown={(e) => {
                            if (!readonly && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                handleClick(star);
                            }
                        }}
                    >
                        ⭐
                    </span>
                ))}
            </div>
        </div>
    );
};

CalificacionEstrellas.propTypes = {
    value: PropTypes.number,
    onChange: PropTypes.func,
    readonly: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    label: PropTypes.string
};

export default CalificacionEstrellas;
