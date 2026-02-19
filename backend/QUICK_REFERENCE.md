# Hexagonal Architecture - Quick Reference

## 🚀 Quick Start

### Using the New Architecture

```javascript
// 1. Import the container
const container = require('../shared/Container');

// 2. Get the use case
const useCase = container.createReservaUseCase;

// 3. Execute
const result = await useCase.execute(data);
```

## 📁 File Locations

### Domain Layer (Business Logic)
```
src/domain/
├── entities/           # Reserva, Servicio, Cliente
├── value-objects/      # Email, Money, TimeSlot, PhoneNumber
├── repositories/       # IReservaRepository, IServicioRepository
└── services/          # AvailabilityService, PricingService
```

### Application Layer (Use Cases)
```
src/application/
└── use-cases/
    ├── reservas/      # CreateReserva, CancelReserva, etc.
    └── servicios/     # CreateServicio, UpdateServicio, etc.
```

### Infrastructure Layer (Adapters)
```
src/infrastructure/
└── database/
    └── mongodb/
        ├── models/        # All Mongoose schemas
        └── repositories/  # MongoReservaRepository, etc.
```

### Shared Layer
```
src/shared/
├── Container.js       # Dependency injection
└── errors/
    └── DomainErrors.js
```

## 🎯 Common Patterns

### Creating a New Use Case

```javascript
// 1. Create use case file
class MyUseCase {
  constructor(repository, service) {
    this.repository = repository;
    this.service = service;
  }

  async execute(dto) {
    // 1. Validate
    // 2. Create domain entity
    // 3. Persist
    // 4. Return result
  }
}

// 2. Add to Container.js
get myUseCaseUseCase() {
  return new MyUseCase(
    this.myRepository,
    this.myService
  );
}

// 3. Use in controller
const useCase = container.myUseCaseUseCase;
const result = await useCase.execute(data);
```

### Creating a New Entity

```javascript
class MyEntity {
  constructor({ id, name, ...props }) {
    this.id = id;
    this.name = name;
    // ...
    this.validate();
  }

  validate() {
    if (!this.name) {
      throw new Error('Name is required');
    }
  }

  // Business methods
  doSomething() {
    // Business logic here
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      // ...
    };
  }
}
```

### Creating a Repository

```javascript
// 1. Define interface
class IMyRepository {
  async save(entity) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
}

// 2. Implement for MongoDB
class MongoMyRepository extends IMyRepository {
  async save(entity) {
    const doc = await MyModel.create(this.toMongoDocument(entity));
    return this.toDomain(doc);
  }

  toDomain(mongoDoc) {
    return new MyEntity({
      id: mongoDoc._id.toString(),
      name: mongoDoc.name,
      // ...
    });
  }

  toMongoDocument(entity) {
    return {
      name: entity.name,
      // ...
    };
  }
}
```

## 🔍 Where to Put Code

### Business Rules → Domain Entity
```javascript
// ✅ Good
class Reserva {
  cancel() {
    if (this.estado === 'COMPLETADA') {
      throw new Error('Cannot cancel completed');
    }
    this.estado = 'CANCELADA';
  }
}

// ❌ Bad (in controller)
if (reserva.estado === 'COMPLETADA') {
  return res.status(400).json({...});
}
```

### Orchestration → Use Case
```javascript
// ✅ Good
class CreateReserva {
  async execute(dto) {
    // Check availability
    // Create entity
    // Save
    // Send email
  }
}

// ❌ Bad (in controller)
const available = await checkAvailability();
const reserva = new Reserva();
await reserva.save();
await sendEmail();
```

### Data Access → Repository
```javascript
// ✅ Good
class MongoReservaRepository {
  async findByBarberoAndDate(barberoId, fecha) {
    const docs = await ReservaModel.find({...});
    return docs.map(d => this.toDomain(d));
  }
}

// ❌ Bad (in use case)
const reservas = await ReservaModel.find({...});
```

### HTTP Concerns → Controller
```javascript
// ✅ Good
exports.crearReserva = async (req, res, next) => {
  try {
    const useCase = container.createReservaUseCase;
    const result = await useCase.execute(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// ❌ Bad (business logic in controller)
exports.crearReserva = async (req, res) => {
  // Validation
  // Business logic
  // Database access
  // Email
  // Response
};
```

## 🧪 Testing Patterns

### Test Domain Entity
```javascript
describe('Reserva', () => {
  it('should enforce business rules', () => {
    const reserva = new Reserva({...});
    reserva.complete();
    
    expect(() => reserva.cancel()).toThrow();
  });
});
```

### Test Use Case
```javascript
describe('CreateReserva', () => {
  it('should create when available', async () => {
    const mockRepo = { save: jest.fn() };
    const mockAvailability = { 
      isTimeSlotAvailable: jest.fn(() => true) 
    };
    
    const useCase = new CreateReserva(mockRepo, mockAvailability);
    await useCase.execute(dto);
    
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

## 📊 Architecture Layers

```
┌─────────────────────────────────────┐
│   Controllers (HTTP Layer)          │  ← Thin, delegates to use cases
├─────────────────────────────────────┤
│   Use Cases (Application)           │  ← Orchestrates domain objects
├─────────────────────────────────────┤
│   Domain (Entities, Services)       │  ← Pure business logic
├─────────────────────────────────────┤
│   Repositories (Infrastructure)     │  ← Database access
└─────────────────────────────────────┘
```

## ✅ Checklist for New Features

- [ ] Create domain entity (if needed)
- [ ] Create value objects (if needed)
- [ ] Define repository interface
- [ ] Implement MongoDB repository
- [ ] Create use case
- [ ] Add use case to Container
- [ ] Create/update controller
- [ ] Write tests
- [ ] Update documentation

## 🎯 Key Principles

1. **Domain layer has NO dependencies** on frameworks
2. **Use cases orchestrate**, don't contain business logic
3. **Controllers are thin**, just HTTP adapters
4. **Repositories hide** database details
5. **Dependency injection** via Container
6. **Test domain logic** without database

## 📚 Documentation

- [ARCHITECTURE.md](file:///c:/Users/Kristian/Desktop/barber-saas/backend/ARCHITECTURE.md) - Full guide
- [implementation_plan.md](file:///C:/Users/Kristian/.gemini/antigravity/brain/165d36fb-3b33-4858-b07c-b2017080adcd/implementation_plan.md) - Detailed plan
- [walkthrough.md](file:///C:/Users/Kristian/.gemini/antigravity/brain/165d36fb-3b33-4858-b07c-b2017080adcd/walkthrough.md) - What was built

## 🚨 Common Mistakes to Avoid

❌ Putting business logic in controllers  
❌ Accessing database directly from use cases  
❌ Making domain entities depend on Mongoose  
❌ Skipping validation in domain layer  
❌ Not using the Container for dependencies  
❌ Testing with real database when mocks would work

## 💡 Pro Tips

✅ Keep controllers under 20 lines  
✅ Use value objects for concepts without identity  
✅ Validate in domain entities, not controllers  
✅ Use dependency injection for everything  
✅ Write tests for domain logic first  
✅ Follow the dependency rule (inner layers don't know about outer layers)
