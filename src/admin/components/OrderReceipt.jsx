import { calcOrderTotal } from '../../utils/orderUtils';
import { buildCartReceipt } from '../../utils/spinReward';
import { DEFAULT_SETTINGS } from '../../utils/siteSettings';

function formatDateTime(ts) {
  if (!ts) return new Date().toLocaleString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function receiptNumber(order) {
  const raw = order.orderId || order.id || '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 6) return digits.slice(-6);
  return raw.slice(-8).toUpperCase() || '000000';
}

function getItems(order) {
  if (Array.isArray(order.items)) return order.items;
  return [];
}

export default function OrderReceipt({ order, onClose }) {
  if (!order) return null;

  const items = getItems(order);
  const receipt = buildCartReceipt(items);
  const deliveryFee = Number(order.deliveryFee) || 0;
  const grandTotal = order.total ?? receipt.total ?? calcOrderTotal(items);
  const receiptNo = receiptNumber(order);
  const paid = order.paidAmount ?? grandTotal;
  const balance = Math.max(0, grandTotal - paid);

  const handlePrint = () => window.print();

  return (
    <div className="admin-receipt-overlay" onClick={onClose}>
      <div className="admin-receipt pos-receipt-wrap" onClick={(e) => e.stopPropagation()}>
        <div className="admin-receipt-actions no-print">
          <button type="button" className="admin-btn-sm" onClick={onClose}>Close</button>
          <button type="button" className="admin-btn-sm success" onClick={handlePrint}>🖨️ Print Receipt</button>
        </div>

        <div className="pos-receipt-paper admin-receipt-paper">
          {/* Header — store info */}
          <div className="pos-header">
            <p className="pos-store-name">HOT<span>SI</span></p>
            <p className="pos-address">{DEFAULT_SETTINGS.address}</p>
            <p className="pos-free-delivery">For Free Delivery:</p>
            <p className="pos-phones">Iqbal Town: {DEFAULT_SETTINGS.phone}</p>
            <p className="pos-phones">WhatsApp: {DEFAULT_SETTINGS.whatsapp}</p>
          </div>

          <div className="pos-rule" />

          {/* Order type + receipt no */}
          <div className="pos-meta-row">
            <strong>Delivery</strong>
            <span>Receipt No: {receiptNo}</span>
          </div>

          {/* Items table */}
          <table className="pos-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? items.map((item, i) => {
                const unit = item.price || 0;
                const lineTotal = unit * (item.qty || 1);
                return (
                  <tr key={i}>
                    <td className="pos-item-name">
                      {item.name}
                      {item.spinNote && <span className="pos-free-tag">FREE</span>}
                    </td>
                    <td>{item.qty || 1}</td>
                    <td>{formatMoney(unit)}</td>
                    <td>{formatMoney(lineTotal)}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="pos-fallback">{order.itemsText || order.items || '—'}</td>
                </tr>
              )}
              {deliveryFee > 0 && (
                <tr>
                  <td>Delivery Charges..</td>
                  <td>1</td>
                  <td>{formatMoney(deliveryFee)}</td>
                  <td>{formatMoney(deliveryFee)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {receipt.savings > 0 && (
            <p className="pos-savings">Spin savings: − Rs {formatMoney(receipt.savings)}</p>
          )}

          <div className="pos-rule" />

          <div className="pos-grand-total">
            <strong>Grand Total Rs {formatMoney(grandTotal)}</strong>
          </div>
          <div className="pos-paid-row">
            <span>Paid Rs {formatMoney(paid)}</span>
          </div>
          <div className="pos-paid-row">
            <span>Balance Rs {formatMoney(balance)}</span>
          </div>

          <div className="pos-end-sale">End of Sale</div>

          <div className="pos-payment-block">
            <p><strong>Payment:</strong> {order.paymentMethod || 'Cash'}</p>
            <p><strong>Staff Name:</strong> HOTSI</p>
            <p><strong>Time:</strong> {formatDateTime(order.createdAt)}</p>
            <p className="pos-status no-print"><strong>Status:</strong> {order.status || 'pending'}</p>
          </div>

          <div className="pos-rule" />

          {/* Delivery order details */}
          <div className="pos-delivery-block">
            <p className="pos-delivery-title">Delivery Order</p>
            <div className="pos-delivery-grid">
              <span>Courier</span><strong>{order.courier || '—'}</strong>
              <span>Recipient</span><strong>{order.customerName || '—'}</strong>
              <span>Contact No</span><strong>{order.contact || '—'}</strong>
              <span>Address</span><strong>{order.address || order.notes || '—'}</strong>
            </div>
          </div>

          <div className="pos-rule" />

          <div className="pos-footer-msg">
            <p className="pos-enjoy">ENJOY YOUR MEAL</p>
            <p>Thanks For Coming</p>
          </div>

          <div className="pos-print-footer">
            <span>HOTSI · hotsi-web</span>
            <span>Printed {formatDateTime(new Date())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
