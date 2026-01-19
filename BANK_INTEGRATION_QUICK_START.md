# Bank Integration - Quick Start

## 🚀 Implementation Complete!

SchoolPayERP now supports **automatic bank payment recording** from:
- ✅ **Equity Bank** (Jenga API)
- ✅ **KCB Bank** (KCB Open API)  
- ✅ **Co-operative Bank** (Co-op Bank API)

---

## 📋 What Was Added

### 1. School Model Updates
- Added `bankIntegration` field to store bank configuration
- Each school can configure their preferred bank (Equity, KCB, or Co-op)
- Stores API credentials securely

### 2. Bank Service (`backend/services/bankService.js`)
- Handles all three bank APIs
- Token management and caching
- Webhook processing and validation
- Transaction reconciliation

### 3. Payment Controller Updates
- `bankWebhookHandler` - Processes webhooks from banks
- `registerBankWebhook` - Registers callback URL with bank
- `reconcileBankTransactions` - Compares bank vs system records

### 4. New Routes
```
POST /api/payments/bank/webhook/:provider  # Webhook endpoint (public)
POST /api/payments/bank/register/:provider # Register webhook (admin)
GET  /api/payments/bank/reconcile/:provider # Reconciliation (admin)
```

### 5. Real-Time Updates
- Bank payments trigger Socket.io events
- Dashboard updates **instantly** (like M-PESA)
- Same `payment_received` event used

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Get Bank Credentials

**Choose ONE bank per school:**

**Equity Bank:**
- Visit: https://developer.jengaapi.io/
- Get: Consumer Key + Consumer Secret

**KCB Bank:**
- Visit: https://developer.kcbbankgroup.com/
- Get: API Key + API Secret

**Co-op Bank:**
- Visit: https://developer.co-opbank.co.ke/
- Get: Consumer Key + Consumer Secret

### Step 2: Configure School

Update your school's database record:

```javascript
// Example for Equity Bank
db.schools.updateOne(
  { code: "DEMO_SCHOOL" },
  {
    $set: {
      "bankIntegration.enabled": true,
      "bankIntegration.provider": "EQUITY", // or "KCB" or "COOP"
      "bankIntegration.credentials": {
        "consumerKey": "your_consumer_key_here",
        "consumerSecret": "your_consumer_secret_here",
        "accountNumber": "your_bank_account_number",
        "apiKey": "optional_for_some_banks",
        "apiSecret": "optional_for_some_banks"
      }
    }
  }
);
```

### Step 3: Register Webhook

Call the registration endpoint:

```bash
POST http://localhost:5000/api/payments/bank/register/equity
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  School-Id: YOUR_SCHOOL_ID
```

**That's it! 🎉** Your bank will now send payment notifications automatically.

---

## 🔄 How It Works

```
Parent sends money to school bank account
        ↓
Bank receives payment with reference (ADM-001)
        ↓
Bank sends webhook to your server
        ↓
Server validates signature & finds student
        ↓
Transaction created & balance updated
        ↓
Socket.io emits payment_received event
        ↓
Dashboard updates INSTANTLY! ⚡
```

---

## 🧪 Testing Locally

### 1. Use ngrok to expose local server

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 5000

# You'll get: https://abc123.ngrok.io
```

### 2. Simulate a webhook

```bash
# Test Equity Bank payment
curl -X POST http://localhost:5000/api/payments/bank/webhook/equity \
  -H "Content-Type: application/json" \
  -d '{
    "transactionReference": "EQU12345",
    "amount": "1500",
    "accountNumber": "ADM-001",
    "senderName": "John Doe",
    "senderMobile": "254712345678",
    "timestamp": "2026-01-19T10:30:00Z",
    "merchantAccount": "your_account_number"
  }'
```

### 3. Check Dashboard

Open dashboard and watch for:
- 🟢 Live notification banner
- 📊 Transaction appears in list
- 💰 Today's collection updates

---

## 📊 Webhook Format Comparison

### Equity Bank (Jenga API)
```json
{
  "transactionReference": "EQU123456",
  "amount": "1500",
  "accountNumber": "ADM-001",
  "senderName": "John Doe",
  "senderMobile": "254712345678",
  "timestamp": "2026-01-19T10:30:00Z",
  "merchantAccount": "1234567890"
}
```

### KCB Bank
```json
{
  "transaction_reference": "KCB789012",
  "transaction_amount": "2000",
  "account_reference": "ADM-002",
  "sender_name": "Jane Smith",
  "sender_phone": "254723456789",
  "transaction_date": "2026-01-19T11:00:00Z",
  "account_number": "1234567890"
}
```

### Co-op Bank
```json
{
  "TransactionID": "COOP345678",
  "TransAmount": "2500",
  "BillRefNumber": "ADM-003",
  "SenderName": "Alice Johnson",
  "MSISDN": "254734567890",
  "TransTime": "2026-01-19T12:00:00Z",
  "AccountNumber": "1234567890"
}
```

---

## 🔒 Security Features

✅ **Webhook Signature Validation** - HMAC-SHA256  
✅ **School Identification** - Account number matching  
✅ **Duplicate Detection** - Transaction ID checking  
✅ **Suspense Account** - Unknown payments flagged  
✅ **Audit Trail** - Raw payloads stored in metadata

---

## 🎯 Key Features

1. **Multi-Bank Support** - Schools choose their bank
2. **Real-Time Updates** - Socket.io integration
3. **Automatic Recording** - No manual entry needed
4. **Suspense Handling** - Unknown payments tracked
5. **Reconciliation** - Compare bank vs system records
6. **Multi-Tenant** - Each school uses their own bank

---

## 📝 Environment Variables

Add to `.env`:

```bash
# Bank API URLs (update to production when live)
EQUITY_API_URL=https://uat.jengahq.io
KCB_API_URL=https://uat.api.kcbbankgroup.com
COOP_API_URL=https://developer.co-opbank.co.ke:9443

# Your API base URL (for webhook callbacks)
API_BASE_URL=https://api.schoolpay.co.ke
```

---

## 🐛 Troubleshooting

**Payments not appearing?**
1. Check server logs: `tail -f logs/server.log`
2. Verify webhook is registered with bank
3. Test with curl command above
4. Check school's `bankIntegration` configuration

**Socket not updating?**
1. Check if Socket.io is connected (browser console)
2. Verify `req.app.get('io')` returns socket instance
3. Check browser network tab for WebSocket connection

---

## 📚 Documentation

- **Full Guide**: [BANK_INTEGRATION.md](./BANK_INTEGRATION.md)
- **API Testing**: [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)
- **M-PESA Guide**: [MPESA_INTEGRATION.md](./MPESA_INTEGRATION.md)

---

## 🎉 Benefits

Before (Manual):
- ❌ Staff manually enters bank payments
- ❌ Delays in recording (hours/days)
- ❌ Risk of errors
- ❌ No real-time visibility

After (Automatic):
- ✅ Payments recorded automatically
- ✅ Instant dashboard updates (< 1 second)
- ✅ Zero manual entry
- ✅ Real-time visibility for admins

---

## 🚀 Next Steps

1. Choose your bank (Equity, KCB, or Co-op)
2. Get API credentials from bank's developer portal
3. Update school configuration in database
4. Register webhook endpoint
5. Test with real payment
6. Enjoy automatic payment recording! 🎊

---

**Need Help?**
- Full documentation: `BANK_INTEGRATION.md`
- Bank API issues: Contact your bank's developer support
- System issues: Open GitHub issue
