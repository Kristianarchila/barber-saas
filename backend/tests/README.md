# 🧪 Test Suite - Barber SaaS

## Overview

This directory contains the complete test suite for the Barber SaaS application, including unit tests, integration tests, and load tests.

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── use-cases/          # Use case tests
│   │   ├── CreateReserva.test.js
│   │   └── CancelReserva.test.js
│   └── security/           # Security tests
│       └── multi-tenant.test.js
├── integration/            # Integration tests for complete flows
│   └── booking-flow.test.js
├── utils/                  # Test utilities
│   └── testDb.js          # In-memory MongoDB setup
└── setup.js               # Global test setup

```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm test -- CreateReserva.test.js
```

## Test Categories

### ✅ Unit Tests (12 tests)

**CreateReserva Use Case** (5 tests):
- ✅ Create reservation successfully
- ✅ Generate unique tokens
- ❌ Throw error when service not found
- ❌ Throw error when time slot not available
- 🔐 Validate barberiaId matches

**CancelReserva Use Case** (3 tests):
- ✅ Cancel reservation successfully
- ❌ Throw error when reservation not found
- ❌ Throw error when already cancelled

**Multi-Tenant Security** (4 tests):
- 🔐 Only return reservations for specified barberia
- 🔐 Prevent cross-tenant data access
- 🔐 Validate barberiaId on save
- 🔐 Enforce unique index with barberiaId

### 🔗 Integration Tests (5 tests)

**Complete Booking Flow**:
- ✅ Complete flow from creation to confirmation
- ✅ Prevent double booking
- ❌ Reject without authentication
- ❌ Reject for non-existent service
- 🔐 Prevent cross-tenant access

### 📊 Existing Tests (10 tests)

The project already has:
- `multi-tenant-security.test.js` - Additional security tests
- `race-condition-stress.test.js` - Concurrency tests
- `transaction-rollback.test.js` - Transaction tests
- `validation.test.js` - Input validation tests

## Test Coverage Goals

| Category | Goal | Current |
|----------|------|---------|
| Use Cases | 80% | ~60% |
| Repositories | 70% | ~40% |
| Controllers | 60% | ~30% |
| Overall | 70% | ~45% |

## Writing New Tests

### Unit Test Template

```javascript
const { connect, closeDatabase, clearDatabase } = require('../utils/testDb');

describe('YourUseCase', () => {
    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
        jest.clearAllMocks();
    });

    test('should do something', async () => {
        // Arrange
        const input = { /* test data */ };
        
        // Act
        const result = await useCase.execute(input);
        
        // Assert
        expect(result).toBeDefined();
    });
});
```

### Integration Test Template

```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Integration - Feature Name', () => {
    test('should complete flow', async () => {
        const response = await request(app)
            .post('/api/endpoint')
            .set('Authorization', `Bearer ${token}`)
            .send(data)
            .expect(201);

        expect(response.body.success).toBe(true);
    });
});
```

## Mocking

### Email Service
```javascript
jest.mock('../src/notifications/email/email.service');
```

### External APIs
```javascript
jest.mock('../src/infrastructure/external-services/...');
```

## Debugging Tests

### Run with Verbose Output
```bash
npm test -- --verbose
```

### Run Single Test
```bash
npm test -- --testNamePattern="should create reservation"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
    "type": "node",
    "request": "launch",
    "name": "Jest Debug",
    "program": "${workspaceFolder}/node_modules/.bin/jest",
    "args": ["--runInBand", "--no-cache"],
    "console": "integratedTerminal"
}
```

## CI/CD Integration

Tests run automatically on:
- ✅ Every commit (pre-commit hook)
- ✅ Pull requests
- ✅ Before deployment

## Common Issues

### MongoDB Connection
If tests fail to connect:
```bash
# Check MongoDB is running
mongod --version

# Or use in-memory server (automatic)
```

### Timeout Errors
Increase timeout in test file:
```javascript
jest.setTimeout(30000); // 30 seconds
```

### Port Already in Use
Kill existing process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

## Best Practices

1. ✅ **Arrange-Act-Assert** pattern
2. ✅ **One assertion per test** (when possible)
3. ✅ **Descriptive test names** (should do X when Y)
4. ✅ **Clean up after tests** (clearDatabase)
5. ✅ **Mock external services** (email, payments)
6. ✅ **Test edge cases** (null, undefined, empty)
7. ✅ **Test error paths** (not just happy path)

## Next Steps

- [ ] Add E2E tests with Playwright
- [ ] Increase coverage to 70%
- [ ] Add performance benchmarks
- [ ] Add mutation testing
- [ ] Add visual regression tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
