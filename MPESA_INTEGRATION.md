# M-PESA Payment Integration - Updated for Multi-Tenant

## Overview

The SchoolPayERP M-PESA integration has been updated to support the multi-tenant architecture while maintaining compatibility with Safaricom's C2B (Customer to Business) payment callbacks.

## API Endpoints

### Public Endpoints (Safaricom Callbacks)

These endpoints are called by Safaricom and do NOT require authentication:

#### 1. Validation Endpoint
```
POST /api/payments/validation
POST /api/mpesa/validation
```

**Purpose:** Safaricom calls this before processing payment to ask "Should I process this?"

**Response:** Always returns success to accept payments
```json
{
  "ResultCode": 0,
  "ResultDesc": "Accepted"
}
```

#### 2. Confirmation Endpoint
```
POST /api/payments/confirmation
POST /api/mpesa/confirmation
```

**Purpose:** Safaricom sends actual payment data after successful transaction

**Request Body (from Safaricom):**
```json
{
  "TransID": "OEI2AK4Q16",
  "TransTime": "20210325085133",
  "TransAmount": "5000.00",
  "BillRefNumber": "ADM001",
  "MSISDN": "254712345678",
  "FirstName": "JOHN DOE"
}
```

**Multi-Tenant Handling:**
- Searches for student across ALL schools by admission number
- Links transaction to student's school automatically
- Creates PENDING transaction if student not found (Suspense Account)
- Updates student balance if student found
- Emits real-time socket events

### Protected Endpoints

#### 3. Register M-PESA URLs
```
POST /api/payments/register
POST /api/mpesa/register
```

**Authentication:** Required (Bearer token)

**Purpose:** Register callback URLs with Safaricom Daraja API

**Note:** Currently a placeholder for future auto-registration

#### 4. Record Bank Payment
```
POST /api/payments/bank
```

**Authentication:** Required (Bearer token + Tenant validation)

**Request Body:**
```json
{
  "transactionId": "BNK123456",
  "amount": 15000,
  "reference": "ADM001",
  "source": "BANK_TRANSFER",
  "paidBy": "Jane Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bank payment recorded successfully",
  "data": {
    "_id": "...",
    "school": "...",
    "transactionId": "BNK123456",
    "amount": 15000,
    "student": {
      "admissionNumber": "ADM001",
      "name": "John Doe",
      "classLevel": "Grade 10"
    }
  }
}
```

#### 5. Record Cash Payment
```
POST /api/payments/cash
```

**Authentication:** Required (Bearer token + Tenant validation)

**Request Body:**
```json
{
  "amount": 5000,
  "reference": "ADM001",
  "receiptNumber": "RCP001",
  "paidBy": "Jane Doe"
}
```

#### 6. Get Payment Statistics
```
GET /api/payments/stats?startDate=2026-01-01&endDate=2026-12-31
```

**Authentication:** Required (Bearer token + Tenant validation)

**Response:**
```json
{
  "success": true,
  "school": "Demo Secondary School",
  "data": {
    "bySource": [
      {
        "_id": "MPESA",
        "totalAmount": 150000,
        "count": 30
      },
      {
        "_id": "BANK_TRANSFER",
        "totalAmount": 75000,
        "count": 5
      }
    ],
    "totalRevenue": 225000,
    "period": {
      "startDate": "2026-01-01",
      "endDate": "2026-12-31"
    }
  }
}
```

## Multi-Tenant Features

### M-PESA Confirmation Handler

1. **Student Lookup:** Searches across all schools (payment can come from any school)
2. **School Auto-Detection:** Uses student's school reference when found
3. **Transaction Scoping:** Each transaction linked to specific school
4. **Balance Updates:** Only updates student in their own school
5. **Suspense Handling:** Creates unlinked transaction if student not found

### Manual Payments (Bank/Cash)

1. **School Filtering:** Only searches for students within user's school
2. **Duplicate Prevention:** Checks transaction ID uniqueness per school
3. **Audit Trail:** Records which user created the transaction
4. **Real-time Updates:** Emits socket events for instant dashboard updates

### Payment Statistics

1. **School-Scoped:** Only shows payments for user's school
2. **Date Filtering:** Optional date range filtering
3. **Source Breakdown:** Groups by payment method (M-PESA, Bank, Cash)
4. **Revenue Tracking:** Total revenue calculation

## Server Configuration

### Route Mounting

The payment routes are mounted on TWO paths for flexibility:

```javascript
// backend/server.js
app.use('/api/payments', paymentRoutes);  // Standard payments endpoint
app.use('/api/mpesa', paymentRoutes);     // M-PESA specific endpoint
```

**Callback URLs for Safaricom:**
- Validation: `https://yourdomain.com/api/mpesa/validation`
- Confirmation: `https://yourdomain.com/api/mpesa/confirmation`

### Middleware Chain

```javascript
// Public endpoints (no auth)
router.post('/validation', mpesaValidation);
router.post('/confirmation', mpesaConfirmation);

// Admin endpoint (auth only)
router.post('/register', protect, mpesaRegisterUrl);

// Manual payments (auth + tenant validation)
router.use(protect, tenantMiddleware);
router.post('/bank', recordBankPayment);
router.post('/cash', recordCashPayment);
router.get('/stats', getPaymentStats);
```

## Transaction Model Updates

All transactions now include:

```javascript
{
  school: ObjectId,          // REQUIRED (or null for suspense)
  transactionId: String,     // Unique per school
  student: ObjectId,         // Can be null (suspense)
  amount: Number,
  source: Enum,              // MPESA, BANK_TRANSFER, CASH, etc.
  status: Enum,              // COMPLETED, PENDING
  paidBy: String,            // Name of payer
  phoneNumber: String,       // M-PESA phone number
  metadata: Object           // Full callback data
}
```

## Real-time Updates

### Socket Events Emitted

#### 1. payment_received
Emitted when M-PESA payment is successfully matched to a student:

```javascript
io.emit('payment_received', {
  id: transaction._id,
  studentName: "John Doe",
  admissionNumber: "ADM001",
  amount: 5000,
  source: "MPESA",
  time: "10:30:45",
  status: "COMPLETED"
});
```

#### 2. unknown_payment
Emitted when M-PESA payment cannot be matched to any student:

```javascript
io.emit('unknown_payment', {
  id: transaction._id,
  reference: "ADM999",
  amount: 5000,
  source: "MPESA",
  time: "10:30:45"
});
```

## Testing the Integration

### 1. Test M-PESA Callback (Simulation)

```bash
curl -X POST http://localhost:5000/api/mpesa/confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "TransID": "TEST123456",
    "TransTime": "20260117100000",
    "TransAmount": "5000",
    "BillRefNumber": "ADM001",
    "MSISDN": "254712345678",
    "FirstName": "JOHN DOE"
  }'
```

### 2. Record Bank Payment

```bash
curl -X POST http://localhost:5000/api/payments/bank \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "BNK123456",
    "amount": 15000,
    "reference": "ADM001",
    "paidBy": "Jane Doe"
  }'
```

### 3. Get Payment Stats

```bash
curl -X GET "http://localhost:5000/api/payments/stats?startDate=2026-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Production Checklist

### Safaricom Daraja Setup

1. [ ] Register for Daraja API account
2. [ ] Obtain Consumer Key and Consumer Secret
3. [ ] Configure paybill number in School model
4. [ ] Set up callback URLs in Safaricom portal
5. [ ] Test with small amounts first
6. [ ] Monitor callback logs

### Environment Variables

```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_paybill_number
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/confirmation
```

### Security Considerations

1. **IP Whitelisting:** Only accept callbacks from Safaricom IPs
2. **HTTPS Required:** All callback URLs must use HTTPS
3. **Idempotency:** Duplicate transaction prevention implemented
4. **Audit Trail:** All callbacks logged in metadata field
5. **Error Handling:** Always return 200 to Safaricom to prevent retries

### Monitoring

1. **Failed Callbacks:** Check for PENDING transactions without students
2. **Duplicate Detection:** Monitor duplicate transaction logs
3. **Balance Accuracy:** Regular reconciliation of student balances
4. **SMS Delivery:** Track SMS notification success rates
5. **Socket Events:** Monitor real-time event delivery

## Troubleshooting

### M-PESA Callback Not Received

1. Check firewall/network allows incoming connections
2. Verify callback URL is accessible from internet
3. Ensure HTTPS is properly configured
4. Check Safaricom Daraja portal configuration
5. Review server logs for incoming requests

### Student Not Found

1. Verify admission number format matches exactly
2. Check for extra spaces in BillRefNumber
3. Ensure student exists in database
4. Review case sensitivity (code converts to uppercase)
5. Check transaction created in PENDING status

### Duplicate Transaction Error

1. This is expected behavior for retries
2. Check logs for "Duplicate transaction ignored"
3. Transaction will not be processed twice
4. Safaricom receives success response

### Balance Not Updated

1. Verify student was found successfully
2. Check transaction status is COMPLETED
3. Review student.save() for errors
4. Ensure proper amount parsing (parseFloat)
5. Check for database connection issues

## Future Enhancements

1. **SMS Notifications:** Integrate Africa's Talking for receipts
2. **Auto-Registration:** Implement automatic URL registration with Daraja
3. **Reconciliation:** Daily M-PESA transaction reconciliation
4. **Reversal Handling:** Support for M-PESA reversals
5. **Multi-Currency:** Support for different currencies per school
6. **Payment Plans:** Installment payment tracking
7. **Refunds:** Automated refund processing

## Support

For M-PESA integration issues:
- Safaricom Daraja: https://developer.safaricom.co.ke
- Documentation: See MULTI_TENANT_ARCHITECTURE.md
- API Testing: See API_TESTING_GUIDE.md

---

**The M-PESA integration is now fully compatible with the multi-tenant architecture!**
