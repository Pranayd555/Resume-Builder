# Razorpay Payment Integration

## 🚀 Overview

This document describes the complete Razorpay payment integration for the Resume Builder application, including order creation, payment verification, webhook handling, and transaction management.

## 📋 Features Implemented

### ✅ Core Payment Features
- **Order Creation**: Create Razorpay orders for token purchases
- **Payment Verification**: Signature verification for secure payments
- **Transaction Management**: Complete transaction history and tracking
- **Webhook Handling**: Real-time payment event processing
- **Error Handling**: Comprehensive error handling and logging

### ✅ Security Features
- **Signature Verification**: HMAC-SHA256 signature validation
- **Payment Validation**: Cross-verification with Razorpay API
- **Duplicate Prevention**: Protection against duplicate payments
- **Amount Validation**: Payment amount verification

## 🔧 API Endpoints

### 1. Create Payment Order
```http
POST /api/payment/create-order
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 100,
  "currency": "INR",
  "receipt": "optional_receipt_id",
  "metadata": {
    "tokens": 1000,
    "description": "AI Tokens Purchase"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "order_xyz123",
    "amount": 10000,
    "currency": "INR",
    "receipt": "token_purchase_1234567890_user123",
    "status": "created",
    "created_at": 1234567890
  }
}
```

### 2. Complete Payment
```http
POST /api/payment/complete-token-purchase
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "order_id": "order_xyz123",
  "payment_id": "pay_abc456",
  "signature": "razorpay_signature",
  "tokens": 1000,
  "amount": 100,
  "currency": "INR",
  "email": "user@example.com",
  "contact": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token purchase completed successfully",
  "data": {
    "tokens": {
      "added": 1000,
      "current": 1500,
      "totalAvailable": 1500
    },
    "transaction": {
      "id": "pay_abc456",
      "amount": 100,
      "currency": "INR"
    }
  }
}
```

### 3. Get Payment History
```http
GET /api/payment/history
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transactionId": "pay_abc456",
        "orderId": "order_xyz123",
        "amount": 10000,
        "currency": "INR",
        "status": "captured",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "capturedAt": "2024-01-01T00:00:00.000Z",
        "notes": "1000 AI Tokens Purchase"
      }
    ],
    "totalTransactions": 1
  }
}
```

### 4. Get Razorpay Key
```http
GET /api/payment/razorpay-key
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "key": "rzp_test_your_key_id"
}
```

### 5. Verify Payment Signature
```http
POST /api/payment/verify-signature
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "order_id": "order_xyz123",
  "payment_id": "pay_abc456",
  "signature": "razorpay_signature"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true
}
```

### 6. Webhook Endpoint
```http
POST /api/payment/webhook
Content-Type: application/json
X-Razorpay-Signature: webhook_signature

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_abc456",
        "amount": 10000,
        "currency": "INR",
        "status": "captured"
      }
    },
    "order": {
      "entity": {
        "id": "order_xyz123",
        "notes": {
          "userId": "user123",
          "type": "token_purchase"
        }
      }
    }
  }
}
```

## 🔐 Security Implementation

### Signature Verification
```javascript
const crypto = require('crypto');

// Verify payment signature
const body = order_id + '|' + payment_id;
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(body.toString())
  .digest('hex');

if (expectedSignature !== signature) {
  throw new Error('Invalid payment signature');
}
```

### Webhook Signature Verification
```javascript
// Verify webhook signature
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(body)
  .digest('hex');

if (expectedSignature !== signature) {
  throw new Error('Invalid webhook signature');
}
```

## 🗄️ Database Schema

### User Model Transaction Schema
```javascript
razorpayTransactions: [{
  transactionId: String,
  orderId: String,
  amount: Number, // in paise
  currency: String,
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed']
  },
  paymentId: String,
  method: String,
  email: String,
  contact: String,
  createdAt: Date,
  capturedAt: Date,
  refundedAt: Date,
  failedAt: Date,
  notes: String,
  metadata: {
    tokensAdded: Number,
    newTokenBalance: Number,
    type: String,
    razorpaySignature: String,
    webhookProcessed: Boolean
  }
}]
```

## 🌐 Environment Configuration

### Required Environment Variables
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Environment Setup
1. **Development**: Use test keys from Razorpay dashboard
2. **Production**: Use live keys from Razorpay dashboard
3. **Webhook Secret**: Generate from Razorpay dashboard webhook settings

## 🔄 Payment Flow

### 1. Frontend Payment Flow
```javascript
// 1. Create order
const orderResponse = await fetch('/api/payment/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100,
    currency: 'INR',
    metadata: { tokens: 1000 }
  })
});

// 2. Initialize Razorpay
const options = {
  key: orderResponse.data.order.id,
  amount: orderResponse.data.order.amount,
  currency: orderResponse.data.order.currency,
  name: 'Resume Builder',
  description: 'AI Tokens Purchase',
  order_id: orderResponse.data.order.id,
  handler: async function (response) {
    // 3. Complete payment
    const completeResponse = await fetch('/api/payment/complete-token-purchase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: response.razorpay_order_id,
        payment_id: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        tokens: 1000,
        amount: 100,
        currency: 'INR'
      })
    });
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

### 2. Webhook Processing
```javascript
// Webhook events handled:
// - payment.captured: Update transaction status
// - payment.failed: Mark payment as failed
// - order.paid: Additional order processing
```

## 🛡️ Error Handling

### Common Error Scenarios
1. **Invalid Signature**: Payment signature verification fails
2. **Amount Mismatch**: Payment amount doesn't match order amount
3. **Duplicate Payment**: Payment already processed
4. **Payment Not Captured**: Payment status is not captured
5. **User Not Found**: User doesn't exist in database

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 📊 Logging and Monitoring

### Log Events
- Order creation
- Payment completion
- Signature verification
- Webhook processing
- Error scenarios

### Log Format
```javascript
logger.info(`Razorpay order created: ${order.id} for user ${user.email}, amount: ₹${amount}`);
logger.error('Create order error:', error);
```

## 🧪 Testing

### Test Scenarios
1. **Valid Payment**: Complete payment flow with valid signature
2. **Invalid Signature**: Test with invalid signature
3. **Duplicate Payment**: Test duplicate payment prevention
4. **Webhook Events**: Test webhook event processing
5. **Error Handling**: Test various error scenarios

### Test Data
```javascript
// Test order creation
{
  "amount": 100,
  "currency": "INR",
  "metadata": { "tokens": 1000 }
}

// Test payment completion
{
  "order_id": "order_test123",
  "payment_id": "pay_test456",
  "signature": "test_signature",
  "tokens": 1000,
  "amount": 100
}
```

## 🚀 Deployment

### Production Checklist
- [ ] Set up live Razorpay keys
- [ ] Configure webhook URL in Razorpay dashboard
- [ ] Set webhook secret in environment variables
- [ ] Test payment flow in production
- [ ] Monitor webhook events
- [ ] Set up error alerting

### Webhook URL Configuration
```
Production: https://yourdomain.com/api/payment/webhook
Development: https://your-ngrok-url.ngrok.io/api/payment/webhook
```

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Node.js SDK](https://github.com/razorpay/razorpay-node)
- [Webhook Documentation](https://razorpay.com/docs/webhooks/)
- [Payment Integration Guide](https://razorpay.com/docs/payment-gateway/web-integration/standard/)

## 🔧 Maintenance

### Regular Tasks
1. Monitor failed payments
2. Check webhook delivery status
3. Review transaction logs
4. Update Razorpay SDK if needed
5. Test payment flow periodically

### Troubleshooting
1. **Webhook not receiving events**: Check webhook URL and secret
2. **Signature verification fails**: Verify key secret configuration
3. **Payment not completing**: Check Razorpay dashboard for payment status
4. **Database errors**: Check MongoDB connection and user model

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Resume Builder Team
