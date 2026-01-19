# Bank Integration Guide

## Overview
SchoolPayERP supports automatic payment recording from three major Kenyan banks:
- **Equity Bank** (Jenga API)
- **KCB Bank** (KCB Open API)
- **Co-operative Bank** (Co-op Bank API)

Each school can choose their preferred bank, and payments will be automatically recorded in real-time via webhook notifications.

## Features
✅ **Automatic Payment Recording** - No manual entry needed
✅ **Real-Time Notifications** - Instant dashboard updates via WebSockets
✅ **Multi-Tenant Support** - Each school uses their own bank account
✅ **Suspense Account** - Unknown payments are flagged for review
✅ **Transaction Reconciliation** - Compare bank records with system records
✅ **Webhook Security** - Signature validation for all webhooks

---

## Bank Setup by Provider

### 1. Equity Bank (Jenga API)

#### Prerequisites
- Active Equity Bank account
- Jenga API developer account: https://developer.jengaapi.io/
- Consumer Key and Consumer Secret from Jenga portal

#### Configuration Steps

1. **Register on Jenga Developer Portal**
   - Visit: https://developer.jengaapi.io/
   - Create account and verify email
   - Create a new application

2. **Get API Credentials**
   - Consumer Key (e.g., `abc123xyz...`)
   - Consumer Secret (e.g., `def456uvw...`)
   - Note your account number

3. **Update School Record in MongoDB**
```javascript
db.schools.updateOne(
  { code: "YOUR_SCHOOL_CODE" },
  {
    $set: {
      "bankIntegration.enabled": true,
      "bankIntegration.provider": "EQUITY",
      "bankIntegration.credentials": {
        "consumerKey": "your_consumer_key",
        "consumerSecret": "your_consumer_secret",
        "accountNumber": "1234567890",
        "apiKey": "optional",
        "apiSecret": "optional"
      }
    }
  }
);
```

4. **Register Webhook via API**
```bash
# Login to your admin account and call:
POST /api/payments/bank/register/equity
Authorization: Bearer YOUR_JWT_TOKEN
School-Id: YOUR_SCHOOL_ID
```

5. **Test Configuration**
   - Make a test payment to your Equity account
   - Reference format: `ADM-001` (admission number)
   - Check dashboard for real-time update

---

### 2. KCB Bank (KCB Open API)

#### Prerequisites
- Active KCB Bank account
- KCB Open API access: https://developer.kcbbankgroup.com/
- API Key and API Secret

#### Configuration Steps

1. **Register on KCB Developer Portal**
   - Visit: https://developer.kcbbankgroup.com/
   - Create account and verify
   - Register your application

2. **Get API Credentials**
   - API Key (Client ID)
   - API Secret (Client Secret)
   - Organization Code (if applicable)

3. **Update School Record**
```javascript
db.schools.updateOne(
  { code: "YOUR_SCHOOL_CODE" },
  {
    $set: {
      "bankIntegration.enabled": true,
      "bankIntegration.provider": "KCB",
      "bankIntegration.credentials": {
        "apiKey": "your_api_key",
        "apiSecret": "your_api_secret",
        "accountNumber": "1234567890",
        "organizationCode": "your_org_code"
      }
    }
  }
);
```

4. **Register Webhook**
```bash
POST /api/payments/bank/register/kcb
Authorization: Bearer YOUR_JWT_TOKEN
School-Id: YOUR_SCHOOL_ID
```

---

### 3. Co-operative Bank (Co-op Bank API)

#### Prerequisites
- Active Co-op Bank account
- Co-op Bank API access: https://developer.co-opbank.co.ke/
- Consumer Key and Consumer Secret

#### Configuration Steps

1. **Register on Co-op Developer Portal**
   - Visit: https://developer.co-opbank.co.ke/
   - Create account and get credentials

2. **Get API Credentials**
   - Consumer Key
   - Consumer Secret
   - Account Number

3. **Update School Record**
```javascript
db.schools.updateOne(
  { code: "YOUR_SCHOOL_CODE" },
  {
    $set: {
      "bankIntegration.enabled": true,
      "bankIntegration.provider": "COOP",
      "bankIntegration.credentials": {
        "consumerKey": "your_consumer_key",
        "consumerSecret": "your_consumer_secret",
        "accountNumber": "1234567890"
      }
    }
  }
);
```

4. **Register Webhook**
```bash
POST /api/payments/bank/register/coop
Authorization: Bearer YOUR_JWT_TOKEN
School-Id: YOUR_SCHOOL_ID
```

---

## How It Works

### Payment Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Parent    │         │     Bank     │         │  SchoolPay  │
│  (Payer)    │         │   (Equity,   │         │   Server    │
│             │         │   KCB, Coop) │         │             │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. Send Money         │                        │
       │ Ref: ADM-001          │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │ 2. Money Received     │                        │
       │<──────────────────────│                        │
       │                       │                        │
       │                       │ 3. Webhook Notification│
       │                       │ (Transaction Details)  │
       │                       │───────────────────────>│
       │                       │                        │
       │                       │                        │ 4. Validate
       │                       │                        │    Signature
       │                       │                        │
       │                       │                        │ 5. Find Student
       │                       │                        │    (ADM-001)
       │                       │                        │
       │                       │                        │ 6. Update Balance
       │                       │                        │
       │                       │ 7. Webhook Response    │
       │                       │<───────────────────────│
       │                       │                        │
       │                       │                        │ 8. Socket Emit
       │                       │                        │    (Real-time)
       │                       │                        │
       │                       │                        ▼
       │                       │                  ┌──────────┐
       │                       │                  │Dashboard │
       │                       │                  │ Updates  │
       │                       │                  │Instantly!│
       │                       │                  └──────────┘
```

### Real-Time Updates

When a bank payment is received:
1. ⚡ Webhook received from bank
2. 🔍 Student identified by admission number
3. 💾 Transaction saved to database
4. 💰 Student balance updated
5. 📡 **Socket.io emits `payment_received` event**
6. 🖥️ **Dashboard updates IMMEDIATELY** (< 1 second)
7. 📱 SMS receipt sent (optional)

---

## API Endpoints

### Webhook Endpoints (Public - No Auth)
```
POST /api/payments/bank/webhook/equity
POST /api/payments/bank/webhook/kcb
POST /api/payments/bank/webhook/coop
```

### Management Endpoints (Protected)
```
POST /api/payments/bank/register/:provider    # Register webhook with bank
GET  /api/payments/bank/reconcile/:provider   # Reconcile transactions
POST /api/payments/bank                       # Manual bank payment entry
```

---

## Payment Reference Format

**CRITICAL**: Parents must enter the student's admission number as the payment reference.

Examples:
- ✅ `ADM-001`
- ✅ `STU-2024-045`
- ✅ `12345`

If the reference doesn't match any student:
- Payment goes to **Suspense Account**
- Admin receives alert via dashboard
- Admin can manually allocate payment later

---

## Testing

### 1. Test Webhook Locally (ngrok)

```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run dev

# In another terminal, expose port 5000
ngrok http 5000

# You'll get a URL like: https://abc123.ngrok.io
# Use this as your webhook URL: https://abc123.ngrok.io/api/payments/bank/webhook/equity
```

### 2. Simulate Bank Webhook

```bash
# Equity Bank format
curl -X POST http://localhost:5000/api/payments/bank/webhook/equity \
  -H "Content-Type: application/json" \
  -H "X-Signature: test_signature" \
  -d '{
    "transactionReference": "EQU123456",
    "amount": "1500",
    "accountNumber": "ADM-001",
    "senderName": "John Doe",
    "senderMobile": "254712345678",
    "timestamp": "2026-01-19T10:30:00Z",
    "merchantAccount": "1234567890"
  }'

# KCB Bank format
curl -X POST http://localhost:5000/api/payments/bank/webhook/kcb \
  -H "Content-Type: application/json" \
  -H "X-Signature: test_signature" \
  -d '{
    "transaction_reference": "KCB789012",
    "transaction_amount": "2000",
    "account_reference": "ADM-002",
    "sender_name": "Jane Smith",
    "sender_phone": "254723456789",
    "transaction_date": "2026-01-19T11:00:00Z",
    "account_number": "1234567890"
  }'

# Co-op Bank format
curl -X POST http://localhost:5000/api/payments/bank/webhook/coop \
  -H "Content-Type: application/json" \
  -H "X-Signature: test_signature" \
  -d '{
    "TransactionID": "COOP345678",
    "TransAmount": "2500",
    "BillRefNumber": "ADM-003",
    "SenderName": "Alice Johnson",
    "MSISDN": "254734567890",
    "TransTime": "2026-01-19T12:00:00Z",
    "AccountNumber": "1234567890"
  }'
```

---

## Reconciliation

Run reconciliation to compare bank records with system records:

```bash
GET /api/payments/bank/reconcile/equity?fromDate=2026-01-01&toDate=2026-01-19
Authorization: Bearer YOUR_JWT_TOKEN
School-Id: YOUR_SCHOOL_ID
```

Response:
```json
{
  "success": true,
  "data": {
    "bankTransactions": 150,
    "systemTransactions": 148,
    "missingTransactions": [
      {
        "transactionReference": "EQU999999",
        "amount": 1000,
        "accountNumber": "UNKNOWN-REF"
      }
    ],
    "dateRange": {
      "from": "2026-01-01",
      "to": "2026-01-19"
    }
  }
}
```

---

## Environment Variables

Add to `.env` file:

```bash
# Bank API URLs (use production URLs in production)
EQUITY_API_URL=https://uat.jengahq.io
KCB_API_URL=https://uat.api.kcbbankgroup.com
COOP_API_URL=https://developer.co-opbank.co.ke:9443

# Your server base URL (for webhooks)
API_BASE_URL=https://api.schoolpay.co.ke
```

---

## Security Considerations

1. **Webhook Signature Validation** ✅
   - All webhooks are validated using HMAC-SHA256
   - Invalid signatures are rejected

2. **HTTPS Only** ✅
   - Webhooks must use HTTPS in production
   - Use ngrok for local testing

3. **Credential Encryption** 🔒
   - Consider encrypting bank credentials in database
   - Use environment variables for sensitive data

4. **Rate Limiting** ⏱️
   - Implement rate limiting on webhook endpoints
   - Prevent abuse and DoS attacks

5. **Audit Logging** 📝
   - All webhook requests are logged
   - Keep raw payloads for dispute resolution

---

## Troubleshooting

### Payments not appearing?

1. **Check webhook registration**
   ```bash
   # Verify in bank's developer portal that webhook is active
   ```

2. **Check server logs**
   ```bash
   tail -f logs/server.log | grep "BANK WEBHOOK"
   ```

3. **Verify credentials**
   ```javascript
   db.schools.findOne({ code: "SCHOOL_CODE" }, { "bankIntegration": 1 })
   ```

4. **Test webhook manually**
   - Use curl or Postman to simulate webhook
   - Check if transaction is created

### Students not found?

- Ensure admission number in payment reference **exactly matches** student record
- Check for spaces, case sensitivity
- Use uppercase for consistency

---

## Support

For bank API issues:
- **Equity Bank**: support@jengahq.io
- **KCB Bank**: developers@kcbbankgroup.com
- **Co-op Bank**: apisupport@co-opbank.co.ke

For SchoolPay issues:
- Create an issue on GitHub
- Email: support@schoolpay.co.ke

---

## Next Steps

1. ✅ Choose your bank (Equity, KCB, or Co-op)
2. ✅ Register for bank's developer program
3. ✅ Get API credentials
4. ✅ Update school configuration
5. ✅ Register webhook
6. ✅ Test with real payment
7. ✅ Monitor dashboard for real-time updates

**Welcome to automatic payment processing! 🎉**
