import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { subscribeRevenue, subscribeOrders, rebuildAllRevenue } from '../firebase/services';
import { isFirebaseConfigured } from '../firebase/config';
import { useAnimatedCounter } from './hooks/useAnimatedCounter';
import {
  filterSnapshotsByPeriod,
  formatPeriodLabel,
  formatPKR,
  getRecentPeriodKeys,
  getTodayKey,
  getThisWeekKey,
  getThisMonthKey,
  mergeRevenueWithOrders,
  shiftPeriodKey,
} from '../utils/revenueUtils';

const PERIODS = [
  { id: 'daily', label: 'Daily', chartCount: 7 },
  { id: 'weekly', label: 'Weekly', chartCount: 8 },
  { id: 'monthly', label: 'Monthly', chartCount: 6 },
];

function RevenueStat({ icon, value, label, color, delay = 0 }) {
  const ref = useRef(null);
  const count = useAnimatedCounter(value, 1.1);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, delay, ease: 'power3.out' });
  }, [delay]);

  return (
    <div ref={ref} className="admin-revenue-stat" style={{ '--rev-color': color }}>
      <div className="admin-revenue-stat-icon">{icon}</div>
      <div>
        <div className="admin-revenue-stat-value">{formatPKR(count)}</div>
        <div className="admin-revenue-stat-label">{label}</div>
      </div>
    </div>
  );
}

function RevenueBarChart({ period, periodKeys, snapshots, delay = 0 }) {
  const chartRef = useRef(null);
  const maxTotal = Math.max(...periodKeys.map((k) => {
    const snap = snapshots.find((s) => s.period === period && s.periodKey === k);
    return snap?.total || 0;
  }), 1);

  useEffect(() => {
    if (!chartRef.current) return;
    gsap.fromTo(
      chartRef.current.querySelectorAll('.admin-revenue-bar-fill'),
      { scaleY: 0 },
      { scaleY: 1, duration: 0.8, delay, stagger: 0.06, ease: 'power3.out', transformOrigin: 'bottom' },
    );
  }, [period, periodKeys.join(','), delay]);

  return (
    <div ref={chartRef} className="admin-revenue-chart">
      {periodKeys.map((key) => {
        const snap = snapshots.find((s) => s.period === period && s.periodKey === key);
        const total = Math.max(0, snap?.total || 0);
        const height = Math.max(8, (total / maxTotal) * 100);
        const shortLabel = period === 'monthly'
          ? key.slice(5)
          : key.slice(8) || key.slice(5);

        return (
          <div key={key} className="admin-revenue-bar-col" title={`${formatPeriodLabel(period, key)}: ${formatPKR(total)}`}>
            <div className="admin-revenue-bar-wrap">
              <div className="admin-revenue-bar-fill" style={{ height: `${height}%` }} />
            </div>
            <span className="admin-revenue-bar-value">{total >= 1000 ? `${Math.round(total / 1000)}k` : total || '0'}</span>
            <span className="admin-revenue-bar-label">{shortLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminRevenue() {
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [period, setPeriod] = useState('daily');
  const [selectedKey, setSelectedKey] = useState(getTodayKey());
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const initialPeriodSet = useRef(false);

  useEffect(() => {
    const unsubs = [
      subscribeRevenue(setRevenue),
      subscribeOrders((data) => setOrders(data.filter((o) => o.status !== 'merged' && !o.mergedInto))),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (initialPeriodSet.current || orders.length === 0) return;
    const snaps = mergeRevenueWithOrders([], orders);
    const daily = filterSnapshotsByPeriod(snaps, period);
    const todaySnap = daily.find((s) => s.periodKey === selectedKey);
    if ((todaySnap?.orderCount || 0) === 0 && daily.length > 0) {
      setSelectedKey(daily[0].periodKey);
    }
    initialPeriodSet.current = true;
  }, [orders, period, selectedKey]);

  const computedSnapshots = useMemo(
    () => mergeRevenueWithOrders(revenue, orders),
    [revenue, orders],
  );

  const mergedSnapshots = computedSnapshots;

  const currentPeriod = PERIODS.find((p) => p.id === period);
  const chartKeys = getRecentPeriodKeys(period, currentPeriod?.chartCount || 7);

  const currentSnapshot = mergedSnapshots.find(
    (s) => s.period === period && s.periodKey === selectedKey,
  ) || {
    total: 0,
    completedTotal: 0,
    pendingTotal: 0,
    orderCount: 0,
    completedCount: 0,
    pendingCount: 0,
  };

  const safeSnapshot = {
    total: Math.max(0, currentSnapshot.total || 0),
    completedTotal: Math.max(0, currentSnapshot.completedTotal || 0),
    pendingTotal: Math.max(0, currentSnapshot.pendingTotal || 0),
    orderCount: Math.max(0, currentSnapshot.orderCount || 0),
    completedCount: Math.max(0, currentSnapshot.completedCount || 0),
    pendingCount: Math.max(0, currentSnapshot.pendingCount || 0),
  };

  const periodList = filterSnapshotsByPeriod(mergedSnapshots, period).slice(0, 12);

  const handlePeriodChange = (id) => {
    setPeriod(id);
    if (id === 'daily') setSelectedKey(getTodayKey());
    else if (id === 'weekly') setSelectedKey(getThisWeekKey());
    else setSelectedKey(getThisMonthKey());
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const { periods, updated } = await rebuildAllRevenue();
      setSyncMsg(`Rebuilt from orders — ${periods} active periods, ${updated} records updated`);
    } catch (err) {
      setSyncMsg(err.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="admin-page admin-revenue-page">
      <div className="admin-revenue-header">
        <div>
          <p className="admin-page-sub">Live revenue from orders — updates instantly as orders come in</p>
          {syncMsg && <p className="admin-revenue-sync-msg">{syncMsg}</p>}
        </div>
        <button type="button" className="admin-btn-sm success" onClick={handleSync} disabled={syncing}>
          {syncing ? 'Syncing…' : '🔄 Sync from Orders'}
        </button>
      </div>

      <div className="admin-revenue-tabs">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`admin-order-tab${period === p.id ? ' active' : ''}`}
            onClick={() => handlePeriodChange(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="admin-revenue-period-nav">
        <button
          type="button"
          className="admin-revenue-nav-btn"
          onClick={() => setSelectedKey(shiftPeriodKey(period, selectedKey, -1))}
        >
          ← Prev
        </button>
        <h2 className="admin-revenue-period-title">{formatPeriodLabel(period, selectedKey)}</h2>
        <button
          type="button"
          className="admin-revenue-nav-btn"
          onClick={() => setSelectedKey(shiftPeriodKey(period, selectedKey, 1))}
        >
          Next →
        </button>
      </div>

      <div className="admin-revenue-stats">
        <RevenueStat icon="💰" value={safeSnapshot.total} label="Total Revenue" color="#FF6B35" delay={0} />
        <RevenueStat icon="✅" value={safeSnapshot.completedTotal} label="Completed (Placed/Done)" color="#22c55e" delay={0.08} />
        <RevenueStat icon="⏳" value={safeSnapshot.pendingTotal} label="In Pipeline" color="#f59e0b" delay={0.16} />
        <div className="admin-revenue-stat admin-revenue-stat-count" style={{ '--rev-color': '#60a5fa' }}>
          <div className="admin-revenue-stat-icon">🛒</div>
          <div>
            <div className="admin-revenue-stat-value">{safeSnapshot.orderCount}</div>
            <div className="admin-revenue-stat-label">Orders</div>
          </div>
        </div>
      </div>

      <div className="admin-panel admin-panel-rich admin-revenue-chart-panel" style={{ '--panel-accent': '#FF6B35' }}>
        <div className="admin-panel-head">
          <div className="admin-panel-title">
            {period === 'daily' && 'Last 7 Days'}
            {period === 'weekly' && 'Last 8 Weeks'}
            {period === 'monthly' && 'Last 6 Months'}
          </div>
        </div>
        <RevenueBarChart
          period={period}
          periodKeys={chartKeys}
          snapshots={mergedSnapshots}
          delay={0.2}
        />
      </div>

      <div className="admin-panel admin-panel-rich" style={{ '--panel-accent': '#22c55e' }}>
        <div className="admin-panel-head">
          <div className="admin-panel-title">History</div>
        </div>
        {periodList.length === 0 ? (
          <p className="admin-revenue-empty">No revenue data yet. Place orders or click Sync from Orders.</p>
        ) : (
          <div className="admin-revenue-table-wrap">
            <table className="admin-revenue-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Orders</th>
                  <th>Completed</th>
                  <th>Pipeline</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {periodList.map((row) => (
                  <tr
                    key={`${row.period}_${row.periodKey}`}
                    className={row.periodKey === selectedKey ? 'active' : ''}
                    onClick={() => setSelectedKey(row.periodKey)}
                  >
                    <td>{row.periodLabel || formatPeriodLabel(period, row.periodKey)}</td>
                    <td>{Math.max(0, row.orderCount || 0)}</td>
                    <td>{formatPKR(Math.max(0, row.completedTotal || 0))}</td>
                    <td>{formatPKR(Math.max(0, row.pendingTotal || 0))}</td>
                    <td><strong>{formatPKR(Math.max(0, row.total || 0))}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
