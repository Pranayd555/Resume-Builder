# Payments and refunds

Users buy AI token packs with Razorpay (INR). The design follows Razorpay's recommended integration: the server creates the order and sets the price, webhooks confirm payments, and crediting is idempotent. Refunds follow one rule that customers apply themselves.

| Piece | File |
|---|---|
| Packs, prices, refund window | `backend/config/tokenPacks.js` (the only place prices are defined) |
| Refund rule | `backend/utils/refundPolicy.js` |
| Orders, crediting, refunds, webhooks, reconcile job | `backend/services/paymentService.js` |
| HTTP routes | `backend/routes/payment.js` |
| Payment records | `backend/models/Payment.js` (collection `payments`) |
| Token pools | `backend/utils/tokenCalculator.js` |
| Checkout page | `resume-builder/src/components/Payment.js` |
| History and self-serve refund | `resume-builder/src/components/PaymentHistory.js` (in Analytics) |
| Admin | `resume-builder/src/components/admin/AdminPayments.js` (`/admin/payments`) |
| Tests | `backend/services/paymentService.test.js`, `backend/utils/refundPolicy.test.js` |

## Packs

| Pack | Tokens | Bonus | Price |
|---|---|---|---|
| `pack_5` | 5 | 0 | ₹49 |
| `pack_10` | 10 | 1 | ₹89 |
| `pack_25` | 25 | 5 | ₹199 |
| `pack_50` | 50 | 15 | ₹349 |
| `pack_100` | 100 | 40 | ₹599 |

The frontend reads these from `GET /api/payment/config`. To change a price, edit `tokenPacks.js` only.

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

The browser path only fulfils orders that belong to the signed-in user. A payment cannot be credited to another account.

**Reconcile job:** this runs every 10 minutes inside the API process.
- It credits orders that were paid but never reported, for example because the tab was closed and the webhook was lost.
- It finishes credits that stopped half way.
- It marks orders that were never paid after 3 days as `expired`.

## Refunds

**Rule (`refundPolicy.js`):** a pack gets a **full refund** if all of these are true:
- it was paid for within the last **7 days**;
- it hasn't been refunded already;
- **every token it added, bonus included, is still in the balance**.

Otherwise there is no refund. Bonus grants are never refundable. Tokens are spent bonus first, so using AI even once after buying a pack makes it non-refundable. This matches the public Cancellation & Refunds page.

**How customers get one:** Analytics > Payment History shows a Refund button on packs that qualify. `POST /api/payment/:id/refund` then:
1. claims the payment (`refund.status: pending`) atomically, so a double click or second tab can't refund twice;
2. removes the pack's tokens only if they are all still there (a single conditional update);
3. calls the Razorpay Refunds API for the full amount (`speed: normal`, no extra fee).
   - If Razorpay fails, the tokens are put back, `refund.status` becomes `failed`, and the refund can be retried.
4. sets status `refunded`. The `refund.processed` / `refund.failed` webhooks update `refund.status`.

**Admins** can refund any paid pack from `/admin/payments`. When the rule no longer allows it (tokens used, or outside the window), the page offers a **goodwill refund**: the full amount is returned and whatever is left of the pack's tokens is removed, never below zero. Razorpay keeps its fee (about 2% + GST) on refunded payments.

## Configuration

| Variable | Where | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | `backend/.env`, VPS `api.env` | `rzp_test_…` for test mode, `rzp_live_…` for live |
| `RAZORPAY_WEBHOOK_SECRET` | same | Required. Unsigned webhooks are rejected |
| `PAYMENTS_ENABLED` | same | `true` to accept new purchases. Otherwise the Buy page shows "paused" and `POST /orders` returns 503. Refunds of existing payments still work |

The checkout key comes from the API (`/config`, `/orders`), so the frontend needs no Razorpay variable. `REACT_APP_RAZORPAY_KEY_ID` is no longer used.

## Going live

1. Complete Razorpay KYC and activate live mode.
   - Razorpay checks the site for Terms, Privacy, Cancellation & Refunds, Contact and Shipping pages.
   - For Shipping, "delivered instantly to your account" covers digital goods.
2. Razorpay Dashboard > Settings > Payment capture: turn on **automatic capture**.
3. Razorpay Dashboard > Webhooks: add `https://api.presmistique.in/api/payment/webhook` with the events `payment.captured`, `order.paid`, `refund.processed` and `refund.failed`, and set a secret.
4. On the VPS, put the live keys and the webhook secret in `/opt/presmistique/api.env`, keep `PAYMENTS_ENABLED=false`, then run `docker compose up -d --force-recreate api`.
5. Test the live keys before opening payments to users:
   - Set `PAYMENTS_ENABLED=true` and recreate the container.
   - Buy the smallest pack with your own account.
   - Check the tokens arrive, the receipt email arrives, and the Razorpay dashboard shows the webhook delivered (200).
   - Refund the pack from Analytics > Payment History.
   - If anything is wrong, set `PAYMENTS_ENABLED=false` again.
6. Optional: copy old records from the user documents into the `payments` collection.
   - Dry run: `node scripts/migrate-legacy-transactions.js`
   - Then `--apply`.

## Testing locally

- Use test keys and Razorpay's test cards or UPI (`success@razorpay`).
- To receive webhooks locally, expose the API with a tunnel and register that URL as a test-mode webhook.
- Without webhooks, the browser callback and the reconcile job still credit payments.
- Automated tests: `cd backend && TOKEN_TEST_MONGODB_URI=mongodb://127.0.0.1:27017/token-test npm test`. CI runs these against a MongoDB service.
