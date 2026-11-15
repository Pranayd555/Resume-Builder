import {
  EMPTY_BALANCE,
  normalizeBalance,
  extractBalance,
  sameBalance,
  canUseAI,
  describeBalance,
  userRecordBalance
} from './tokenBalance';

describe('normalizeBalance', () => {
  it('reads the current shape', () => {
    expect(normalizeBalance({ purchased: 0, bonus: 5, total: 5 })).toEqual({ purchased: 0, bonus: 5, total: 5 });
  });

  it('reads the legacy shape and recomputes the total from both pools', () => {
    expect(normalizeBalance({ balance: 0, purchasedTokens: 0, bonusTokens: 5 })).toEqual({ purchased: 0, bonus: 5, total: 5 });
  });

  it('never reports a bonus-only user as 0', () => {
    expect(normalizeBalance({ purchasedTokens: 0, bonusTokens: 3 }).total).toBe(3);
  });

  it('ignores values that are not a balance', () => {
    expect(normalizeBalance(0)).toBeNull(); // old BYOK responses sent `tokens: 0`
    expect(normalizeBalance(7)).toBeNull();
    expect(normalizeBalance(null)).toBeNull();
    expect(normalizeBalance({ added: 5, previous: 0, current: 5 })).toBeNull();
    expect(normalizeBalance([1, 2])).toBeNull();
  });

  it('sanitizes bad numbers', () => {
    expect(normalizeBalance({ purchased: -2, bonus: '4', total: 2 })).toEqual({ purchased: 0, bonus: 4, total: 4 });
  });

  it('keeps a total-only balance', () => {
    expect(normalizeBalance({ balance: 9 })).toEqual({ purchased: 0, bonus: 0, total: 9 });
  });
});

describe('extractBalance', () => {
  it('finds data.tokens on success responses', () => {
    expect(extractBalance({ success: true, data: { tokens: { purchased: 1, bonus: 2, total: 3 } } }))
      .toEqual({ purchased: 1, bonus: 2, total: 3 });
  });

  it('finds top-level tokens on error responses (refunded balance)', () => {
    expect(extractBalance({ success: false, error: 'x', tokens: { purchased: 0, bonus: 4, total: 4 } }))
      .toEqual({ purchased: 0, bonus: 4, total: 4 });
  });

  it('returns null for BYOK AI responses without a balance', () => {
    expect(extractBalance({ success: true, data: { rewrittenContent: 'hi' } })).toBeNull();
    expect(extractBalance({ success: true, data: { tokens: 0 } })).toBeNull();
  });

  it('does not read balances from user objects (admin endpoints list other users)', () => {
    expect(extractBalance({ success: true, data: { user: { tokens: 99, tokenBalance: { purchased: 99, bonus: 0, total: 99 } } } }))
      .toBeNull();
  });
});

describe('canUseAI', () => {
  const user = { isOwnApiKey: false };
  it('allows bonus only', () => expect(canUseAI(user, { purchased: 0, bonus: 2, total: 2 })).toBe(true));
  it('allows purchased only', () => expect(canUseAI(user, { purchased: 2, bonus: 0, total: 2 })).toBe(true));
  it('allows both', () => expect(canUseAI(user, { purchased: 1, bonus: 1, total: 2 })).toBe(true));
  it('blocks zero', () => expect(canUseAI(user, EMPTY_BALANCE)).toBe(false));
  it('always allows BYOK, even at zero', () => expect(canUseAI({ isOwnApiKey: true }, EMPTY_BALANCE)).toBe(true));
  it('blocks when signed out', () => expect(canUseAI(null, { purchased: 5, bonus: 0, total: 5 })).toBe(false));
});

describe('userRecordBalance (admin views)', () => {
  it('uses tokenBalance from the API', () => {
    expect(userRecordBalance({ tokens: 0, bonusTokens: 5, tokenBalance: { purchased: 0, bonus: 5, total: 5 } }))
      .toEqual({ purchased: 0, bonus: 5, total: 5 });
  });
  it('falls back to raw pools: tokens is purchased only, bonus is added', () => {
    expect(userRecordBalance({ tokens: 0, bonusTokens: 5 })).toEqual({ purchased: 0, bonus: 5, total: 5 });
    expect(userRecordBalance({ tokens: 2 })).toEqual({ purchased: 2, bonus: 0, total: 2 });
  });
  it('handles a missing record', () => {
    expect(userRecordBalance(null)).toEqual(EMPTY_BALANCE);
  });
});

describe('helpers', () => {
  it('sameBalance', () => {
    expect(sameBalance({ purchased: 1, bonus: 1, total: 2 }, { purchased: 1, bonus: 1, total: 2 })).toBe(true);
    expect(sameBalance({ purchased: 1, bonus: 1, total: 2 }, { purchased: 2, bonus: 0, total: 2 })).toBe(false);
  });

  it('describeBalance', () => {
    expect(describeBalance({ purchased: 3, bonus: 5, total: 8 })).toBe('3 purchased + 5 bonus');
    expect(describeBalance({ purchased: 3, bonus: 0, total: 3 })).toBeNull();
  });
});
