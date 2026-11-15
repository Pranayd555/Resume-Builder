# 💰 Refund Calculator System - Complete Documentation

## 📚 Overview

This is a comprehensive refund calculation system designed for the Resume Builder application. It handles token-based refunds across 6 different scenarios, automatically calculating the appropriate refund amount based on token usage and bonus tokens.

---

## 🎯 Quick Summary

**What**: Intelligent refund calculator for AI token purchases  
**Where**: `backend/utils/refundCalculator.js`  
**Why**: Fair refund policy that accounts for token usage and bonus tokens  
**How**: 6 scenarios covering all possible token usage combinations  

---

## 📦 Files Created

### Core Implementation
| File | Purpose | Status |
|------|---------|--------|
| `backend/utils/refundCalculator.js` | Main calculator engine | ✅ Created |
| `backend/utils/refundCalculator.test.js` | Test suite (scenarios, deductions, spending order) | ✅ Created |
| `backend/utils/tokenCalculator.js` | Token balance source of truth (pools, spending, atomic updates) | ✅ Created |
| `backend/utils/tokenCalculator.test.js` | Balance, spending and concurrency tests | ✅ Created |
| `backend/templates/refund-not-eligible.html` | Email template | ✅ Created |
| `backend/utils/emailService.js` | Added method | ✅ Updated |

### Documentation
| File | Content |
|------|---------|
| [`docs/REFUND_TOKEN_DEDUCTION_LOGIC.md`](REFUND_TOKEN_DEDUCTION_LOGIC.md) | Token deduction rules |
| [`docs/REFUND_VISUAL_GUIDE.md`](REFUND_VISUAL_GUIDE.md) | Flowcharts & decision trees |
| `docs/REFUND_SYSTEM_README.md` | This file |

---

## 🪙 Token Pools, Balance and Spending Order

Each user has two pools on the `User` document, kept separate because only one is refundable:

| Field | Pool | Refundable | Filled by |
|-------|------|-----------|-----------|
| `tokens` | Purchased | Yes | Razorpay purchases (the server decides the package from the verified amount) |
| `bonusTokens` | Bonus | No | Signup bonus, feedback / bug-report rewards, admin grants, package bonus |

- **One source of truth:** `backend/utils/tokenCalculator.js`. Every response that reports a balance sends `tokens: { purchased, bonus, total }` (plus the older aliases `balance`, `purchasedTokens`, `bonusTokens`). User objects also carry `tokenBalance`.
- **Spending order: bonus first, then purchased.** Refundable tokens are kept as long as possible, which is why scenario 4 is the usual partial refund.
- **Atomic:** spending, grants, purchases and refund deductions are single MongoDB updates, so concurrent AI calls can't overspend or push a pool below zero. A failed AI action puts its token back into the pool it came from.
- **BYOK** users (own Gemini key) are never charged; their balance is kept for later.
- **Refunds:** the refundable amount depends only on purchased tokens. A large bonus balance never increases a refund, and bonus grants (zero-amount `admin_bonus` transactions) cannot be refunded.

---

## 🎓 The 6 Refund Scenarios

### Scenario 1: No Bonus, All Tokens Unused ✅
```
Condition: No bonus tokens, current balance >= tokens bought
Refund: 100% of payment
Example: Paid ₹1000, haven't used any tokens → Full ₹1000 refund
```

### Scenario 2: No Bonus, Some Tokens Used ✅
```
Condition: No bonus tokens, current balance < tokens bought
Refund: (Payment ÷ Tokens Bought) × Current Tokens
Example: Paid ₹1000 for 100 tokens, used 70, have 30 left → ₹300 refund
```

### Scenario 3: With Bonus, All Tokens Unused ✅
```
Condition: Bonus added, current balance >= all tokens (bought + bonus)
Refund: 100% of payment
Example: Paid ₹1000, got 50 bonus, haven't used anything → Full ₹1000 refund
```

### Scenario 4: With Bonus, Bonus Used, Purchased Intact ✅
```
Condition: Some bonus used, but all purchased tokens still available
Refund: Deduct value of bonus used from full refund
Example: Paid ₹1000 for 100 + 50 bonus, used 30 bonus → ₹700 refund (70%)
```

### Scenario 5A: Both Used, Below Threshold ❌
```
Condition: Both regular and bonus tokens used, <1 token value left
Refund: None (not eligible)
Action: Send not-eligible notification email
Example: Used so many tokens that calculated refund < 1 token
```

### Scenario 5B: Both Used, At/Above Threshold ✅
```
Condition: Both regular and bonus tokens used, but >=1 token value remains
Refund: (Payment ÷ Tokens Bought) × Effective Tokens
Example: Paid ₹1000 for 100 + 50 bonus, effective remaining = 15 → ₹150 refund (15%)
```

### Scenario 6: Purchased Used, Bonus Still Covered ✅
```
Condition: Some purchased tokens used, but the bonus pool still holds at least
           this purchase's bonus (e.g. a feedback bonus granted later)
Refund: (Payment ÷ Tokens Bought) × Current Purchased Tokens (not eligible if 0)
Example: Paid ₹1000 for 100 + 50 bonus, 40 purchased + 60 bonus left → ₹400 refund (40%)
```

---

## 🚀 Quick Start Guide

### 1. Import the Calculator
```javascript
const RefundCalculator = require('../utils/refundCalculator');
```

### 2. Prepare Data
```javascript
const transaction = {
  transactionId: 'txn_123456',
  amount: 100000, // in paise
  metadata: {
    boughtTokens: 100,
    bonusTokensAdded: 50
  }
};

const userState = {
  tokens: 60,      // current regular tokens
  bonusTokens: 5   // current bonus tokens
};
```

### 3. Calculate Refund
```javascript
const result = RefundCalculator.calculateRefund(
  transaction,
  userState,
  transaction.amount
);
```

### 4. Check Result
```javascript
console.log(result);
// {
//   scenario: 5,
//   refundAmount: 15000,        // in paise (₹150)
//   refundPercentage: 15,
//   status: 'eligible',
//   message: 'Partial refund approved...'
// }
```

### 5. Handle Based on Status
```javascript
if (result.status === 'eligible') {
  // Process refund with Razorpay
} else if (result.status === 'not_eligible') {
  // Send not-eligible email
}
```

---

## 💻 Integration with Payment Routes

### When Accepting Token Purchase
```javascript
// Ensure you capture:
const transaction = {
  transactionId: refund.id,
  orderId: orderId,
  amount: totalAmount, // in paise
  paymentId: paymentResponse.id,
  status: 'captured',
  createdAt: new Date(),
  
  // CRITICAL: Include token information
  metadata: {
    boughtTokens: tokensCount,
    bonusTokensAdded: bonusTokensGiven
  }
};

await user.addRazorpayTransaction(transaction);
```

### When Processing Refund Request
```javascript
const RefundCalculator = require('../utils/refundCalculator');
const emailService = require('../utils/emailService');

// Get user and transaction
const user = await User.findById(req.user.id);
const transaction = user.getTransactionById(transactionId);

// Calculate refund from the sanitized pools (utils/tokenCalculator.js)
const { purchased, bonus } = toTokenBalance(user);
const refundResult = RefundCalculator.calculateRefund(
  transaction,
  { tokens: purchased, bonusTokens: bonus },
  transaction.amount
);

// Process eligible refunds
if (refundResult.status === 'eligible') {
  const refund = await razorpay.payments.refund(transaction.paymentId, {
    amount: refundResult.refundAmount,
    notes: {
      scenario: refundResult.scenario,
      refundPercentage: refundResult.refundPercentage
    }
  });

  await user.updateTransactionStatus(transactionId, 'refunded', {
    refundId: refund.id,
    refundAmount: refundResult.refundAmount
  });

  // Remove the refunded tokens atomically (see REFUND_TOKEN_DEDUCTION_LOGIC.md)
  await deductTokens(user._id, RefundCalculator.getTokenDeduction(refundResult));

  // Send completion email
  await emailService.sendRefundCompletionEmail({
    email: user.email,
    name: user.firstName,
    refundAmount: RefundCalculator.paiseToRupees(refundResult.refundAmount),
    transactionId
  });

// Handle not-eligible refunds
} else if (refundResult.status === 'not_eligible') {
  await user.updateTransactionStatus(transactionId, 'refund_rejected', {
    refundStatus: 'rejected',
    refundReason: refundResult.message
  });

  // Send not-eligible email
  await emailService.sendRefundNotEligibleEmail({
    email: user.email,
    name: user.firstName,
    transactionId: transaction.transactionId,
    orderId: transaction.orderId,
    amountPaid: transaction.amount,
    refundReason: refundResult.message,
    boughtTokens: refundResult.boughtTokens,
    bonusTokensAdded: refundResult.bonusTokensAdded,
    currentTokenBalance: refundResult.currentTokens,
    totalAvailable: Math.max(0, refundResult.currentTokens - refundResult.bonusTokensAdded)
  });
}
```

---

## 🧪 Running Tests

```bash
# From backend directory: refund scenarios + token balance tests
npm test

# Include the database tests (atomic spending, concurrency, middleware,
# migration) against a throwaway MongoDB, e.g. the root docker-compose one:
TOKEN_TEST_MONGODB_URI=mongodb://127.0.0.1:27017/token-test npm test
```

Expected output: every refund check passes (`❌ Failed: 0`) and `node --test` reports `fail 0`. CI runs both, with a MongoDB service for the database tests.

---

## 📊 API Reference

### RefundCalculator.calculateRefund()

**Parameters:**
- `transaction` (Object): Transaction object with metadata
- `userState` (Object): Current user state `{ tokens, bonusTokens }`
- `paidAmount` (Number): Amount paid in paise

**Returns:**
```javascript
{
  scenario: 1-6,                    // Which scenario applies (undefined on error)
  refundAmount: number,             // Refund in paise
  refundPercentage: number,         // Refund as percentage (0-100)
  message: string,                  // User-friendly description
  status: 'eligible'|'not_eligible'|'error',
  paid: number,
  currentTokens: number,
  currentBonusTokens: number,
  boughtTokens: number,
  bonusTokensAdded: number
}
```

### RefundCalculator.getTokenDeduction(refundResult)
Tokens to remove after an approved refund, per scenario
```javascript
RefundCalculator.getTokenDeduction(result); // e.g. { purchased: 40, bonus: 50 }
```

### RefundCalculator.isPurchaseTransaction(transaction)
True only for a paid purchase (amount > 0, boughtTokens >= 1, not an admin bonus)

### RefundCalculator.paiseToRupees(paise)
Converts paise to rupees for display
```javascript
RefundCalculator.paiseToRupees(100000); // "1000.00"
```

### RefundCalculator.rupeesToPaise(rupees)
Converts rupees to paise for Razorpay
```javascript
RefundCalculator.rupeesToPaise(1000); // 100000
```

### RefundCalculator.getRefundEligibilitySummary()
Quick eligibility check without detailed data
```javascript
const summary = RefundCalculator.getRefundEligibilitySummary(transaction, userState);
// { eligible, scenario, refundAmount, refundPercentage, message, reason }
```

---

## 🔐 Security & Validation

### Automatic Checks ✅
- Refund amount never exceeds paid amount
- Minimum token threshold (< 1 token = not eligible)
- Invalid transaction data handled gracefully
- All errors logged for debugging

### Manual Checks (Admin)
- Verify transaction within 7-day window
- Confirm payment status is 'captured'
- Check user email is verified

### Email Compliance
- All refund decisions logged
- Email notifications sent with full details
- Transaction history maintained
- Support contact info provided

---

## 📝 Key Formulas

### Scenario 2: Partial Refund (No Bonus)
```
Refund = (Paid Amount ÷ Tokens Bought) × Current Tokens
```

### Scenario 4: Partial Refund (Bonus Used)
```
Bonus Used = Bonus Added - Current Bonus
Effective Tokens = Tokens Bought - Bonus Used
Refund = (Paid Amount ÷ Tokens Bought) × Effective Tokens
```

### Scenario 5B: Partial Refund (Both Used)
```
Bonus Used = Bonus Added - Current Bonus
Effective Tokens = Current Tokens - Bonus Used
Refund = (Paid Amount ÷ Tokens Bought) × Effective Tokens
```

---

## 🧩 Implementation Checklist

Ready to integrate? Follow these steps:

- [ ] Review all scenarios in detail
- [ ] Run test suite to verify logic
- [ ] Update `backend/routes/payment.js` with RefundCalculator imports
- [ ] Add transaction metadata collection
- [ ] Test with sample scenarios
- [ ] Deploy to staging
- [ ] Run end-to-end testing
- [ ] Deploy to production
- [ ] Monitor refund calculations
- [ ] Update user-facing documentation

---

## 🐛 Troubleshooting

### Issue: "Invalid transaction: tokens bought not found"
**Cause**: Transaction metadata missing `boughtTokens`  
**Fix**: Ensure all new transactions store `metadata.boughtTokens`

### Issue: Refund amount unexpected
**Cause**: Bonus calculation error  
**Fix**: Verify `bonusUsed = bonusAdded - currentBonus` logic

### Issue: Email not sending
**Cause**: Email service not configured  
**Fix**: Check email service initialization in `.env`

### Issue: Calculator returning 'error' status
**Cause**: Invalid input data  
**Fix**: Validate transaction and userState objects before calling

---

## 📈 Monitoring & Analytics

Recommended metrics to track:
- Total refunds processed per scenario
- Average refund percentage
- Not-eligible refund requests
- Refund request to completion time
- User satisfaction with refund decisions

---

## 🔄 Future Enhancements

Potential improvements:
1. Time-based refund discounts (reduce % after X days)
2. Usage-based calculations (track actual AI actions)
3. Partial token refunds (instead of just rupees)
4. Subscription tier variations
5. Admin override capabilities
6. Bulk refund processing
7. Refund analytics dashboard

---

## 📞 Support & Questions

### Documentation Files
- **Token Deduction Rules**: [REFUND_TOKEN_DEDUCTION_LOGIC.md](REFUND_TOKEN_DEDUCTION_LOGIC.md)
- **Visual Guide**: [REFUND_VISUAL_GUIDE.md](REFUND_VISUAL_GUIDE.md)
- **Test Suite**: `backend/utils/refundCalculator.test.js` (run with `cd backend && npm test`; also runs in CI)

### Code Files
- **Calculator**: `backend/utils/refundCalculator.js`
- **Email Template**: `backend/templates/refund-not-eligible.html`
- **Email Service**: `backend/utils/emailService.js`

---

## 🎓 Understanding the System

### Core Concept
The system recognizes that users might not use all purchased tokens, and should be eligible for refunds. However, if they've used most tokens, a full refund isn't fair. The calculator finds the balance.

### Bonus Complexity
When bonus tokens are involved, we need to understand:
- Bonus tokens increase the user's token pool
- If they use bonus tokens, the effective "paid" portion decreases
- Users should only be refunded for unused **paid** tokens

### Token Value Calculation
- Each refund scenario calculates remaining "unused paid tokens"
- Multiplies this by the per-token cost (payment ÷ tokens bought)
- Ensures refund never exceeds original payment

---

## 📋 Technical Specifications

**Language**: JavaScript (Node.js)  
**Dependencies**: None (standard Node libraries only)  
**Database**: MongoDB (via Mongoose)  
**Currency**: INR (all amounts in paise internally)  
**Precision**: Math.round() for consistency  
**Error Handling**: Graceful with logging  

---

## ✨ Key Strengths

✅ Fair and transparent refund policy  
✅ Accounts for bonus tokens accurately  
✅ Prevents refund fraud (< 1 token threshold)  
✅ Comprehensive documentation  
✅ Full test coverage  
✅ Professional email notifications  
✅ Easy to integrate  
✅ Well-commented code  

---

## 📌 Important Notes

1. **Paise Format**: All calculations use paise internally (₹1 = 100 paise)
2. **Thresholds**: Less than 1 token worth = not eligible
3. **7-Day Policy**: Refunds valid within 7 days (admin enforces)
4. **Email Logging**: All notifications logged for compliance
5. **Rounding**: Math.round() ensures consistency
6. **Metadata Critical**: Transaction metadata must include token counts

---

## 🎯 Success Criteria

✅ System correctly calculates all 6 scenarios (scenario 6 added November 2026; it used to throw)  
✅ Test suite passes 100%  
✅ No refund exceeds paid amount  
✅ Emails sent appropriately  
✅ Database transactions maintained  
✅ User experience improved  
✅ Support tickets reduced  

---

## 📄 Version History

**Version 1.0** - October 31, 2025
- Initial implementation
- All 6 scenarios implemented
- Comprehensive testing
- Full documentation
- Ready for integration

---

## 📞 Contact & Support

For implementation questions or issues:
1. Review documentation files
2. Check test suite for examples
3. Review code comments
4. Contact the team at presmistique@gmail.com

---

**Status**: ✅ Ready for Integration  
**Last Updated**: October 31, 2025  
**Maintained By**: Development Team  

---

Thank you for using the Refund Calculator System! 🚀
