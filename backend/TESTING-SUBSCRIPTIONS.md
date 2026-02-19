# Testing Manual Subscription Management Backend

## Prerequisites

1. **Server Running**: Make sure the backend server is running on port 4000
2. **SuperAdmin Account**: You need a SuperAdmin user in the database
3. **Barberia ID**: You need a valid barberia ID to test with

## Quick Test with cURL

### 1. Get a SuperAdmin Token

First, login as SuperAdmin to get a JWT token:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-superadmin@email.com",
    "password": "your-password"
  }'
```

Copy the `token` from the response.

### 2. Test Endpoints

Replace `YOUR_TOKEN` and `BARBERIA_ID` with your actual values:

#### Change Plan
```bash
curl -X POST http://localhost:4000/api/superadmin/subscriptions/BARBERIA_ID/change-plan \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPlan": "BASIC",
    "reason": "Cliente pagó plan básico"
  }'
```

#### Extend Period
```bash
curl -X POST http://localhost:4000/api/superadmin/subscriptions/BARBERIA_ID/extend \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "months": 3,
    "reason": "Promoción especial"
  }'
```

#### Record Payment
```bash
curl -X POST http://localhost:4000/api/superadmin/subscriptions/BARBERIA_ID/record-payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 15000,
    "concept": "Pago plan BASIC - Transferencia",
    "metadata": {
      "paymentMethod": "Transferencia",
      "bank": "Banco de Chile"
    }
  }'
```

#### Activate Subscription
```bash
curl -X POST http://localhost:4000/api/superadmin/subscriptions/BARBERIA_ID/activate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Pago confirmado"
  }'
```

#### Deactivate Subscription
```bash
curl -X POST http://localhost:4000/api/superadmin/subscriptions/BARBERIA_ID/deactivate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Cliente solicitó cancelación"
  }'
```

#### Get History
```bash
curl -X GET http://localhost:4000/api/superadmin/subscriptions/BARBERIA_ID/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Using the Test Script

1. Update `test-subscription-manual.js`:
   - Set `testBarberiaId` to a real barberia ID
   - Set `AUTH_TOKEN` to your SuperAdmin JWT token

2. Run the script:
```bash
node test-subscription-manual.js
```

## Using Thunder Client / Postman

1. Import the following collection:

**Base URL**: `http://localhost:4000/api`

**Headers** (for all requests):
- `Authorization`: `Bearer YOUR_TOKEN`
- `Content-Type`: `application/json`

**Endpoints**:

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/superadmin/subscriptions/:barberiaId/change-plan` | `{ "newPlan": "BASIC", "reason": "..." }` |
| POST | `/superadmin/subscriptions/:barberiaId/extend` | `{ "months": 3, "reason": "..." }` |
| POST | `/superadmin/subscriptions/:barberiaId/activate` | `{ "reason": "..." }` |
| POST | `/superadmin/subscriptions/:barberiaId/deactivate` | `{ "reason": "..." }` |
| POST | `/superadmin/subscriptions/:barberiaId/record-payment` | `{ "amount": 15000, "concept": "...", "metadata": {} }` |
| GET | `/superadmin/subscriptions/:barberiaId/history` | - |

## Expected Responses

### Success Response
```json
{
  "message": "Plan changed successfully",
  "subscription": {
    "id": "...",
    "barberiaId": "...",
    "plan": "BASIC",
    "status": "ACTIVE",
    "paymentMethod": "MANUAL",
    "manualPayments": [...],
    "changeHistory": [...]
  }
}
```

### Error Response
```json
{
  "error": "Subscription not found"
}
```

## Verification Checklist

- [ ] Server starts without errors
- [ ] Can login as SuperAdmin
- [ ] Can change plan (FREE → BASIC → PRO)
- [ ] Can extend period (adds months correctly)
- [ ] Can record payment (appears in manualPayments array)
- [ ] Can activate subscription (status changes to ACTIVE)
- [ ] Can deactivate subscription (status changes to CANCELED)
- [ ] Can get history (shows all changes and payments)
- [ ] Changes are recorded in changeHistory
- [ ] Barberia model is synced automatically

## Common Issues

### "Subscription not found"
- Make sure the barberiaId exists in your database
- Check that the barberia has a subscription record

### "Unauthorized" / 401
- Token might be expired
- Make sure you're using a SuperAdmin account
- Check that the Authorization header is correct

### "Invalid plan"
- Plan must be one of: 'FREE', 'BASIC', 'PRO'
- Check for typos (case-sensitive)

### "Months must be positive"
- Months parameter must be > 0
- Check the request body format
