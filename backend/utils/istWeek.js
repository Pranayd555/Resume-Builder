// Utilities for computing week windows based on IST (UTC+05:30)

const IST_OFFSET_MINUTES = 5 * 60 + 30; // 330 minutes

function toIst(dateUtc = new Date()) {
  const d = new Date(dateUtc);
  return new Date(d.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
}

function toUtc(dateIst) {
  const d = new Date(dateIst);
  return new Date(d.getTime() - IST_OFFSET_MINUTES * 60 * 1000);
}

// Returns start of the week (Monday 00:00:00) in UTC, for the week containing given UTC date
function getIstWeekStartUtc(dateUtc = new Date()) {
  const ist = toIst(dateUtc);
  const day = ist.getDay(); // 0=Sun .. 6=Sat
  // Convert to Monday-based index where Monday=0
  const mondayIndex = (day + 6) % 7;
  const startIst = new Date(ist);
  startIst.setHours(0, 0, 0, 0);
  startIst.setDate(startIst.getDate() - mondayIndex);
  return toUtc(startIst);
}

// Returns next reset time (next Monday 00:00:00 IST) in UTC
function getNextIstWeekResetUtc(dateUtc = new Date()) {
  const startUtc = getIstWeekStartUtc(dateUtc);
  const nextStartUtc = new Date(startUtc.getTime() + 7 * 24 * 60 * 60 * 1000);
  return nextStartUtc;
}

module.exports = {
  toIst,
  toUtc,
  getIstWeekStartUtc,
  getNextIstWeekResetUtc,
};

