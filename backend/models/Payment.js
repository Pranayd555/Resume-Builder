const mongoose = require('mongoose');

/**
 * One document per token pack purchase (type 'purchase') or admin bonus grant
 * (type 'bonus'). Replaces the transactions array that used to live inside
 * the User document.
 *
 * Purchase lifecycle (all transitions are single atomic updates):
 *   created  -> order created, waiting for payment
 *   paid     -> payment captured and tokens credited (credited: true)
 *   refunded -> refund issued by an admin; refund.status follows Razorpay
 *   expired  -> order never paid
 * Bonus grants are stored as status 'granted' with amount 0.
 */
const refundSchema = new mongoose.Schema({
  // pending: claimed, Razorpay call in progress or awaiting refund.processed
  // processed: money returned; failed: Razorpay call failed, tokens restored
  status: { type: String, enum: ['pending', 'processed', 'failed'] },
  razorpayRefundId: String,
  amount: Number, // paise
  by: { type: String, enum: ['user', 'admin'] }, // 'user' only on legacy records
  adminEmail: String,
  reason: String,
  error: String,
  attempts: { type: Number, default: 0 },
  // Tokens taken back from the customer when the refund was issued
  tokensRemoved: { purchased: Number, bonus: Number },
  requestedAt: Date,
  processedAt: Date
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['purchase', 'bonus'], required: true },
  status: {
    type: String,
    enum: ['created', 'paid', 'refunded', 'expired', 'granted'],
    required: true,
    index: true
  },

  // What was bought (copied from config/tokenPacks.js at order time)
  packId: String,
  tokens: { type: Number, default: 0, min: 0 },      // purchased pool
  bonusTokens: { type: Number, default: 0, min: 0 }, // bonus pool
  amount: { type: Number, default: 0, min: 0 },      // paise
  currency: { type: String, default: 'INR' },

  // Razorpay
  orderId: String,
  paymentId: String,
  method: String,
  paidAt: Date,
  credited: { type: Boolean, default: false },

  receiptNumber: String,
  refund: refundSchema,

  // Bonus grants
  reason: String,
  grantedBy: String,

  // Imported from the old User.razorpayTransactions array
  legacy: { type: Boolean, default: false }
}, { timestamps: true });

// Unique when present: one record per Razorpay order / payment / receipt.
const uniqueWhenSet = (field) => ({
  unique: true,
  partialFilterExpression: { [field]: { $type: 'string' } }
});
paymentSchema.index({ orderId: 1 }, uniqueWhenSet('orderId'));
paymentSchema.index({ paymentId: 1 }, uniqueWhenSet('paymentId'));
paymentSchema.index({ receiptNumber: 1 }, uniqueWhenSet('receiptNumber'));
paymentSchema.index({ user: 1, createdAt: -1 });

// Sequential receipt numbers (PRS-2026-000001), one counter per year.
const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

paymentSchema.statics.nextReceiptNumber = async function nextReceiptNumber(date = new Date()) {
  const year = date.getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { _id: `receipt-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `PRS-${year}-${String(counter.seq).padStart(6, '0')}`;
};

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
