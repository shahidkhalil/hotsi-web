import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  writeBatch,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import {
  calcOrderTotal,
  formatItemsText,
  generateOrderId,
  mergeItemArrays,
  normalizeContact,
} from '../utils/orderUtils';
import {
  buildRevenueSnapshots,
  getContributionDelta,
  getOrderDate,
  getPeriodKeysForDate,
  revenueDocId,
  formatPeriodLabel,
  parseRevenueDocId,
  emptyRevenueSnapshot,
} from '../utils/revenueUtils';
import { extractAllMenuProducts } from './seedMenu';

function toMillis(ts) {
  if (!ts) return 0;
  if (ts.toDate) return ts.toDate().getTime();
  if (ts.seconds) return ts.seconds * 1000;
  return new Date(ts).getTime() || 0;
}

function mapDocs(snap) {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function sortByCreatedDesc(items) {
  return [...items].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

function enrichOrder(data) {
  const status = data.status === 'new' ? 'pending' : (data.status || 'pending');
  return { ...data, status };
}

/** Realtime listener with ordered query + fallback if index/field missing */
function subscribeCollection(collectionName, callback) {
  if (!isFirebaseConfigured || !db) {
    callback([], { live: false, error: null });
    return () => {};
  }

  let fallbackUnsub = null;
  const col = collection(db, collectionName);
  const ordered = query(col, orderBy('createdAt', 'desc'));

  const unsub = onSnapshot(
    ordered,
    (snap) => callback(mapDocs(snap).map(enrichOrder), { live: true, error: null }),
    (err) => {
      console.warn(`[HOTSI] ${collectionName} ordered query failed, using fallback:`, err.code);
      fallbackUnsub = onSnapshot(
        col,
        (snap) => callback(sortByCreatedDesc(mapDocs(snap)).map(enrichOrder), { live: true, error: err.message }),
        (err2) => {
          console.error(`[HOTSI] ${collectionName} snapshot failed:`, err2.code);
          callback([], { live: false, error: err2.message });
        },
      );
    },
  );

  return () => {
    unsub();
    fallbackUnsub?.();
  };
}

function requireDb() {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. See FIREBASE_SETUP.md');
  }
  return db;
}

/* ── Revenue ──────────────────────────────────────────────── */
async function applyRevenueDelta(orderDate, delta) {
  if (
    delta.total === 0 && delta.orderCount === 0
    && delta.completedTotal === 0 && delta.pendingTotal === 0
  ) return;

  const database = requireDb();
  const keys = getPeriodKeysForDate(orderDate);
  const periods = [
    { period: 'daily', periodKey: keys.daily },
    { period: 'weekly', periodKey: keys.weekly },
    { period: 'monthly', periodKey: keys.monthly },
  ];

  await Promise.all(periods.map(({ period, periodKey }) => {
    const id = revenueDocId(period, periodKey);
    return setDoc(doc(database, 'revenue', id), {
      period,
      periodKey,
      periodLabel: formatPeriodLabel(period, periodKey),
      periodStart: periodKey,
      total: increment(delta.total),
      completedTotal: increment(delta.completedTotal),
      pendingTotal: increment(delta.pendingTotal),
      orderCount: increment(delta.orderCount),
      completedCount: increment(delta.completedCount),
      pendingCount: increment(delta.pendingCount),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }));
}

async function syncRevenueDelta(before, after) {
  if (!isFirebaseConfigured || !db) return;
  try {
    const delta = getContributionDelta(before, after);
    const orderDate = getOrderDate(after || before);
    await applyRevenueDelta(orderDate, delta);
  } catch (err) {
    console.error('[HOTSI] syncRevenueDelta failed:', err);
  }
}

/** Rebuild all revenue snapshots from orders — resets stale/negative values */
export async function rebuildAllRevenue() {
  const database = requireDb();
  const [ordersSnap, revenueSnap] = await Promise.all([
    getDocs(collection(database, 'orders')),
    getDocs(collection(database, 'revenue')),
  ]);
  const orders = sortByCreatedDesc(mapDocs(ordersSnap)).map(enrichOrder);
  const snapshotMap = buildRevenueSnapshots(orders);

  const allIds = new Set([
    ...revenueSnap.docs.map((d) => d.id),
    ...snapshotMap.keys(),
  ]);

  const writes = [...allIds].map((id) => {
    const computed = snapshotMap.get(id);
    if (computed) return { id, data: computed };
    const { period, periodKey } = parseRevenueDocId(id);
    return { id, data: emptyRevenueSnapshot(period, periodKey) };
  });

  for (let i = 0; i < writes.length; i += 400) {
    const batch = writeBatch(database);
    writes.slice(i, i + 400).forEach(({ id, data }) => {
      batch.set(doc(database, 'revenue', id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  }

  return { periods: snapshotMap.size, updated: writes.length };
}

export function subscribeRevenue(callback) {
  if (!isFirebaseConfigured || !db) {
    callback([], { live: false, error: null });
    return () => {};
  }

  let fallbackUnsub = null;
  const col = collection(db, 'revenue');
  const ordered = query(col, orderBy('periodKey', 'desc'));

  const unsub = onSnapshot(
    ordered,
    (snap) => callback(mapDocs(snap), { live: true, error: null }),
    (err) => {
      console.warn('[HOTSI] revenue query failed, using fallback:', err.code);
      fallbackUnsub = onSnapshot(
        col,
        (snap) => {
          const items = mapDocs(snap).sort((a, b) => (b.periodKey || '').localeCompare(a.periodKey || ''));
          callback(items, { live: true, error: err.message });
        },
        (err2) => callback([], { live: false, error: err2.message }),
      );
    },
  );

  return () => {
    unsub();
    fallbackUnsub?.();
  };
}

/* ── Orders ───────────────────────────────────────────────── */
export async function createOrder(data) {
  const database = requireDb();
  const orderId = generateOrderId();
  const ref = await addDoc(collection(database, 'orders'), {
    ...data,
    orderId,
    contactNormalized: normalizeContact(data.contact || ''),
    status: 'pending',
    mergeHistory: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await syncRevenueDelta(null, {
    ...data,
    orderId,
    status: 'pending',
    total: data.total ?? calcOrderTotal(data.items || []),
    createdAt: new Date(),
  });
  return ref;
}

/** Customer checkout — always creates a NEW order (admin merges manually only) */
export async function submitCustomerOrder(data) {
  if (!isFirebaseConfigured || !db) {
    return { id: null, orderId: generateOrderId(), offline: true };
  }

  const items = data.items || [];
  const total = data.total ?? calcOrderTotal(items);
  const contactNormalized = normalizeContact(data.contact);

  try {
    const orderId = generateOrderId();
    const ref = await addDoc(collection(db, 'orders'), {
      customerName: data.customerName,
      contact: data.contact,
      contactNormalized,
      address: data.address,
      items,
      itemsText: formatItemsText(items),
      total,
      notes: data.notes || '',
      orderId,
      status: 'pending',
      source: 'website',
      mergeHistory: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await syncRevenueDelta(null, {
      customerName: data.customerName,
      contact: data.contact,
      total,
      status: 'pending',
      createdAt: new Date(),
    });

    return { id: ref.id, orderId, offline: false };
  } catch (err) {
    console.error('[HOTSI] submitCustomerOrder failed:', err);
    throw err;
  }
}

export function subscribeOrders(callback) {
  return subscribeCollection('orders', callback);
}

export async function updateOrderStatus(id, status) {
  const database = requireDb();
  const ref = doc(database, 'orders', id);
  const snap = await getDoc(ref);
  const before = snap.exists() ? { id: snap.id, ...snap.data() } : null;
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  if (before) {
    await syncRevenueDelta(before, { ...before, status });
  }
}

export async function deleteOrder(id) {
  const database = requireDb();
  const ref = doc(database, 'orders', id);
  await deleteDoc(ref);
  await rebuildAllRevenue();
}

/** Admin: merge secondary order into primary */
export async function mergeOrders(primaryId, secondaryId) {
  if (primaryId === secondaryId) throw new Error('Cannot merge an order with itself');

  const database = requireDb();
  const [primarySnap, secondarySnap] = await Promise.all([
    getDoc(doc(database, 'orders', primaryId)),
    getDoc(doc(database, 'orders', secondaryId)),
  ]);

  if (!primarySnap.exists() || !secondarySnap.exists()) {
    throw new Error('One or both orders not found');
  }

  const primary = { id: primarySnap.id, ...primarySnap.data() };
  const secondary = { id: secondarySnap.id, ...secondarySnap.data() };

  if (secondary.mergedInto || secondary.status === 'merged') {
    throw new Error('Secondary order was already merged');
  }
  if (primary.mergedInto || primary.status === 'merged') {
    throw new Error('Primary order was already merged into another');
  }

  const secItems = Array.isArray(secondary.items) ? secondary.items : [];
  const mergedItems = mergeItemArrays(
    Array.isArray(primary.items) ? primary.items : [],
    secItems,
  );
  const mergedTotal = calcOrderTotal(mergedItems);
  const orderId = primary.orderId || generateOrderId();

  await updateDoc(doc(database, 'orders', primaryId), {
    items: mergedItems,
    itemsText: formatItemsText(mergedItems),
    total: mergedTotal,
    customerName: primary.customerName || secondary.customerName,
    contact: primary.contact || secondary.contact,
    contactNormalized: primary.contactNormalized || secondary.contactNormalized || normalizeContact(secondary.contact),
    address: primary.address || secondary.address,
    orderId,
    updatedAt: serverTimestamp(),
    mergeHistory: arrayUnion({
      mergedAt: new Date().toISOString(),
      fromOrderId: secondary.orderId || secondaryId,
      items: secItems,
      subtotal: secondary.total || 0,
      source: 'admin',
    }),
  });

  await updateDoc(doc(database, 'orders', secondaryId), {
    status: 'merged',
    mergedInto: primaryId,
    mergedIntoOrderId: orderId,
    updatedAt: serverTimestamp(),
  });

  const primaryAfter = { ...primary, items: mergedItems, total: mergedTotal };
  await syncRevenueDelta(primary, primaryAfter);
  await syncRevenueDelta(secondary, { ...secondary, status: 'merged', mergedInto: primaryId });

  return { orderId, primaryId };
}

/* ── Menu items ───────────────────────────────────────────── */
function menuSlugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function getMenuItem(id) {
  if (!isFirebaseConfigured || !db) return null;
  const snap = await getDoc(doc(db, 'menu_items', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addMenuItem(data) {
  const database = requireDb();
  const slug = data.slug || `${data.category || 'item'}-${menuSlugify(data.name)}-${Date.now().toString(36).slice(-4)}`;
  await setDoc(doc(database, 'menu_items', slug), {
    ...data,
    slug,
    available: data.available !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return slug;
}

export function subscribeMenuItems(callback) {
  return subscribeCollection('menu_items', callback);
}

export async function updateMenuItem(id, data) {
  await updateDoc(doc(requireDb(), 'menu_items', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteMenuItem(id) {
  await deleteDoc(doc(requireDb(), 'menu_items', id));
}

/** Import all website menu products into Firestore (idempotent — uses stable doc IDs) */
export async function seedAllMenuItems() {
  const database = requireDb();
  const products = extractAllMenuProducts();

  for (let i = 0; i < products.length; i += 400) {
    const batch = writeBatch(database);
    products.slice(i, i + 400).forEach((product) => {
      const { slug, ...data } = product;
      batch.set(doc(database, 'menu_items', slug), {
        ...data,
        slug,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });
    });
    await batch.commit();
  }

  return products.length;
}

/* ── Settings ───────────────────────────────────────────────── */
export async function getSettings() {
  if (!isFirebaseConfigured || !db) return null;
  const snap = await getDocs(collection(db, 'settings'));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function saveSettings(id, data) {
  if (id) {
    await updateDoc(doc(requireDb(), 'settings', id), { ...data, updatedAt: serverTimestamp() });
    return id;
  }
  const ref = await addDoc(collection(requireDb(), 'settings'), { ...data, updatedAt: serverTimestamp() });
  return ref.id;
}

/* ── Staff ────────────────────────────────────────────────── */
export async function isUserStaff(uid) {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const staffDoc = await getDoc(doc(db, 'staff', uid));
    if (staffDoc.exists() && staffDoc.data().active !== false) return true;
    return false;
  } catch {
    return false;
  }
}

export async function getStaffProfile(uid) {
  if (!isFirebaseConfigured || !db) return null;
  const snap = await getDoc(doc(db, 'staff', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** Admin forwards order to kitchen staff */
export async function forwardOrderToStaff(orderId, adminEmail) {
  const database = requireDb();
  const ref = doc(database, 'orders', orderId);
  const snap = await getDoc(ref);
  const before = snap.exists() ? { id: snap.id, ...snap.data() } : null;
  await updateDoc(ref, {
    forwardedToStaff: true,
    staffStatus: 'assigned',
    status: 'with_staff',
    forwardedAt: serverTimestamp(),
    forwardedBy: adminEmail || '',
    updatedAt: serverTimestamp(),
  });
  if (before) {
    await syncRevenueDelta(before, { ...before, status: 'with_staff' });
  }
}

/** Staff updates preparing status */
export async function updateStaffOrderStatus(orderId, staffStatus) {
  await updateDoc(doc(requireDb(), 'orders', orderId), {
    staffStatus,
    updatedAt: serverTimestamp(),
  });
}

/** Staff marks order ready — admin sees status "done" */
export async function markStaffOrderDone(orderId, staffNote = '') {
  const database = requireDb();
  const ref = doc(database, 'orders', orderId);
  const snap = await getDoc(ref);
  const before = snap.exists() ? { id: snap.id, ...snap.data() } : null;
  await updateDoc(ref, {
    staffStatus: 'done',
    status: 'done',
    staffDoneAt: serverTimestamp(),
    staffNote: staffNote || '',
    updatedAt: serverTimestamp(),
  });
  if (before) {
    await syncRevenueDelta(before, { ...before, status: 'done' });
  }
}

/** Realtime orders forwarded to staff */
export function subscribeStaffOrders(callback) {
  return subscribeOrders((orders, meta) => {
    const staffOrders = orders.filter(
      (o) => o.forwardedToStaff && !o.mergedInto && o.status !== 'merged',
    );
    callback(staffOrders, meta);
  });
}

/* ── Admin check ──────────────────────────────────────────── */
export async function isUserAdmin(uid) {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) return true;
    const snap = await getDocs(query(collection(db, 'admins'), limit(1)));
    if (snap.empty) return true;
    return snap.docs.some((d) => d.id === uid || d.data().uid === uid);
  } catch {
    return true;
  }
}
