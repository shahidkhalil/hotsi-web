const ADMIN_WHATSAPP = '923404112112';

export function calcOrderTotal(items) {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

export function formatItemsText(items) {
  if (!Array.isArray(items)) return String(items || '');
  return items.map((i) => `${i.name} x${i.qty}`).join(', ');
}

export function normalizeContact(contact) {
  return (contact || '').replace(/\D/g, '');
}

export function generateOrderId() {
  const part = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `HOTSI-${part}${rand}`;
}

export function mergeItemArrays(existing, incoming) {
  const merged = (Array.isArray(existing) ? existing : []).map((i) => ({ ...i }));
  (Array.isArray(incoming) ? incoming : []).forEach((item) => {
    const found = merged.find((i) => i.name === item.name && i.price === item.price);
    if (found) found.qty += item.qty;
    else merged.push({ ...item });
  });
  return merged;
}

export function buildAdminOrderNotification({ name, contact, address, orderId }, items, total) {
  const now = new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
  let msg = '🔔 *NEW ORDER — HOTSI* 🔔\n';
  msg += '━━━━━━━━━━━━━━━━━━━━\n\n';
  msg += `🧾 *Order ID:* ${orderId}\n`;
  msg += `🕐 *Received:* ${now}\n`;
  msg += '📌 *Status:* Pending\n\n';
  msg += '👤 *CUSTOMER*\n';
  msg += `• Name: ${name}\n`;
  msg += `• Phone: ${contact}\n`;
  msg += `• Address: ${address}\n\n`;
  msg += '🛒 *ITEMS*\n';
  items.forEach((i) => {
    msg += `  ${i.emoji || '🍔'} *${i.name}*\n     ×${i.qty}  —  PKR ${(i.price * i.qty).toLocaleString()}\n`;
  });
  msg += '\n━━━━━━━━━━━━━━━━━━━━\n';
  msg += `💰 *TOTAL: PKR ${total.toLocaleString()}*\n`;
  msg += '━━━━━━━━━━━━━━━━━━━━';
  return msg;
}

/** Opens WhatsApp to admin with full order details pre-filled */
export function openAdminOrderNotification(customer, items, total, orderId) {
  const msg = buildAdminOrderNotification({ ...customer, orderId }, items, total);
  window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
}

export function openWhatsAppContact() {
  window.open(`https://wa.me/${ADMIN_WHATSAPP}`, '_blank');
}
