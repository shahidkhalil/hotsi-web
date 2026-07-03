import { calcOrderTotal } from '../../utils/orderUtils';

function formatDate(ts) {
  if (!ts) return new Date().toLocaleString('en-PK');
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getItems(order) {
  if (Array.isArray(order.items)) return order.items;
  return [];
}

export default function OrderReceipt({ order, onClose }) {
  if (!order) return null;

  const items = getItems(order);
  const total = order.total ?? calcOrderTotal(items);
  const orderId = order.orderId || order.id?.slice(0, 8).toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-receipt-overlay" onClick={onClose}>
      <div className="admin-receipt" onClick={(e) => e.stopPropagation()}>
        <div className="admin-receipt-actions no-print">
          <button type="button" className="admin-btn-sm" onClick={onClose}>Close</button>
          <button type="button" className="admin-btn-sm success" onClick={handlePrint}>🖨️ Print Receipt</button>
        </div>

        <div className="admin-receipt-paper">
          <div className="admin-receipt-brand">HOT<span>SI</span></div>
          <p className="admin-receipt-tagline">Flame-Grilled Perfection · Lahore</p>
          <div className="admin-receipt-divider" />

          <div className="admin-receipt-row">
            <span>Order ID</span>
            <strong>{orderId}</strong>
          </div>
          <div className="admin-receipt-row">
            <span>Date</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>
          <div className="admin-receipt-row">
            <span>Status</span>
            <strong className={`admin-badge admin-badge-${order.status}`}>{order.status}</strong>
          </div>

          <div className="admin-receipt-divider" />
          <p className="admin-receipt-section">Customer</p>
          <div className="admin-receipt-row"><span>Name</span><strong>{order.customerName || '—'}</strong></div>
          <div className="admin-receipt-row"><span>Contact</span><strong>{order.contact || '—'}</strong></div>
          <div className="admin-receipt-row"><span>Address</span><strong>{order.address || order.notes || '—'}</strong></div>

          <div className="admin-receipt-divider" />
          <p className="admin-receipt-section">Items</p>
          {items.length > 0 ? (
            <table className="admin-receipt-table">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.emoji || ''} {item.name}</td>
                    <td>{item.qty}</td>
                    <td>PKR {(item.price * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="admin-receipt-fallback">{order.itemsText || order.items || '—'}</p>
          )}

          <div className="admin-receipt-total">
            <span>Total</span>
            <strong>PKR {total.toLocaleString()}</strong>
          </div>

          {order.mergeHistory?.length > 0 && (
            <>
              <div className="admin-receipt-divider" />
              <p className="admin-receipt-section">Merge History</p>
              {order.mergeHistory.map((m, i) => (
                <p key={i} className="admin-receipt-merge">
                  + {m.source === 'auto' ? 'Auto-merged' : 'Admin merged'} · PKR {(m.subtotal || 0).toLocaleString()}
                </p>
              ))}
            </>
          )}

          <div className="admin-receipt-divider" />
          <p className="admin-receipt-footer">Plot 505, Karim Block, Allama Iqbal Town, Lahore</p>
          <p className="admin-receipt-footer">0340 4112112 · Thank you for ordering!</p>
        </div>
      </div>
    </div>
  );
}
