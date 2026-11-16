/**
 * Token packs: the only place prices are defined.
 * Run: node --test config/tokenPacks.test.js
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { TOKEN_PACKS, findPack, pricePaise } = require('./tokenPacks');

test('pack ids are unique, prices are whole rupees, bigger packs cost less per token', () => {
  assert.equal(new Set(TOKEN_PACKS.map((p) => p.id)).size, TOKEN_PACKS.length);
  let lastPerToken = Infinity;
  for (const pack of TOKEN_PACKS) {
    assert.ok(Number.isInteger(pack.price) && pack.price > 0, pack.id);
    assert.ok(Number.isInteger(pack.tokens) && pack.tokens > 0, pack.id);
    assert.equal(pricePaise(pack), pack.price * 100);
    const perToken = pack.price / (pack.tokens + pack.bonus);
    assert.ok(perToken < lastPerToken, `${pack.id} should be cheaper per token than the pack before it`);
    lastPerToken = perToken;
  }
  assert.equal(TOKEN_PACKS.filter((p) => p.popular).length, 1);
});

test('findPack only accepts known ids', () => {
  assert.equal(findPack('pack_60').tokens, 60);
  assert.equal(findPack('pack_999'), null);
  assert.equal(findPack({ $ne: null }), null);
});
