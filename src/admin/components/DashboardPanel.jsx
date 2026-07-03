import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

function timeAgo(ts) {
  if (!ts) return 'Just now';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export default function DashboardPanel({
  title,
  icon,
  accent,
  to,
  emptyIcon,
  emptyTitle,
  emptyText,
  count,
  children,
  delay = 0,
}) {
  const panelRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.65, delay, ease: 'power3.out' });
  }, [delay]);

  useEffect(() => {
    const rows = listRef.current?.querySelectorAll('.admin-feed-item');
    if (!rows?.length) return;
    gsap.fromTo(
      rows,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out' },
    );
  }, [children]);

  return (
    <div ref={panelRef} className="admin-panel admin-panel-rich" style={{ '--panel-accent': accent }}>
      <div className="admin-panel-head">
        <div className="admin-panel-title-wrap">
          <span className="admin-panel-icon" style={{ background: `${accent}18`, borderColor: `${accent}35` }}>{icon}</span>
          <div>
            <div className="admin-panel-title">{title}</div>
            <div className="admin-panel-sub">{count} total · updates in realtime</div>
          </div>
        </div>
        <Link to={to} className="admin-btn-sm admin-btn-glow">View All →</Link>
      </div>

      {children ? (
        <div ref={listRef} className="admin-feed">{children}</div>
      ) : (
        <div className="admin-empty-rich">
          <div className="admin-empty-orbit">
            <span className="admin-empty-ring" style={{ borderColor: `${accent}30` }} />
            <span className="admin-empty-ring admin-empty-ring-2" style={{ borderColor: `${accent}18` }} />
            <span className="admin-empty-icon">{emptyIcon}</span>
          </div>
          <p className="admin-empty-title">{emptyTitle}</p>
          <p className="admin-empty-text">{emptyText}</p>
        </div>
      )}
    </div>
  );
}

export function OrderFeedItem({ item }) {
  const initial = (item.customerName?.[0] || 'C').toUpperCase();
  const status = item.status || 'pending';
  const itemsPreview = Array.isArray(item.items)
    ? item.items.map((i) => i.name).slice(0, 2).join(', ')
    : (item.itemsText || item.items || '').toString().slice(0, 40);

  return (
    <div className="admin-feed-item">
      <div className="admin-feed-avatar" style={{ background: 'linear-gradient(135deg, #FF6B35, #e85a28)' }}>{initial}</div>
      <div className="admin-feed-content">
        <div className="admin-feed-top">
          <strong>{item.customerName || 'Customer'}</strong>
          <span className={`admin-badge admin-badge-${status}`}>{status}</span>
        </div>
        <div className="admin-feed-meta">
          <span className="admin-order-id-sm">{item.orderId || '—'}</span>
          <span>·</span>
          <span>{item.contact || 'No contact'}</span>
          {itemsPreview && <><span>·</span><span className="admin-feed-truncate">{itemsPreview}</span></>}
        </div>
      </div>
      <div className="admin-feed-right">
        <strong className="admin-feed-price">PKR {(item.total || 0).toLocaleString()}</strong>
        <span className="admin-feed-time">{timeAgo(item.createdAt)}</span>
      </div>
    </div>
  );
}
