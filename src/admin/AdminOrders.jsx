import { useEffect, useState } from 'react';
import {
  subscribeOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  mergeOrders,
  forwardOrderToStaff,
} from '../firebase/services';
import { useAuth } from '../context/AuthContext';
import OrderReceipt from './components/OrderReceipt';
import { openCustomerOrderWhatsApp, formatWhatsAppPhone } from '../utils/orderUtils';
import '../staff/staff.css';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function getItemsList(o) {
  if (Array.isArray(o.items)) return o.items;
  return [];
}

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'with_staff', 'done', 'placed', 'cancelled'];
const STATUS_STEPS = ['pending', 'confirmed', 'placed'];

function StaffStatusBadge({ order }) {
  if (!order.forwardedToStaff) return null;
  const label = order.staffStatus === 'done' ? 'Kitchen Ready ✓'
    : order.staffStatus === 'preparing' ? 'Preparing…'
    : 'With Staff';
  const cls = order.staffStatus === 'done' ? 'done' : 'with_staff';
  return <span className={`admin-badge admin-badge-${cls}`}>{label}</span>;
}

function StatusStepper({ status, onChange, disabled }) {
  return (
    <div className="admin-status-stepper">
      {STATUS_STEPS.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled || status === 'cancelled'}
          className={`admin-status-step admin-status-step-${s}${status === s ? ' active' : ''}`}
          onClick={() => onChange(s)}
        >
          {s === 'pending' && '⏳'}
          {s === 'confirmed' && '✅'}
          {s === 'placed' && '📦'}
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </button>
      ))}
    </div>
  );
}

function OrderCard({ order, mergeMode, selected, onSelect, onStatus, onReceipt, onDelete, onForwardToStaff, forwardingId }) {
  const items = getItemsList(order);
  const initial = (order.customerName?.[0] || 'C').toUpperCase();
  const customerPhone = formatWhatsAppPhone(order.contact);
  const canWhatsApp = Boolean(customerPhone) && order.status !== 'cancelled';

  return (
    <article className={`admin-order-card${selected ? ' selected' : ''}`}>
      {mergeMode && (
        <label className="admin-order-merge-check">
          <input type="checkbox" checked={selected} onChange={onSelect} />
          <span>Select to merge</span>
        </label>
      )}

      <div className="admin-order-card-top">
        <div className="admin-order-card-customer">
          <div className="admin-order-avatar">{initial}</div>
          <div>
            <h3 className="admin-order-name">{order.customerName || 'Customer'}</h3>
            <p className="admin-order-contact">{order.contact || '—'}</p>
          </div>
        </div>
        <div className="admin-order-card-meta">
          <code className="admin-order-id">{order.orderId || '—'}</code>
          <StaffStatusBadge order={order} />
          <span className="admin-order-date">{formatDate(order.createdAt)}</span>
        </div>
      </div>

      <div className="admin-order-items">
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className="admin-order-item-chip">
            <span>{item.emoji || '🍔'}</span>
            <span className="admin-order-item-name">{item.name}</span>
            <span className="admin-order-item-qty">×{item.qty}</span>
            <span className="admin-order-item-price">PKR {(item.price * item.qty).toLocaleString()}</span>
          </div>
        )) : (
          <p className="admin-order-items-text">{order.itemsText || order.items || '—'}</p>
        )}
      </div>

      {order.address && (
        <p className="admin-order-address">📍 {order.address}</p>
      )}

      <div className="admin-order-card-bottom">
        <div className="admin-order-total">
          <span>Total</span>
          <strong>PKR {(order.total || 0).toLocaleString()}</strong>
        </div>

        {order.status === 'cancelled' ? (
          <span className="admin-badge admin-badge-cancelled">Cancelled</span>
        ) : order.status === 'with_staff' ? (
          <span className="admin-badge admin-badge-with_staff">👨‍🍳 With Kitchen</span>
        ) : order.status === 'done' ? (
          <div className="admin-order-done-row">
            <span className="admin-badge admin-badge-done">✅ Kitchen Ready</span>
            <button type="button" className="admin-status-step admin-status-step-placed" onClick={() => onStatus(order.id, 'placed')}>
              📦 Mark Placed
            </button>
          </div>
        ) : (
          <StatusStepper status={order.status} onChange={(s) => onStatus(order.id, s)} />
        )}

        {canWhatsApp && (
          <button
            type="button"
            className="admin-order-whatsapp-btn"
            onClick={() => openCustomerOrderWhatsApp(order)}
            title={`Send ${order.status || 'order'} update to ${order.customerName || 'customer'} on WhatsApp`}
          >
            <span className="admin-order-wa-icon" aria-hidden>📲</span>
            WhatsApp Update
          </button>
        )}

        <div className="admin-order-card-actions">
          {!order.forwardedToStaff && ['pending', 'confirmed'].includes(order.status) && (
            <button
              type="button"
              className="admin-order-action-btn staff"
              disabled={forwardingId === order.id}
              onClick={() => onForwardToStaff(order.id)}
            >
              {forwardingId === order.id ? 'Sending…' : '👨‍🍳 Send to Staff'}
            </button>
          )}
          <button type="button" className="admin-order-action-btn" onClick={() => onReceipt(order)}>
            🧾 Receipt
          </button>
          {order.status !== 'cancelled' && (
            <button type="button" className="admin-order-action-btn warn" onClick={() => onStatus(order.id, 'cancelled')}>
              Cancel
            </button>
          )}
          <button type="button" className="admin-order-action-btn danger" onClick={() => onDelete(order.id)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AdminOrders() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [merging, setMerging] = useState(false);
  const [forwardingId, setForwardingId] = useState(null);
  const [form, setForm] = useState({ customerName: '', contact: '', items: '', total: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeOrders((data) => setItems(data)), []);

  const visible = items.filter((o) => {
    if (o.status === 'merged' || o.mergedInto) return false;
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const counts = {
    all: items.filter((o) => o.status !== 'merged').length,
    pending: items.filter((o) => o.status === 'pending').length,
    confirmed: items.filter((o) => o.status === 'confirmed').length,
    with_staff: items.filter((o) => o.status === 'with_staff').length,
    done: items.filter((o) => o.status === 'done').length,
    placed: items.filter((o) => o.status === 'placed').length,
    cancelled: items.filter((o) => o.status === 'cancelled').length,
  };

  const handleForwardToStaff = async (orderId) => {
    if (!window.confirm('Send this order to kitchen staff?')) return;
    setForwardingId(orderId);
    try {
      await forwardOrderToStaff(orderId, user?.email || '');
    } catch (err) {
      alert(err.message || 'Could not forward order');
    } finally {
      setForwardingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createOrder({
        customerName: form.customerName,
        contact: form.contact,
        items: form.items,
        total: parseInt(form.total, 10) || 0,
        notes: form.notes,
        source: 'manual',
      });
      setForm({ customerName: '', contact: '', items: '', total: '', notes: '' });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleMerge = async () => {
    if (selected.length !== 2) return;
    const [primaryId, secondaryId] = selected;
    if (!window.confirm('Merge the second selected order into the first?')) return;
    setMerging(true);
    try {
      await mergeOrders(primaryId, secondaryId);
      setSelected([]);
      setMergeMode(false);
    } catch (err) {
      alert(err.message || 'Merge failed');
    } finally {
      setMerging(false);
    }
  };

  return (
    <>
      {receiptOrder && <OrderReceipt order={receiptOrder} onClose={() => setReceiptOrder(null)} />}

      <div className="admin-orders-header">
        <div>
          <p className="admin-page-sub">Manage orders in realtime · merge manually when needed</p>
        </div>
        <div className="admin-filter-bar">
          <button
            type="button"
            className={`admin-btn-sm${mergeMode ? ' success' : ''}`}
            onClick={() => { setMergeMode(!mergeMode); setSelected([]); }}
          >
            {mergeMode ? '✕ Cancel' : '🔗 Merge'}
          </button>
          {mergeMode && selected.length === 2 && (
            <button type="button" className="admin-btn-sm success" onClick={handleMerge} disabled={merging}>
              {merging ? 'Merging…' : 'Merge 2 Orders'}
            </button>
          )}
          <button type="button" className="admin-btn-sm success" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Order'}
          </button>
        </div>
      </div>

      <div className="admin-order-tabs">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`admin-order-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="admin-order-tab-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {mergeMode && (
        <p className="admin-merge-hint">Select 2 orders — the <strong>first</strong> selected stays as the main order.</p>
      )}

      {showForm && (
        <div className="admin-panel admin-panel-rich" style={{ marginBottom: 24, '--panel-accent': '#FF6B35' }}>
          <div className="admin-panel-head"><div className="admin-panel-title">Log New Order</div></div>
          <form onSubmit={handleCreate}>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label className="admin-label">Customer Name</label>
                <input className="admin-input" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
              </div>
              <div className="admin-field">
                <label className="admin-label">Contact</label>
                <input className="admin-input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="03xx…" />
              </div>
              <div className="admin-field">
                <label className="admin-label">Total (PKR)</label>
                <input className="admin-input" type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} required />
              </div>
              <div className="admin-field full">
                <label className="admin-label">Items</label>
                <input className="admin-input" placeholder="2x Zinger Burger, 1x Fries…" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} required />
              </div>
              <div className="admin-field full">
                <label className="admin-label">Notes / Address</label>
                <input className="admin-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn" style={{ width: 'auto', padding: '12px 32px' }} disabled={saving}>
                {saving ? 'Saving…' : 'Save Order'}
              </button>
            </div>
          </form>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="admin-empty-rich" style={{ padding: '80px 24px' }}>
          <div className="admin-empty-orbit">
            <span className="admin-empty-ring" style={{ borderColor: 'rgba(255,107,53,0.3)' }} />
            <span className="admin-empty-icon">🛒</span>
          </div>
          <p className="admin-empty-title">No orders here</p>
          <p className="admin-empty-text">Orders appear when customers place them from the website cart.</p>
        </div>
      ) : (
        <div className="admin-order-list">
          {visible.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              mergeMode={mergeMode}
              selected={selected.includes(o.id)}
              onSelect={() => toggleSelect(o.id)}
              onStatus={updateOrderStatus}
              onReceipt={setReceiptOrder}
              onForwardToStaff={handleForwardToStaff}
              forwardingId={forwardingId}
              onDelete={(id) => { if (window.confirm('Delete this order?')) deleteOrder(id); }}
            />
          ))}
        </div>
      )}
    </>
  );
}
