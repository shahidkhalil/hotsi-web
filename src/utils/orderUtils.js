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

/** Pakistan-friendly WhatsApp number for wa.me links */
export function formatWhatsAppPhone(contact) {
  let digits = normalizeContact(contact);
  if (!digits) return '';
  if (digits.startsWith('0')) digits = `92${digits.slice(1)}`;
  else if (digits.length === 10 && digits.startsWith('3')) digits = `92${digits}`;
  return digits;
}

const ORDER_STATUS_WHATSAPP = {
  pending: {
    badge: '⏳ *ORDER RECEIVED*',
    headline: 'We\'ve received your order and it\'s in our queue! 🎉',
    body: 'Our team will confirm it shortly. Sit tight — something delicious is on the way! 😊',
  },
  confirmed: {
    badge: '✅ *ORDER CONFIRMED*',
    headline: 'Your order has been confirmed! 🙌',
    body: 'Everything looks perfect. We\'re getting started on your order right away! ✨',
  },
  with_staff: {
    badge: '👨‍🍳 *IN THE KITCHEN*',
    headline: 'Great news — your order is now being prepared fresh! 🔥🍳',
    body: 'Our chefs are cooking your meal with care. It won\'t be long now! ⏱️',
  },
  done: {
    badge: '🍽️ *ALMOST READY*',
    headline: 'Your order is ready and being packed! 📦✨',
    body: 'We\'re putting the finishing touches on your order. Delivery is coming soon! 🛵💨',
  },
  placed: {
    badge: '🚀 *ON THE WAY*',
    headline: 'Your HOTSI order is on its way to you! 🛵🔥',
    body: 'Get ready — hot, fresh food is heading to your door. Enjoy every bite! 😋',
  },
  default: {
    badge: '🔥 *ORDER UPDATE*',
    headline: 'Your order is being prepared fresh in our kitchen! 🍳✨',
    body: 'Our team is working on it right now. You\'ll receive your order hot and fresh very soon! 🤍',
  },
};

function getOrderItemsBlock(order) {
  if (Array.isArray(order.items) && order.items.length > 0) {
    return order.items
      .map((i) => `   ${i.emoji || '🍔'} *${i.name}*  ×${i.qty}  —  PKR ${(i.price * i.qty).toLocaleString()}`)
      .join('\n');
  }
  return `   🍽️ ${order.itemsText || order.items || 'Your order items'}`;
}

export function buildCustomerOrderStatusMessage(order) {
  const name = order.customerName || 'there';
  const orderId = order.orderId || '—';
  const address = order.address || order.notes || 'As provided';
  const total = Number(order.total) || 0;
  const status = order.status || 'default';
  const copy = ORDER_STATUS_WHATSAPP[status] || ORDER_STATUS_WHATSAPP.default;
  const itemsBlock = getOrderItemsBlock(order);

  return (
    `✨ *HOTSI* ✨\n`
    + `━━━━━━━━━━━━━━━━━━━━\n\n`
    + `Hey *${name}*! 👋😊\n\n`
    + `${copy.badge}\n`
    + `${copy.headline}\n\n`
    + `${copy.body}\n\n`
    + `━━━━━━━━━━━━━━━━━━━━\n`
    + `🧾 *Order ID:* \`${orderId}\`\n\n`
    + `🛒 *Your Order:*\n`
    + `${itemsBlock}\n\n`
    + `📍 *Delivery Address:*\n   ${address}\n\n`
    + `💵 *Total Amount:*\n   *PKR ${total.toLocaleString()}* 💰\n\n`
    + `━━━━━━━━━━━━━━━━━━━━\n\n`
    + `🙏 Thank you for choosing *HOTSI*!\n`
    + `We can't wait for you to enjoy your meal. ❤️🔥\n\n`
    + `📞 Questions? Just reply to this message!\n`
    + `🌐 *More Than Fast Food — It's The HOTSI Experience* 🍔🍕🌯`
  );
}

/** @deprecated use buildCustomerOrderStatusMessage */
export function buildCustomerPreparingMessage(order) {
  return buildCustomerOrderStatusMessage(order);
}

/** Opens WhatsApp to the customer with order details and preparing message */
export function openCustomerOrderWhatsApp(order) {
  const phone = formatWhatsAppPhone(order.contact);
  if (!phone) {
    alert('No valid customer phone number on this order.');
    return;
  }
  const msg = buildCustomerOrderStatusMessage(order);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
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
