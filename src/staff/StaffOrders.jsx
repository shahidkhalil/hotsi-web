import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  subscribeStaffOrders,
  updateStaffOrderStatus,
  markStaffOrderDone,
} from '../firebase/services';
import '../admin/admin.css';
import './staff.css';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function getItemsList(o) {
  if (Array.isArray(o.items)) return o.items;
  return [];
}

const STAFF_FILTERS = [
  { id: 'active', label: 'Active', match: (o) => ['assigned', 'preparing'].includes(o.staffStatus) },
  { id: 'done', label: 'Done', match: (o) => o.staffStatus === 'done' },
  { id: 'all', label: 'All', match: () => true },
];

function StaffOrderCard({ order, onStart, onDone, busy }) {
  const cardRef = useRef(null);
  const items = getItemsList(order);
  const initial = (order.customerName?.[0] || 'C').toUpperCase();
  const isActive = ['assigned', 'preparing'].includes(order.staffStatus);
  const isPreparing = order.staffStatus === 'preparing';
  const isDone = order.staffStatus === 'done';

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;
    gsap.fromTo(
      el,
      { opacity: 0, y: 32, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.4)' },
    );
    return () => gsap.killTweensOf(el);
  }, [order.id]);

  return (
    <article
      ref={cardRef}
      className={`staff-order-card staff-status-${order.staffStatus || 'assigned'}${isDone ? ' is-done' : ''}`}
    >
      <div className="staff-order-pulse" aria-hidden />

      <div className="staff-order-header">
        <div className="staff-order-customer">
          <div className="staff-order-avatar">{initial}</div>
          <div>
            <h3>{order.customerName || 'Customer'}</h3>
            <p>{order.contact || '—'}</p>
          </div>
        </div>
        <div className="staff-order-meta">
          <code>{order.orderId || '—'}</code>
          <span>{formatDate(order.forwardedAt || order.createdAt)}</span>
        </div>
      </div>

      <div className="staff-order-status-row">
        <span className={`staff-badge staff-badge-${order.staffStatus || 'assigned'}`}>
          {order.staffStatus === 'assigned' && '⏳ New'}
          {order.staffStatus === 'preparing' && '🔥 Preparing'}
          {order.staffStatus === 'done' && '✅ Ready'}
        </span>
        {order.forwardedBy && (
          <span className="staff-forwarded-by">From admin · {order.forwardedBy}</span>
        )}
      </div>

      <ul className="staff-order-items">
        {items.length > 0 ? items.map((item, i) => (
          <li key={i}>
            <span className="staff-item-emoji">{item.emoji || '🍔'}</span>
            <span className="staff-item-name">{item.name}</span>
            <span className="staff-item-qty">×{item.qty}</span>
          </li>
        )) : (
          <li className="staff-item-fallback">{order.itemsText || order.items || '—'}</li>
        )}
      </ul>

      {order.address && (
        <p className="staff-order-address">📍 {order.address}</p>
      )}

      {order.notes && (
        <p className="staff-order-notes">📝 {order.notes}</p>
      )}

      <div className="staff-order-footer">
        <div className="staff-order-total">
          <span>Total</span>
          <strong>PKR {(order.total || 0).toLocaleString()}</strong>
        </div>

        {isActive && (
          <div className="staff-order-actions">
            {!isPreparing && (
              <button
                type="button"
                className="staff-action-btn staff-action-prepare"
                disabled={busy}
                onClick={() => onStart(order.id)}
              >
                🔥 Start Preparing
              </button>
            )}
            <button
              type="button"
              className="staff-action-btn staff-action-done"
              disabled={busy}
              onClick={() => onDone(order.id)}
            >
              ✅ Mark Ready
            </button>
          </div>
        )}

        {isDone && (
          <div className="staff-done-banner">
            <span>✓ Sent to admin — order is ready for pickup/delivery</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active');
  const [busyId, setBusyId] = useState(null);
  const headerRef = useRef(null);
  const prevCountRef = useRef(0);

  useEffect(() => subscribeStaffOrders(setOrders), []);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, []);

  useEffect(() => {
    const activeCount = orders.filter((o) => ['assigned', 'preparing'].includes(o.staffStatus)).length;
    if (activeCount > prevCountRef.current && prevCountRef.current > 0) {
      document.querySelector('.staff-live')?.classList.add('staff-live-flash');
      setTimeout(() => document.querySelector('.staff-live')?.classList.remove('staff-live-flash'), 1200);
    }
    prevCountRef.current = activeCount;
  }, [orders]);

  const visible = orders.filter((o) => {
    const f = STAFF_FILTERS.find((x) => x.id === filter);
    return f ? f.match(o) : true;
  });

  const counts = {
    active: orders.filter((o) => ['assigned', 'preparing'].includes(o.staffStatus)).length,
    done: orders.filter((o) => o.staffStatus === 'done').length,
    all: orders.length,
  };

  const handleStart = async (id) => {
    setBusyId(id);
    try {
      await updateStaffOrderStatus(id, 'preparing');
    } catch (err) {
      alert(err.message || 'Could not update status');
    } finally {
      setBusyId(null);
    }
  };

  const handleDone = async (id) => {
    if (!window.confirm('Mark this order as ready for admin?')) return;
    setBusyId(id);
    try {
      await markStaffOrderDone(id);
    } catch (err) {
      alert(err.message || 'Could not mark done');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="staff-orders-page">
      <div ref={headerRef} className="staff-page-header">
        <div>
          <h1 className="staff-page-title">Kitchen Orders</h1>
          <p className="staff-page-sub">Orders forwarded by admin appear here in real time</p>
        </div>
        <div className="staff-stat-chips">
          <span className="staff-stat-chip">
            <strong>{counts.active}</strong> active
          </span>
          <span className="staff-stat-chip done">
            <strong>{counts.done}</strong> ready
          </span>
        </div>
      </div>

      <div className="staff-tabs">
        {STAFF_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`staff-tab${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="staff-tab-count">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="staff-empty">
          <div className="staff-empty-icon">🍳</div>
          <h2>No orders {filter === 'active' ? 'in the queue' : 'here'}</h2>
          <p>When admin sends an order to kitchen, it will show up here instantly.</p>
        </div>
      ) : (
        <div className="staff-order-grid">
          {visible.map((o) => (
            <StaffOrderCard
              key={o.id}
              order={o}
              busy={busyId === o.id}
              onStart={handleStart}
              onDone={handleDone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
