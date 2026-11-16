/**
 * The refund rule: full refund of an unused pack within the window, otherwise none.
 * Run: node --test utils/refundPolicy.test.js
 */
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { refundEligibility, REFUND_WINDOW_DAYS } = require('./refundPolicy');
const { TOKEN_PACKS, findPack, pricePaise } = require('../config/tokenPacks');

const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-11-16T12:00:00Z');
const paid = (overrides = {}) => ({
  type: 'purchase',
  status: 'paid',
  tokens: 25,
  bonusTokens: 5,
  amount: 19900,
  paidAt: new Date(now - 2 * DAY),
  ...overrides
});

describe('refundEligibility', () => {
  test('unused pack within the window is refundable', () => {
    const r = refundEligibility(paid(), { purchased: 25, bonus: 5 }, now);
    assert.equal(r.refundable, true);
    assert.equal(r.reason, null);
    assert.equal(r.refundableUntil.getTime(), paid().paidAt.getTime() + REFUND_WINDOW_DAYS * DAY);
  });

  test('extra tokens from other packs or signup bonus do not matter', () => {
    assert.equal(refundEligibility(paid(), { purchased: 60, bonus: 12 }, now).refundable, true);
  });

  test('one purchased token used -> not refundable', () => {
    const r = refundEligibility(paid(), { purchased: 24, bonus: 5 }, now);
    assert.equal(r.refundable, false);
    assert.match(r.reason, /used/);
  });

  test('one bonus token used -> not refundable (bonus is spent first)', () => {
    assert.equal(refundEligibility(paid(), { purchased: 25, bonus: 4 }, now).refundable, false);
  });

  test('pack without bonus ignores the bonus pool', () => {
    assert.equal(refundEligibility(paid({ tokens: 5, bonusTokens: 0, amount: 4900 }), { purchased: 5, bonus: 0 }, now).refundable, true);
  });

  test('exactly at the end of the window is still refundable; after it is not', () => {
    const edge = new Date(paid().paidAt.getTime() + REFUND_WINDOW_DAYS * DAY);
    assert.equal(refundEligibility(paid(), { purchased: 25, bonus: 5 }, edge).refundable, true);
    const late = refundEligibility(paid(), { purchased: 25, bonus: 5 }, new Date(edge.getTime() + 1));
    assert.equal(late.refundable, false);
    assert.match(late.reason, /7 days/);
  });

  test('refunded, pending refund, unpaid and bonus grants are not refundable', () => {
    const balance = { purchased: 100, bonus: 100 };
    assert.equal(refundEligibility(paid({ status: 'refunded' }), balance, now).refundable, false);
    assert.equal(refundEligibility(paid({ refund: { status: 'pending' } }), balance, now).refundable, false);
    assert.equal(refundEligibility(paid({ status: 'created', paidAt: undefined }), balance, now).refundable, false);
    assert.equal(refundEligibility({ type: 'bonus', status: 'granted', bonusTokens: 5, amount: 0 }, balance, now).refundable, false);
    assert.equal(refundEligibility(null, balance, now).refundable, false);
  });

  test('a failed earlier refund attempt can be retried', () => {
    assert.equal(refundEligibility(paid({ refund: { status: 'failed' } }), { purchased: 25, bonus: 5 }, now).refundable, true);
  });
});

describe('token packs', () => {
  test('ids are unique and prices are whole rupees', () => {
    assert.equal(new Set(TOKEN_PACKS.map((p) => p.id)).size, TOKEN_PACKS.length);
    for (const pack of TOKEN_PACKS) {
      assert.ok(Number.isInteger(pack.price) && pack.price > 0);
      assert.equal(pricePaise(pack), pack.price * 100);
    }
  });

  test('findPack only accepts known ids', () => {
    assert.equal(findPack('pack_25').tokens, 25);
    assert.equal(findPack('pack_999'), null);
    assert.equal(findPack({ $ne: null }), null);
  });
});
