// AI token balance helpers shared by AuthContext and the API layer.
//
// A user has two pools: purchased tokens (refundable) and bonus tokens (not
// refundable). The backend sends a balance as
//   { purchased, bonus, total }
// (plus older aliases: balance, purchasedTokens, bonusTokens) in `data.tokens`
// or, on error responses, in `tokens`. Components never read pools from the
// user object; they read `balance` from useAuth().

export const EMPTY_BALANCE = Object.freeze({ purchased: 0, bonus: 0, total: 0 });

const toCount = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

const isPresent = (value) => value !== undefined && value !== null && value !== '';

/**
 * Normalize a balance object from the API. Accepts the current shape
 * ({ purchased, bonus, total }) and the legacy one ({ balance,
 * purchasedTokens, bonusTokens }). Returns null for anything that is not a
 * balance, e.g. the bare number `0` older endpoints sent for BYOK users, or
 * an object like { added, previous, current }.
 */
export function normalizeBalance(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const hasCurrent = isPresent(raw.purchased) || isPresent(raw.bonus);
  const hasLegacy = isPresent(raw.purchasedTokens) || isPresent(raw.bonusTokens);

  if (hasCurrent || hasLegacy) {
    const purchased = toCount(hasCurrent ? raw.purchased : raw.purchasedTokens);
    const bonus = toCount(hasCurrent ? raw.bonus : raw.bonusTokens);
    return { purchased, bonus, total: purchased + bonus };
  }

  // Only a total is known (very old responses): keep it, pools unknown.
  const totalOnly = isPresent(raw.total) ? raw.total : raw.balance;
  if (isPresent(totalOnly) && Number.isFinite(Number(totalOnly))) {
    return { purchased: 0, bonus: 0, total: toCount(totalOnly) };
  }
  return null;
}

/**
 * Find the caller's balance in an API response body, or null if there is none.
 * Error bodies carry it at the top level (`tokens`), success bodies in
 * `data.tokens`. A user object's own fields are deliberately ignored: admin
 * endpoints return other users.
 */
export function extractBalance(body) {
  if (!body || typeof body !== 'object') return null;
  return normalizeBalance(body.tokens) || normalizeBalance(body.data && body.data.tokens);
}

/** True when two balances are the same. */
export function sameBalance(a, b) {
  return !!a && !!b && a.purchased === b.purchased && a.bonus === b.bonus && a.total === b.total;
}

/** BYOK users never spend tokens; everyone else needs at least `cost`. */
export function canUseAI(user, balance, cost = 1) {
  if (!user) return false;
  if (user.isOwnApiKey) return true;
  return (balance ? balance.total : 0) >= cost;
}

/**
 * Balance of a user record from an admin endpoint (another user). Uses the
 * server's `tokenBalance`; falls back to the raw pool fields of the stored
 * document, where `tokens` is the purchased pool only.
 */
export function userRecordBalance(record) {
  if (!record) return EMPTY_BALANCE;
  return normalizeBalance(record.tokenBalance) ||
    normalizeBalance({ purchased: record.tokens, bonus: record.bonusTokens }) ||
    EMPTY_BALANCE;
}

/** e.g. "3 purchased + 5 bonus", or null when there is no bonus to explain. */
export function describeBalance(balance) {
  if (!balance || balance.bonus <= 0) return null;
  return `${balance.purchased} purchased + ${balance.bonus} bonus`;
}
