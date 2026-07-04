/** Revenue helpers — period keys and order contribution math */

export function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function formatDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatMonthKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/** Week starts Monday (local timezone) */
export function getWeekStart(date) {
  const d = new Date(date instanceof Date ? date : new Date(date));
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatWeekKey(date) {
  return formatDateKey(getWeekStart(date));
}

export function revenueDocId(period, periodKey) {
  return `${period}_${periodKey}`;
}

export function parseRevenueDocId(docId) {
  const idx = docId.indexOf('_');
  if (idx === -1) return { period: docId, periodKey: '' };
  return { period: docId.slice(0, idx), periodKey: docId.slice(idx + 1) };
}

export function formatPeriodLabel(period, periodKey) {
  if (period === 'daily') {
    const d = new Date(`${periodKey}T12:00:00`);
    return d.toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
  if (period === 'weekly') {
    const start = new Date(`${periodKey}T12:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (dt) => dt.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
    return `${fmt(start)} – ${fmt(end)}`;
  }
  if (period === 'monthly') {
    const [y, m] = periodKey.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
  }
  return periodKey;
}

export function isCountableOrder(order) {
  if (!order) return false;
  if (order.status === 'cancelled' || order.status === 'merged') return false;
  if (order.mergedInto) return false;
  return true;
}

export function isCompletedOrder(order) {
  return isCountableOrder(order) && ['placed', 'done'].includes(order.status);
}

/** Single order's contribution to revenue totals */
export function getOrderContribution(order) {
  if (!isCountableOrder(order)) {
    return emptyContribution();
  }
  const amount = Number(order.total) || 0;
  const completed = isCompletedOrder(order);
  return {
    total: amount,
    completedTotal: completed ? amount : 0,
    pendingTotal: completed ? 0 : amount,
    orderCount: 1,
    completedCount: completed ? 1 : 0,
    pendingCount: completed ? 0 : 1,
  };
}

function emptyContribution() {
  return {
    total: 0,
    completedTotal: 0,
    pendingTotal: 0,
    orderCount: 0,
    completedCount: 0,
    pendingCount: 0,
  };
}

export function subtractContributions(a, b) {
  return {
    total: a.total - b.total,
    completedTotal: a.completedTotal - b.completedTotal,
    pendingTotal: a.pendingTotal - b.pendingTotal,
    orderCount: a.orderCount - b.orderCount,
    completedCount: a.completedCount - b.completedCount,
    pendingCount: a.pendingCount - b.pendingCount,
  };
}

export function addContributions(a, b) {
  return {
    total: a.total + b.total,
    completedTotal: a.completedTotal + b.completedTotal,
    pendingTotal: a.pendingTotal + b.pendingTotal,
    orderCount: a.orderCount + b.orderCount,
    completedCount: a.completedCount + b.completedCount,
    pendingCount: a.pendingCount + b.pendingCount,
  };
}

export function getContributionDelta(before, after) {
  return subtractContributions(getOrderContribution(after), getOrderContribution(before));
}

export function getOrderDate(order) {
  return toDate(order?.createdAt) || new Date();
}

export function getPeriodKeysForDate(date) {
  return {
    daily: formatDateKey(date),
    weekly: formatWeekKey(date),
    monthly: formatMonthKey(date),
  };
}

/** Build all revenue snapshot docs from orders list */
export function buildRevenueSnapshots(orders) {
  const map = new Map();

  const addToMap = (period, periodKey, contribution) => {
    const id = revenueDocId(period, periodKey);
    const existing = map.get(id) || {
      period,
      periodKey,
      periodLabel: formatPeriodLabel(period, periodKey),
      periodStart: periodKey,
      total: 0,
      completedTotal: 0,
      pendingTotal: 0,
      orderCount: 0,
      completedCount: 0,
      pendingCount: 0,
    };
    map.set(id, addContributions(existing, contribution));
  };

  orders.forEach((order) => {
    const contribution = getOrderContribution(order);
    if (contribution.orderCount === 0) return;
    const keys = getPeriodKeysForDate(getOrderDate(order));
    addToMap('daily', keys.daily, contribution);
    addToMap('weekly', keys.weekly, contribution);
    addToMap('monthly', keys.monthly, contribution);
  });

  return map;
}

export function filterSnapshotsByPeriod(snapshots, period) {
  return [...snapshots]
    .filter((s) => s.period === period)
    .sort((a, b) => b.periodKey.localeCompare(a.periodKey));
}

export function getTodayKey() {
  return formatDateKey(new Date());
}

export function getThisWeekKey() {
  return formatWeekKey(new Date());
}

export function getThisMonthKey() {
  return formatMonthKey(new Date());
}

/** Generate period keys for chart (most recent N periods including current) */
export function getRecentPeriodKeys(period, count) {
  const keys = [];
  const now = new Date();

  if (period === 'daily') {
    for (let i = count - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      keys.push(formatDateKey(d));
    }
    return keys;
  }

  if (period === 'weekly') {
    const start = getWeekStart(now);
    for (let i = count - 1; i >= 0; i -= 1) {
      const d = new Date(start);
      d.setDate(d.getDate() - i * 7);
      keys.push(formatDateKey(d));
    }
    return keys;
  }

  if (period === 'monthly') {
    for (let i = count - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(formatMonthKey(d));
    }
    return keys;
  }

  return keys;
}

export function shiftPeriodKey(period, periodKey, direction) {
  if (period === 'daily') {
    const d = new Date(`${periodKey}T12:00:00`);
    d.setDate(d.getDate() + direction);
    return formatDateKey(d);
  }
  if (period === 'weekly') {
    const d = new Date(`${periodKey}T12:00:00`);
    d.setDate(d.getDate() + direction * 7);
    return formatDateKey(getWeekStart(d));
  }
  if (period === 'monthly') {
    const [y, m] = periodKey.split('-').map(Number);
    const d = new Date(y, m - 1 + direction, 1);
    return formatMonthKey(d);
  }
  return periodKey;
}

export function emptyRevenueSnapshot(period, periodKey) {
  return {
    period,
    periodKey,
    periodLabel: formatPeriodLabel(period, periodKey),
    periodStart: periodKey,
    total: 0,
    completedTotal: 0,
    pendingTotal: 0,
    orderCount: 0,
    completedCount: 0,
    pendingCount: 0,
  };
}

export function formatPKR(amount) {
  return `PKR ${Math.round(amount || 0).toLocaleString()}`;
}

/** Live revenue from orders — preferred over Firestore snapshots for admin UI */
export function mergeRevenueWithOrders(firestoreRevenue, orders) {
  const byId = new Map();
  buildRevenueSnapshots(orders).forEach((snap, id) => {
    byId.set(id, snap);
  });
  (firestoreRevenue || []).forEach((snap) => {
    const id = revenueDocId(snap.period, snap.periodKey);
    if (!byId.has(id)) byId.set(id, snap);
  });
  return [...byId.values()];
}

export function getTodayRevenueFromOrders(orders) {
  const key = getTodayKey();
  const snap = buildRevenueSnapshots(orders).get(revenueDocId('daily', key));
  return Math.max(0, snap?.total || 0);
}

export function getSnapshotFromOrders(orders, period, periodKey) {
  const snap = buildRevenueSnapshots(orders).get(revenueDocId(period, periodKey));
  return snap || emptyRevenueSnapshot(period, periodKey);
}
