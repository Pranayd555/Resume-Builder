# Payments

Users buy AI token packs with Razorpay (INR). **1 token = 1 AI action. Tokens never expire and are non-refundable.** Money is refunded only by an admin, after investigating a customer's claim: a duplicate charge, a payment without tokens, or a failure on our side. This is the common model for prepaid AI credits, used by OpenAI, Anthropic and Naukri among others.

The integration follows Razorpay's recommendations: the server creates the order and sets the price, webhooks confirm payments, and crediting is idempotent.

| Piece | File |
|---|---|
| Packs and prices | `backend/config/tokenPacks.js` (the only place prices are defined) |
| Orders, crediting, admin refunds, webhooks, reconcile job | `backend/services/paymentService.js` |
| HTTP routes | `backend/routes/payment.js` |
| Payment records | `backend/models/Payment.js` (collection `payments`) |
| Token pools | `backend/utils/tokenCalculator.js` |
| Checkout page | `resume-builder/src/components/Payment.js` |
| Payment history | `resume-builder/src/components/PaymentHistory.js` (in Analytics) |
| Admin | `resume-builder/src/components/admin/AdminPayments.js` (`/admin/payments`) |
| Tests | `backend/services/paymentService.test.js`, `backend/config/tokenPacks.test.js` |

## Packs

| Pack | Tokens | Price | Per token |
|---|---|---|---|
| `pack_10` | 10 | ₹49 | ₹4.90 |
| `pack_25` | 25 | ₹99 | ₹3.96 |
| `pack_60` (most popular) | 60 | ₹199 | ₹3.32 |
| `pack_200` | 200 | ₹499 | ₹2.50 |

**Why these prices (Nov 2026):**
- **AI cost:** an AI action costs us about ₹0.10 (rewriting a field) to ₹1 (importing a resume, or a tone or keyword pass) on `gemini-3.5-flash-lite`, at $0.30 per 1M input tokens and $2.50 per 1M output tokens. The worst case is about ₹4.
- **Gateway cost:** Razorpay takes about 2.36% (2% + GST) of each payment.
- **Price points:** Indian AI resume tools charge about ₹2 per action, and Western tools $25–50 a month. The totals sit on familiar Indian price points (₹49, ₹99, ₹199, ₹499).
- **Margin:** if a buyer uses the whole pack, the gross margin is still about 70–80%.

The frontend reads the packs from `GET /api/payment/config`. To change a price, edit `tokenPacks.js` only. The Terms say price changes need 30 days' notice.

## Buying

```
browser                         API                                Razorpay
  | POST /orders {packId}  ---->  price from tokenPacks.js
  |                               orders.create(amount) ------------>  order
  |                               Payment{status: created}
  | <---- orderId, amount, keyId
  | Razorpay Checkout (UPI/card/...)  ----------------------------->  payment captured
  | POST /verify {orderId, paymentId, signature}
  |                               check HMAC(order|payment)
  |                               fulfilOrder(orderId)
  |                                                    <------------  webhook payment.captured / order.paid
  |                                                                   (also calls fulfilOrder)
```

`fulfilOrder` runs on whichever path arrives first:
1. It fetches the payment from Razorpay and checks the order, amount and currency. An `authorized` payment is captured first.
2. It moves the Payment from `created` to `paid` in one conditional update. Only one caller can do this.
3. It credits the tokens with the operation id `credit:<paymentId>`. The id is stored on the user in the same write, so the credit is applied exactly once, even after a retry or crash.
4. It assigns a sequential receipt number (`PRS-2026-000001`) and emails the receipt.

The browser path only fulfils orders that belong to the signed-in user, so a payment cannot be credited to another account.

**Reconcile job:** runs every 10 minutes inside the API process.
- It credits orders that were paid but never reported (tab closed, webhook lost).
- It finishes credits that stopped half way.
- It marks orders that were never paid after 3 days as `expired`.

If an AI action fails, its token is returned automatically (`chargeAIToken` in `backend/middleware/auth.js`).

## Refunds (admin only)

There is no customer refund button or refund window. Customers contact support with their receipt number. After investigating, an admin uses **Refund** on `/admin/payments`:
- **Reason (required):** what was investigated. It is stored with the payment.
- **Whose side was the problem on?**
  - **Customer's own reason (goodwill, the default):** refund the payment minus Razorpay's processing fee (about 2.36%), which Razorpay never returns. The fee is stored on the payment at capture; for older payments it is read from Razorpay at refund time.
  - **Our side** (duplicate charge, no tokens, our failure): refund in full.
  - The Refund policy and Terms tell customers this.
- **Different amount (optional):** any amount up to the payment, replacing the choice above.
- **Take back the pack's tokens:** on by default, and removes whatever is left of the pack, never below zero. Untick it when the customer never received the tokens.

`refundPayment()`:
1. claims the payment atomically, so a double click or a second admin can't refund twice;
2. removes the tokens;
3. calls the Razorpay Refunds API (`speed: normal`, no extra fee).
   - If Razorpay fails, exactly the removed tokens are put back, `refund.status` becomes `failed`, and the admin sees Razorpay's error and can retry.
   - The `refund.processed` / `refund.failed` webhooks update the status.

When a claim is valid but money isn't needed, grant bonus tokens instead (Admin > Tokens, or the bonus-grant endpoints). Those grants appear in the customer's Payment History.

**Razorpay balance:** a refund is paid from your current Razorpay balance, which is swept to your bank about every 2 days. Razorpay also keeps its fee on refunded payments.
- A full refund fails with "invalid request sent" when the balance is lower than the refund. This was confirmed in test mode on 17 Nov 2026: ₹199 failed against a ₹195.02 balance, while ₹190 succeeded.
- **Keep a small reserve balance in live mode** (Account & Settings > Balances > Add Funds, e.g. ₹1,000), or retry after new payments come in.

## Configuration

| Variable | Where | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | `backend/.env`, VPS `api.env` | `rzp_test_…` for test mode, `rzp_live_…` for live |
| `RAZORPAY_WEBHOOK_SECRET` | same | Required. Unsigned webhooks are rejected |
| `PAYMENTS_ENABLED` | same | `true` to accept new purchases. Otherwise the Buy page shows "paused" and `POST /orders` returns 503 |

The checkout key comes from the API (`/config`, `/orders`), so the frontend needs no Razorpay variable.

## Going live

1. **Razorpay account:** it is already activated for live mode. In live mode:
   - Account & Settings > Customer support details: add presmistique@gmail.com and the Contact Us page link (no personal phone number).
   - Capture and refund settings: keep **automatic capture**.
   - Balances: add a reserve, e.g. ₹1,000.
2. **Webhook:** Razorpay Dashboard (live mode) > Webhooks.
   - URL: `https://api.presmistique.in/api/payment/webhook`
   - Events: `payment.captured`, `order.paid`, `refund.processed`, `refund.failed`
   - Set a secret.
3. **Server:** put the live keys and the webhook secret in `/opt/presmistique/api.env`, keep `PAYMENTS_ENABLED=false`, then run `docker compose up -d --force-recreate api`.
4. **Test, then open payments:**
   - Set `PAYMENTS_ENABLED=true` and recreate the container.
   - Buy the smallest pack with your own account.
   - Check the tokens and the receipt email arrive, and the webhook shows as delivered (200) in Razorpay.
   - Refund it from `/admin/payments` with the reason "go-live test".
5. **Gemini key:** make sure the production `GEMINI_API_KEY` is from a project with billing enabled. Free-tier data may be used to train Google's models.
6. **Old records (optional):** copy them from the user documents into `payments` with `node scripts/migrate-legacy-transactions.js` (dry run), then `--apply`.

## Testing locally

- Use test keys and Razorpay's test cards. Test mode accepts any OTP.
- To receive webhooks locally, expose the API with a tunnel and register that URL as a test-mode webhook.
- Without webhooks, the browser callback and the reconcile job still credit payments.
- Automated tests: `cd backend && TOKEN_TEST_MONGODB_URI=mongodb://127.0.0.1:27017/token-test npm test`. CI runs these against a MongoDB service.
