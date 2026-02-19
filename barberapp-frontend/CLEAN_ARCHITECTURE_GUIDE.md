# Clean Architecture Frontend - Guía de Uso

## 📚 Estructura Implementada

Se ha implementado Clean Architecture en el frontend con el módulo de **Reservas** como piloto.

### Capas Creadas

```
src/
├── domain/                      # ✅ Capa de Dominio
│   ├── entities/
│   │   └── Reserva.js          # Entidad con reglas de negocio
│   ├── value-objects/
│   │   └── index.js            # Email, Telefono
│   └── repositories/
│       └── IReservaRepository.js # Interface del repositorio
│
├── application/                 # ✅ Capa de Aplicación
│   └── use-cases/reservas/
│       ├── CreateReserva.js    # Crear reserva
│       ├── GetReservas.js      # Obtener reservas
│       ├── CancelReserva.js    # Cancelar reserva
│       └── CompleteReserva.js  # Completar reserva
│
├── infrastructure/              # ✅ Capa de Infraestructura
│   ├── http/
│   │   └── HttpClient.js       # Cliente HTTP con interceptors
│   ├── repositories/
│   │   └── HttpReservaRepository.js # Implementación HTTP
│   ├── mappers/
│   │   └── ReservaMapper.js    # DTO ↔ Domain ↔ ViewModel
│   └── di/
│       └── container.js        # Dependency Injection
│
├── presentation/                # ✅ Capa de Presentación
│   └── hooks/
│       ├── useCreateReserva.js # Hook para crear
│       ├── useGetReservas.js   # Hook para obtener
│       └── useReservaActions.js # Hook para acciones
│
└── shared/                      # ✅ Compartido
    └── errors/
        └── index.js            # Jerarquía de errores
```

---

## 🚀 Cómo Usar en Componentes

### Ejemplo 1: Listar Reservas

```javascript
import { useGetReservas } from '../presentation/hooks/useGetReservas';

function ReservasList() {
  // Auto-fetch al montar el componente
  const { reservas, loading, error, refresh } = useGetReservas({}, true);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refresh}>Refrescar</button>
      {reservas.map(reserva => (
        <div key={reserva.id}>
          <h3>{reserva.clienteNombre}</h3>
          <p>{reserva.fecha} - {reserva.hora}</p>
          <span className={`badge-${reserva.estadoColor}`}>
            {reserva.estadoLabel}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### Ejemplo 2: Crear Reserva

```javascript
import { useCreateReserva } from '../presentation/hooks/useCreateReserva';

function ReservaForm() {
  const { createReserva, loading, error, success } = useCreateReserva();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createReserva({
        barberoId: '123',
        servicioId: '456',
        nombreCliente: 'Juan Pérez',
        emailCliente: 'juan@example.com',
        telefonoCliente: '+56912345678',
        fecha: '2026-02-10',
        hora: '14:00'
      });
      
      alert('Reserva creada exitosamente!');
    } catch (err) {
      // El error ya está en el estado
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... campos del formulario ... */}
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">¡Reserva creada!</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Reserva'}
      </button>
    </form>
  );
}
```

### Ejemplo 3: Acciones (Cancelar/Completar)

```javascript
import { useReservaActions } from '../presentation/hooks/useReservaActions';
import { useGetReservas } from '../presentation/hooks/useGetReservas';

function ReservasTable() {
  const { reservas, refresh } = useGetReservas({}, true);
  const { cancelReserva, completeReserva, loading } = useReservaActions();

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    
    try {
      await cancelReserva(id);
      refresh(); // Refrescar la lista
    } catch (err) {
      alert('Error al cancelar');
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeReserva(id);
      refresh();
    } catch (err) {
      alert('Error al completar');
    }
  };

  return (
    <table>
      {reservas.map(reserva => (
        <tr key={reserva.id}>
          <td>{reserva.clienteNombre}</td>
          <td>{reserva.fecha}</td>
          <td>
            {reserva.puedeSerCompletada && (
              <button onClick={() => handleComplete(reserva.id)} disabled={loading}>
                Completar
              </button>
            )}
            {reserva.puedeSerCancelada && (
              <button onClick={() => handleCancel(reserva.id)} disabled={loading}>
                Cancelar
              </button>
            )}
          </td>
        </tr>
      ))}
    </table>
  );
}
```

---

## 🎯 Reglas de Negocio Disponibles

La entidad `Reserva` incluye métodos de negocio:

```javascript
const reserva = reservas[0];

// ¿Puede ser cancelada?
if (reserva.puedeSerCancelada) {
  // Mostrar botón de cancelar
}

// ¿Puede ser completada?
if (reserva.puedeSerCompletada) {
  // Mostrar botón de completar
}

// ¿Está vigente?
if (reserva.estaVigente) {
  // Es una reserva futura válida
}

// ¿Es de hoy?
if (reserva.esDeHoy) {
  // Destacar en la UI
}

// Color del badge
<Badge variant={reserva.estadoColor}>
  {reserva.estadoLabel}
</Badge>
```

---

## 🔧 Extender para Otros Módulos

Para agregar un nuevo módulo (ej: Barberos):

### 1. Domain Layer

```javascript
// src/domain/entities/Barbero.js
export class Barbero {
  constructor({ id, nombre, email, especialidad }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.especialidad = especialidad;
  }

  estaActivo() {
    return this.activo === true;
  }
}

// src/domain/repositories/IBarberoRepository.js
export class IBarberoRepository {
  async getAll() { throw new Error('Not implemented'); }
  async getById(id) { throw new Error('Not implemented'); }
  // ...
}
```

### 2. Application Layer

```javascript
// src/application/use-cases/barberos/GetBarberos.js
export class GetBarberos {
  constructor(barberoRepository) {
    this.barberoRepository = barberoRepository;
  }

  async execute(filters = {}) {
    return await this.barberoRepository.getAll(filters);
  }
}
```

### 3. Infrastructure Layer

```javascript
// src/infrastructure/repositories/HttpBarberoRepository.js
export class HttpBarberoRepository extends IBarberoRepository {
  constructor(httpClient) {
    super();
    this.httpClient = httpClient;
  }

  async getAll(filters) {
    const data = await this.httpClient.get('/barberos', { params: filters });
    return BarberoMapper.toDomainList(data.barberos);
  }
}

// Registrar en container.js
this.register('barberoRepository', new HttpBarberoRepository(this.get('httpClient')));
```

### 4. Presentation Layer

```javascript
// src/presentation/hooks/useGetBarberos.js
export function useGetBarberos() {
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBarberos = async () => {
    setLoading(true);
    const repository = container.get('barberoRepository');
    const useCase = new GetBarberos(repository);
    const result = await useCase.execute();
    setBarberos(result.map(BarberoMapper.toViewModel));
    setLoading(false);
  };

  return { barberos, loading, fetchBarberos };
}
```

---

## ✅ Beneficios Implementados

1. **Separación de Responsabilidades**: Cada capa tiene un propósito claro
2. **Testabilidad**: Domain y Use Cases son 100% testeables
3. **Independencia de Frameworks**: Lógica de negocio no depende de React
4. **Manejo de Errores Robusto**: Jerarquía de errores centralizada
5. **Reutilización**: Use Cases pueden usarse en múltiples componentes
6. **Mantenibilidad**: Cambios localizados por capa

---

## 🚨 Reglas Importantes

### ❌ NO HACER

```javascript
// ❌ NO llamar axios directamente en componentes
const response = await axios.get('/reservas');

// ❌ NO poner lógica de negocio en componentes
if (reserva.estado === 'RESERVADA' || reserva.estado === 'CONFIRMADA') {
  // ...
}

// ❌ NO mezclar DTOs del backend con la UI
<div>{reserva.nombreCliente}</div> // DTO usa nombreCliente
```

### ✅ HACER

```javascript
// ✅ Usar hooks que encapsulan use cases
const { reservas } = useGetReservas();

// ✅ Usar métodos de negocio de la entidad
if (reserva.puedeSerCancelada) {
  // ...
}

// ✅ Usar ViewModels en la UI
<div>{reserva.clienteNombre}</div> // ViewModel usa clienteNombre
```

---

## 📝 Próximos Pasos

Para completar la migración:

1. Migrar módulo de **Barberos** siguiendo el mismo patrón
2. Migrar módulo de **Servicios**
3. Migrar módulo de **Autenticación**
4. Agregar tests unitarios para domain y use cases
5. Eliminar código legacy de `src/services/`

---

## 🎓 Recursos

- **Entidades**: `src/domain/entities/`
- **Use Cases**: `src/application/use-cases/`
- **Hooks**: `src/presentation/hooks/`
- **Container**: `src/infrastructure/di/container.js`

¡La arquitectura está lista para escalar! 🚀
