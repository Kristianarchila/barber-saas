# Módulo Barberos - Ejemplos de Uso

## 📚 Hooks Disponibles

### 1. useGetBarberos
Obtener lista de barberos con filtros opcionales.

### 2. useGetBarberoById
Obtener un barbero específico por ID.

### 3. useGetDisponibilidad
Obtener disponibilidad de un barbero en una fecha.

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Listar Barberos Activos

```javascript
import { useGetBarberos } from '../presentation/hooks/useGetBarberos';
import { Avatar } from '../components/ui';

function BarberosList() {
  // Auto-fetch al montar, solo barberos activos
  const { barberos, loading, error, refresh } = useGetBarberos({ activo: true }, true);

  if (loading) return <div>Cargando barberos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="barberos-grid">
      <button onClick={refresh}>Refrescar</button>
      
      {barberos.map(barbero => (
        <div key={barbero.id} className="barbero-card">
          {/* Avatar con imagen o iniciales */}
          {barbero.imagen ? (
            <img src={barbero.imagen} alt={barbero.nombre} />
          ) : (
            <div className="avatar-placeholder">
              {barbero.iniciales}
            </div>
          )}
          
          <h3>{barbero.nombre}</h3>
          <p>{barbero.especialidad}</p>
          
          {/* Usar propiedades calculadas del ViewModel */}
          {barbero.tieneResenas && (
            <div className="rating">
              ⭐ {barbero.calificacionPromedio.toFixed(1)}
              <span className={`badge-${barbero.calificacionBadge.color}`}>
                {barbero.calificacionBadge.label}
              </span>
            </div>
          )}
          
          {/* Mostrar días disponibles */}
          <div className="dias-disponibles">
            {barbero.diasDisponibles.map(dia => (
              <span key={dia} className="dia-badge">{dia}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Ejemplo 2: Selector de Barbero para Reserva

```javascript
import { useGetBarberos } from '../presentation/hooks/useGetBarberos';

function BarberoSelector({ servicioId, onSelect }) {
  const { barberos, loading, getBarberosByServicio } = useGetBarberos({}, true);
  
  // Filtrar barberos que ofrecen el servicio seleccionado
  const barberosDisponibles = servicioId 
    ? getBarberosByServicio(servicioId)
    : barberos.filter(b => b.estaActivo);

  return (
    <select onChange={(e) => onSelect(e.target.value)} disabled={loading}>
      <option value="">Selecciona un barbero</option>
      {barberosDisponibles.map(barbero => (
        <option key={barbero.id} value={barbero.id}>
          {barbero.nombre}
          {barbero.tieneBuenaCalificacion && ' ⭐'}
        </option>
      ))}
    </select>
  );
}
```

### Ejemplo 3: Perfil de Barbero

```javascript
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetBarberoById } from '../presentation/hooks/useGetBarberoById';

function BarberoProfile() {
  const { barberoId } = useParams();
  const { barbero, loading, error, fetchBarbero } = useGetBarberoById();

  useEffect(() => {
    if (barberoId) {
      fetchBarbero(barberoId);
    }
  }, [barberoId]);

  if (loading) return <div>Cargando perfil...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!barbero) return <div>Barbero no encontrado</div>;

  return (
    <div className="barbero-profile">
      <div className="profile-header">
        {barbero.imagen ? (
          <img src={barbero.imagen} alt={barbero.nombre} className="profile-img" />
        ) : (
          <div className="profile-placeholder">{barbero.iniciales}</div>
        )}
        
        <div className="profile-info">
          <h1>{barbero.nombre}</h1>
          {barbero.especialidad && <p className="especialidad">{barbero.especialidad}</p>}
          
          {/* Estado activo/inactivo */}
          <span className={`badge ${barbero.estaActivo ? 'badge-success' : 'badge-neutral'}`}>
            {barbero.estaActivo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Calificación */}
      {barbero.tieneResenas && (
        <div className="rating-section">
          <div className="rating-stars">
            ⭐ {barbero.calificacionPromedio.toFixed(1)}
          </div>
          <span className={`badge-${barbero.calificacionBadge.color}`}>
            {barbero.calificacionBadge.label}
          </span>
          <p className="total-resenas">
            {barbero.totalResenas} {barbero.totalResenas === 1 ? 'reseña' : 'reseñas'}
          </p>
        </div>
      )}

      {/* Descripción */}
      {barbero.descripcion && (
        <div className="description">
          <h2>Sobre mí</h2>
          <p>{barbero.descripcion}</p>
        </div>
      )}

      {/* Horarios */}
      <div className="horarios">
        <h2>Horarios de atención</h2>
        {barbero.horarios.map((horario, index) => (
          <div key={index} className="horario-item">
            <span className="dia">{horario.dia}</span>
            {horario.activo ? (
              <span className="horas">
                {horario.horaInicio} - {horario.horaFin}
              </span>
            ) : (
              <span className="cerrado">Cerrado</span>
            )}
          </div>
        ))}
      </div>

      {/* Servicios */}
      <div className="servicios">
        <h2>Servicios que ofrece</h2>
        <div className="servicios-grid">
          {barbero.servicios.map(servicio => (
            <div key={servicio.id || servicio} className="servicio-badge">
              {servicio.nombre || servicio}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Ejemplo 4: Disponibilidad de Barbero

```javascript
import { useState } from 'react';
import { useGetDisponibilidad } from '../presentation/hooks/useGetDisponibilidad';

function DisponibilidadSelector({ barberoId }) {
  const [fecha, setFecha] = useState('');
  const { disponibilidad, loading, error, fetchDisponibilidad } = useGetDisponibilidad();

  const handleFechaChange = async (e) => {
    const nuevaFecha = e.target.value;
    setFecha(nuevaFecha);
    
    if (barberoId && nuevaFecha) {
      await fetchDisponibilidad(barberoId, nuevaFecha);
    }
  };

  return (
    <div className="disponibilidad-selector">
      <label>Selecciona una fecha:</label>
      <input 
        type="date" 
        value={fecha}
        onChange={handleFechaChange}
        min={new Date().toISOString().split('T')[0]}
      />

      {loading && <div>Cargando disponibilidad...</div>}
      {error && <div className="error">{error}</div>}

      {disponibilidad && (
        <div className="horarios-disponibles">
          <h3>Horarios disponibles:</h3>
          {disponibilidad.horasDisponibles?.length > 0 ? (
            <div className="horas-grid">
              {disponibilidad.horasDisponibles.map(hora => (
                <button 
                  key={hora} 
                  className="hora-btn"
                  onClick={() => console.log('Seleccionado:', hora)}
                >
                  {hora}
                </button>
              ))}
            </div>
          ) : (
            <p>No hay horarios disponibles para esta fecha</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### Ejemplo 5: Filtrar Barberos por Servicio

```javascript
import { useState } from 'react';
import { useGetBarberos } from '../presentation/hooks/useGetBarberos';

function BarberosConFiltros() {
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const { barberos, loading, getBarberosByServicio, getActiveBarberos } = useGetBarberos({}, true);

  // Obtener barberos filtrados
  const barberosFiltrados = servicioSeleccionado
    ? getBarberosByServicio(servicioSeleccionado)
    : getActiveBarberos();

  return (
    <div>
      <div className="filtros">
        <select onChange={(e) => setServicioSeleccionado(e.target.value || null)}>
          <option value="">Todos los servicios</option>
          <option value="corte-caballero">Corte Caballero</option>
          <option value="barba">Arreglo de Barba</option>
          <option value="afeitado">Afeitado Clásico</option>
        </select>
      </div>

      <div className="resultados">
        <p>{barberosFiltrados.length} barberos encontrados</p>
        
        {barberosFiltrados.map(barbero => (
          <div key={barbero.id} className="barbero-item">
            <h3>{barbero.nombre}</h3>
            
            {/* Usar métodos de negocio de la entidad */}
            {barbero.tieneBuenaCalificacion && (
              <span className="badge-success">Recomendado</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Reglas de Negocio Disponibles

Todas estas propiedades vienen calculadas en el ViewModel:

```javascript
const barbero = barberos[0];

// ¿Está activo?
if (barbero.estaActivo) {
  // Mostrar como disponible
}

// ¿Tiene buena calificación?
if (barbero.tieneBuenaCalificacion) {
  // Mostrar badge de recomendado
}

// ¿Tiene reseñas?
if (barbero.tieneResenas) {
  // Mostrar estrellas y total
}

// Días disponibles
barbero.diasDisponibles.forEach(dia => {
  // Mostrar badges de días
});

// Badge de calificación
<span className={`badge-${barbero.calificacionBadge.color}`}>
  {barbero.calificacionBadge.label}
</span>

// Iniciales para avatar
<div className="avatar">{barbero.iniciales}</div>
```

---

## ✅ Ventajas del Módulo

1. **Lógica de negocio centralizada**: Métodos como `estaActivo()`, `tieneBuenaCalificacion()` en la entidad
2. **ViewModels listos para UI**: Propiedades calculadas como `iniciales`, `calificacionBadge`
3. **Filtros útiles**: `getActiveBarberos()`, `getBarberosByServicio()`
4. **Manejo de errores**: Automático en todos los hooks
5. **Reutilizable**: Los mismos hooks en múltiples componentes

---

## 🚀 Próximos Pasos

Este patrón está listo para:
- Crear/Editar barberos (agregar use cases CreateBarbero, UpdateBarbero)
- Gestión de horarios
- Gestión de servicios por barbero
- Estadísticas de barbero

¡El módulo de Barberos está completo y listo para usar! 🎉
