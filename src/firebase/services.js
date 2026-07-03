import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import {
  calcOrderTotal,
  formatItemsText,
  generateOrderId,
  mergeItemArrays,
  normalizeContact,
} from '../utils/orderUtils';

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

/* ── Orders ───────────────────────────────────────────────── */
export async function createOrder(data) {
  const database = requireDb();
  const orderId = generateOrderId();
  return addDoc(collection(database, 'orders'), {
    ...data,
    orderId,
    contactNormalized: normalizeContact(data.contact || ''),
    status: 'pending',
    mergeHistory: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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
  await updateDoc(doc(requireDb(), 'orders', id), { status, updatedAt: serverTimestamp() });
}

export async function deleteOrder(id) {
  await deleteDoc(doc(requireDb(), 'orders', id));
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

  return { orderId, primaryId };
}

/* ── Menu items ───────────────────────────────────────────── */
export async function addMenuItem(data) {
  const database = requireDb();
  return addDoc(collection(database, 'menu_items'), {
    ...data,
    available: true,
    createdAt: serverTimestamp(),
  });
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
