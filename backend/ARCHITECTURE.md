# Hexagonal Architecture - Barber SaaS Backend

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture Layers](#architecture-layers)
- [Directory Structure](#directory-structure)
- [Key Concepts](#key-concepts)
- [Usage Examples](#usage-examples)
- [Migration Guide](#migration-guide)
- [Testing](#testing)
- [Best Practices](#best-practices)

## Overview

This project implements **Hexagonal Architecture** (also known as Ports & Adapters) combined with **Domain-Driven Design (DDD)** principles.

### Why Hexagonal Architecture?

✅ **Testability**: Business logic can be tested without database or HTTP  
✅ **Maintainability**: Clear separation of concerns  
✅ **Flexibility**: Easy to swap implementations (MongoDB → PostgreSQL)  
✅ **Scalability**: Independent layers can evolve separately  
✅ **Team Collaboration**: Clear boundaries for different developers

## Architecture Layers

### 1. Domain Layer (`src/domain/`)
**The Core** - Contains pure business logic with zero dependencies on frameworks.

- **Entities**: Business objects with identity (Reserva, Servicio, Cliente)
- **Value Objects**: Immutable objects without identity (Email, Money, TimeSlot)
- **Repository Interfaces**: Contracts for data persistence (IReservaRepository)
- **Domain Services**: Business logic that doesn't belong to a single entity

**Rules:**
- No dependencies on external libraries (except utilities like dayjs)
- No database, HTTP, or framework code
- Pure JavaScript classes

### 2. Application Layer (`src/application/`)
**Use Cases** - Orchestrates domain objects to fulfill business requirements.

- **Use Cases**: Application-specific business flows (CreateReserva, CancelReserva)
- **DTOs**: Data Transfer Objects for input/output

**Rules:**
- Depends only on Domain layer
- No HTTP or database code
- Coordinates domain entities and services

### 3. Infrastructure Layer (`src/infrastructure/`)
**Adapters** - Implements interfaces defined by domain layer.

- **Database**: MongoDB repositories implementing domain interfaces
- **External Services**: Cloudinary, Email, Payments
- **Cache**: Redis adapters

**Rules:**
- Implements domain interfaces
- Contains framework-specific code
- Depends on Domain layer

### 4. Interfaces Layer (`src/interfaces/`)
**Entry Points** - HTTP controllers, routes, middleware.

- **Controllers**: Handle HTTP requests, delegate to use cases
- **Routes**: Define API endpoints
- **Middleware**: Authentication, validation, error handling

**Rules:**
- Thin layer, minimal logic
- Delegates to Application layer
- Handles HTTP concerns only

### 5. Shared Layer (`src/shared/`)
**Common Utilities** - Code shared across layers.

- **Errors**: Custom error classes
- **Utils**: Helper functions
- **Container**: Dependency injection

## Directory Structure

```
src/
├── domain/                    # 🎯 Core Business Logic
│   ├── entities/
│   │   ├── Reserva.js
│   │   ├── Servicio.js
│   │   └── Cliente.js
│   ├── value-objects/
│   │   ├── Email.js
│   │   ├── Money.js
│   │   ├── TimeSlot.js
│   │   └── PhoneNumber.js
│   ├── repositories/          # Interfaces (Ports)
│   │   ├── IReservaRepository.js
│   │   ├── IServicioRepository.js
│   │   └── IClienteRepository.js
│   └── services/
│       ├── AvailabilityService.js
│       └── PricingService.js
│
├── application/               # 🎬 Use Cases
│   ├── use-cases/
│   │   ├── reservas/
│   │   │   ├── CreateReserva.js
│   │   │   ├── CancelReserva.js
│   │   │   ├── CompleteReserva.js
│   │   │   ├── RescheduleReserva.js
│   │   │   └── GetAvailableSlots.js
│   │   └── servicios/
│   │       ├── CreateServicio.js
│   │       ├── UpdateServicio.js
│   │       ├── DeleteServicio.js
│   │       └── ListServicios.js
│   └── dto/
│
├── infrastructure/            # 🔌 Adapters
│   ├── database/
│   │   └── mongodb/
│   │       ├── models/        # Mongoose schemas
│   │       └── repositories/  # Repository implementations
│   │           ├── MongoReservaRepository.js
│   │           ├── MongoServicioRepository.js
│   │           └── MongoClienteRepository.js
│   └── external-services/
│       ├── cloudinary/
│       ├── email/
│       └── payments/
│
├── interfaces/                # 🌐 HTTP Layer
│   └── http/
│       ├── controllers/
│       ├── routes/
│       └── middleware/
│
└── shared/                    # 🛠️ Shared Code
    ├── errors/
    │   └── DomainErrors.js
    ├── utils/
    └── Container.js           # Dependency Injection
```

## Key Concepts

### Value Objects

Immutable objects that represent a concept in your domain:

```javascript
const email = new Email('user@example.com');
const price = new Money(50, 'USD');
const slot = new TimeSlot('2026-02-05', '10:00', 60);

// Immutable - creates new instance
const discountedPrice = price.applyDiscount(10); // 10% off
```

### Entities

Objects with identity and lifecycle:

```javascript
const reserva = new Reserva({
  barberoId: '123',
  emailCliente: 'client@example.com',
  fecha: '2026-02-05',
  hora: '10:00',
  duracion: 60,
  precio: 50
});

// Business logic in entity
reserva.cancel(); // Validates and changes state
reserva.complete(); // Validates and marks as completed
```

### Repository Pattern

Abstraction for data persistence:

```javascript
// Interface (Port)
class IReservaRepository {
  async save(reserva) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
}

// Implementation (Adapter)
class MongoReservaRepository extends IReservaRepository {
  async save(reserva) {
    const doc = await ReservaModel.create(this.toMongoDocument(reserva));
    return this.toDomain(doc);
  }
}
```

### Use Cases

Application-specific business flows:

```javascript
class CreateReserva {
  constructor(reservaRepository, availabilityService, emailService) {
    this.reservaRepository = reservaRepository;
    this.availabilityService = availabilityService;
    this.emailService = emailService;
  }

  async execute(dto) {
    // 1. Validate availability
    const isAvailable = await this.availabilityService.isTimeSlotAvailable(...);
    
    // 2. Create entity
    const reserva = new Reserva(dto);
    
    // 3. Persist
    await this.reservaRepository.save(reserva);
    
    // 4. Send notification
    await this.emailService.sendConfirmation(reserva);
    
    return reserva;
  }
}
```

## Usage Examples

### Creating a Reservation

```javascript
// In controller
const container = require('../shared/Container');

exports.crearReserva = async (req, res, next) => {
  try {
    const useCase = container.createReservaUseCase;
    
    const reserva = await useCase.execute({
      barberoId: req.body.barberoId,
      emailCliente: req.body.emailCliente,
      nombreCliente: req.body.nombreCliente,
      barberiaId: req.user.barberiaId,
      servicioId: req.body.servicioId,
      fecha: req.body.fecha,
      hora: req.body.hora
    });

    res.status(201).json({
      message: 'Reserva creada',
      reserva: reserva.getDetails()
    });
  } catch (error) {
    next(error);
  }
};
```

### Testing Domain Logic

```javascript
// No database needed!
describe('Reserva Entity', () => {
  it('should not allow cancelling completed reservation', () => {
    const reserva = new Reserva({...});
    reserva.complete();
    
    expect(() => reserva.cancel()).toThrow('No se puede cancelar una reserva completada');
  });
});
```

### Testing Use Cases

```javascript
describe('CreateReserva Use Case', () => {
  it('should create reservation when slot is available', async () => {
    // Mock dependencies
    const mockRepo = {
      save: jest.fn().mockResolvedValue(mockReserva)
    };
    const mockAvailability = {
      isTimeSlotAvailable: jest.fn().mockResolvedValue(true)
    };

    const useCase = new CreateReserva(mockRepo, mockAvailability, mockEmail);
    
    const result = await useCase.execute(dto);
    
    expect(mockRepo.save).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
```

## Migration Guide

### Step 1: Identify Business Logic

Find business logic in controllers and move to domain entities or services.

**Before:**
```javascript
// In controller
if (reserva.estado === 'COMPLETADA') {
  return res.status(400).json({ error: 'Cannot cancel' });
}
reserva.estado = 'CANCELADA';
await reserva.save();
```

**After:**
```javascript
// In domain entity
cancel() {
  if (this.estado === 'COMPLETADA') {
    throw new Error('Cannot cancel completed reservation');
  }
  this.estado = 'CANCELADA';
}

// In controller
reserva.cancel();
await repository.update(reserva.id, { estado: reserva.estado });
```

### Step 2: Create Use Cases

Extract controller logic into use cases.

**Before:**
```javascript
exports.crearReserva = async (req, res) => {
  // Validation
  // Business logic
  // Database save
  // Send email
  // Response
};
```

**After:**
```javascript
// Use case
class CreateReserva {
  async execute(dto) {
    // All business logic here
  }
}

// Controller
exports.crearReserva = async (req, res) => {
  const useCase = container.createReservaUseCase;
  const reserva = await useCase.execute(req.body);
  res.json(reserva);
};
```

### Step 3: Use Dependency Injection

Replace direct imports with container:

**Before:**
```javascript
const Reserva = require('../models/Reserva');
const reserva = await Reserva.create(data);
```

**After:**
```javascript
const container = require('../shared/Container');
const useCase = container.createReservaUseCase;
const reserva = await useCase.execute(data);
```

## Testing

### Unit Tests (Domain Layer)

```bash
npm test -- domain/entities/Reserva.test.js
npm test -- domain/value-objects/TimeSlot.test.js
```

### Integration Tests (Use Cases)

```bash
npm test -- application/use-cases/reservas/CreateReserva.test.js
```

### E2E Tests

```bash
npm test -- tests/reservas_atomicas.test.js
```

## Best Practices

### ✅ DO

- Keep domain layer pure (no external dependencies)
- Use value objects for concepts without identity
- Validate in domain entities
- Use dependency injection
- Write tests for domain logic
- Keep controllers thin

### ❌ DON'T

- Put business logic in controllers
- Access database directly from use cases
- Mix HTTP concerns with business logic
- Skip validation in domain layer
- Create god objects
- Bypass the container for dependencies

## Benefits Realized

1. **Testability**: Domain logic tested without database
2. **Maintainability**: Clear separation of concerns
3. **Flexibility**: Easy to swap MongoDB for PostgreSQL
4. **Scalability**: Can extract use cases to microservices
5. **Team Collaboration**: Clear boundaries for developers

## Next Steps

1. Migrate remaining controllers to use cases
2. Add comprehensive test coverage
3. Create more value objects as needed
4. Implement event-driven architecture
5. Add caching layer

---

**Questions?** Check the implementation plan or examples in the codebase.
