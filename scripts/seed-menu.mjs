/**
 * CLI: seed all menu products into Firestore
 * Usage: npm run seed:menu
 * Requires .env with VITE_FIREBASE_* and optional SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) {
    console.error('Missing .env file. Copy .env.example and add Firebase keys.');
    process.exit(1);
  }
  readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  });
}

loadEnv();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const { extractAllMenuProducts } = await import('../src/firebase/seedMenu.js');

async function main() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('Firebase not configured in .env');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (email && password) {
    console.log('Signing in as admin…');
    await signInWithEmailAndPassword(auth, email, password);
  } else {
    console.warn('No SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD — writes may fail if Firestore rules require auth.');
  }

  const products = extractAllMenuProducts();
  console.log(`Seeding ${products.length} menu products…`);

  for (let i = 0; i < products.length; i += 400) {
    const batch = writeBatch(db);
    products.slice(i, i + 400).forEach((product) => {
      const { slug, ...data } = product;
      batch.set(doc(db, 'menu_items', slug), {
        ...data,
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    });
    await batch.commit();
    console.log(`  Batch ${Math.floor(i / 400) + 1} committed (${Math.min(i + 400, products.length)}/${products.length})`);
  }

  console.log(`Done — ${products.length} products in menu_items collection.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err.message || err);
  process.exit(1);
});
