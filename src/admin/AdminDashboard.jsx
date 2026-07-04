import { useEffect, useRef, useState } from 'react';
import { subscribeOrders, subscribeMenuItems } from '../firebase/services';
import { isFirebaseConfigured } from '../firebase/config';
import { countWebsiteMenuItems } from '../data/menuData';
import { getTodayKey, getTodayRevenueFromOrders, formatDateKey, toDate } from '../utils/revenueUtils';
import StatCard from './components/StatCard';
import DashboardPanel, { OrderFeedItem } from './components/DashboardPanel';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [sync, setSync] = useState({ live: isFirebaseConfigured, error: null });
  const prevTotal = useRef(0);

  useEffect(() => {
    const unsubs = [
      subscribeOrders((items, meta) => {
        setOrders(items.filter((o) => o.status !== 'merged' && !o.mergedInto));
        setSync((s) => ({ ...s, ...meta }));
      }),
      subscribeMenuItems((items) => setMenuItems(items)),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const pending = orders.filter((o) => o.status === 'pending').length;
  const confirmed = orders.filter((o) => o.status === 'confirmed').length;
  const placed = orders.filter((o) => o.status === 'placed').length;
  const websiteMenuCount = countWebsiteMenuItems();
  const totalMenuCount = websiteMenuCount + menuItems.length;
  const todayKey = getTodayKey();
  const todayRevenue = getTodayRevenueFromOrders(orders);
  const todayOrderCount = orders.filter((o) => {
    const d = toDate(o.createdAt);
    return d && formatDateKey(d) === todayKey;
  }).length;

  const stats = [
    { icon: '💰', value: todayRevenue, label: "Today's Revenue", color: '#a855f7', to: '/admin/revenue', currency: true },
    { icon: '🛒', value: orders.length, label: 'Total Orders', color: '#FF6B35', to: '/admin/orders', pulse: orders.length !== prevTotal.current },
    { icon: '⏳', value: pending, label: 'Pending', color: '#f59e0b', to: '/admin/orders' },
    { icon: '✅', value: confirmed, label: 'Confirmed', color: '#60a5fa', to: '/admin/orders' },
  ];

  useEffect(() => {
    prevTotal.current = orders.length;
  }, [orders.length]);

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="admin-page">
      <div className="admin-page-intro">
        {isFirebaseConfigured && sync.live ? (
          <span className="admin-live">Live — orders sync in realtime</span>
        ) : isFirebaseConfigured ? (
          <span className="admin-offline">Connection issue — {sync.error || 'retrying…'}</span>
        ) : (
          <span className="admin-offline">Offline — check .env file</span>
        )}
        {todayOrderCount > 0 && (
          <span className="admin-stat-pill">📦 {todayOrderCount} order{todayOrderCount !== 1 ? 's' : ''} today</span>
        )}
        {placed > 0 && todayOrderCount === 0 && (
          <span className="admin-stat-pill">📦 {placed} placed (all time)</span>
        )}
      </div>

      <div className="admin-stats">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.1} />
        ))}
      </div>

      <DashboardPanel
        title="Recent Orders"
        icon="🛒"
        accent="#FF6B35"
        to="/admin/orders"
        count={orders.length}
        emptyIcon="🛒"
        emptyTitle="No orders yet"
        emptyText="Customers add items to cart, checkout with their details, and orders appear here instantly."
        delay={0.35}
      >
        {recentOrders.length > 0
          ? recentOrders.map((o) => <OrderFeedItem key={o.id} item={o} />)
          : null}
      </DashboardPanel>
    </div>
  );
}
