# HOTSI — Firebase Setup Guide

This guide walks you through connecting **Firebase Authentication** and **Cloud Firestore** to your HOTSI React app so the admin panel at `/admin` works with real data.

> **Your main website (`/`) is unchanged.** It works exactly as before. Firebase only adds admin features and optional reservation saving.

---

## What Firebase Powers

| Feature | Where |
|---------|--------|
| Admin login | `http://localhost:5173/admin` |
| Dashboard stats | Live counts from Firestore |
| Reservations | Contact form → Firestore → Admin panel |
| Orders | Log & track orders in admin |
| Menu items | Extra items stored in Firebase |
| Settings | Phone, address, hours in Firebase |

---

## Step 1 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Name it e.g. `hotsi-restaurant`
4. Disable Google Analytics (optional) → **Create project**

---

## Step 2 — Register Your Web App

1. In Firebase Console, click the **Web** icon (`</>`)
2. App nickname: `hotsi-web`
3. Click **Register app**
4. Copy the `firebaseConfig` values — you will need them in Step 4

---

## Step 3 — Enable Authentication

1. In the left menu: **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, enable **Email/Password**
4. Click **Save**

### Create your first admin user

1. Go to **Authentication → Users**
2. Click **Add user**
3. Enter your admin email and a strong password
4. Click **Add user**
5. Copy the **User UID** (you may need it in Step 6)

---

## Step 4 — Enable Firestore Database

1. In the left menu: **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development) → pick a region close to you (e.g. `asia-south1` for Pakistan)
4. Click **Enable**

---

## Step 5 — Add Environment Variables

In your project folder `hotsi-web/`, create a file named `.env` (copy from `.env.example`):

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Replace each value with the ones from **Project settings → General → Your apps → SDK setup and configuration**.

> **Never commit `.env` to Git.** It is already listed in `.gitignore`.

---

## Step 6 — Restrict Admin Access (Recommended)

By default, **any authenticated Firebase user** can access `/admin` until you add admins to Firestore.

### Option A — First-time setup (no admins yet)

1. Sign in at `/admin` with the user you created in Step 3
2. You will get access automatically when the `admins` collection is empty

### Option B — Lock down to specific admins

1. In Firestore, create a collection called `admins`
2. Add a document with **Document ID = your User UID** from Step 3
3. Add a field: `uid` (string) = same UID
4. Add a field: `email` (string) = your admin email

Only UIDs listed in `admins` can access the panel after this.

---

## Step 7 — Firestore Security Rules

In **Firestore → Rules**, replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Contact form — anyone can submit a reservation
    match /reservations/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    // Website checkout — customers can place orders; only admins can read/update
    match /orders/{id} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /menu_items/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /settings/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /admins/{uid} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

Click **Publish**.

> Before going live, tighten rules so only verified admin UIDs can read/write sensitive collections.

---

## Step 8 — Run the App

```bash
cd hotsi-web
npm install
npm run dev
```

| URL | Purpose |
|-----|---------|
| `http://localhost:5173/` | Public HOTSI website (unchanged) |
| `http://localhost:5173/admin` | Admin login & dashboard |

Sign in with the email/password you created in Step 3.

---

## Step 9 — Test Everything

### Reservations
1. Open the main site → scroll to **Reserve Your Table**
2. Fill in the form and submit
3. Open `/admin` → **Reservations** — your booking should appear in real time

### Orders
1. On the main site, click **+** on any menu item (or **Order via WhatsApp** in the cart)
2. Fill in **Name**, **Contact**, and **Address** in the checkout form
3. Click **Place Order & Open WhatsApp** — order saves to Firestore and opens WhatsApp
4. Open `/admin` → **Orders** — the order appears with customer details

### Menu
1. Go to `/admin` → **Menu Items**
2. Add a test item — it saves to Firestore

### Settings
1. Go to `/admin` → **Settings**
2. Update phone/address and click **Save Settings**

---

## Step 10 — Deploy (Optional)

### Build

```bash
npm run build
```

Output is in the `dist/` folder.

### SPA routing

Your host must redirect all routes to `index.html` so `/admin` works:

**Netlify** — create `public/_redirects`:
```
/*    /index.html   200
```

**Vercel** — create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Firebase Hosting** — in `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

### Environment variables on hosting

Add the same `VITE_FIREBASE_*` variables in your hosting dashboard (Vercel → Settings → Environment Variables, Netlify → Site settings → Environment variables).

Rebuild after adding env vars.

---

## Firestore Collections Reference

| Collection | Purpose | Created by |
|------------|---------|------------|
| `reservations` | Table bookings | Contact form on website |
| `orders` | Customer orders (name, contact, address, items) | Website checkout form |
| `menu_items` | Extra menu entries | Admin panel |
| `settings` | Business info | Admin panel |
| `admins` | Allowed admin UIDs | You (manually in console) |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Login page says "Firebase not connected" | Create `.env` with all 6 `VITE_FIREBASE_*` keys and restart `npm run dev` |
| "You do not have admin access" | Add your UID to the `admins` collection in Firestore |
| Reservations not appearing | Check Firestore rules allow `create` on `reservations` |
| `/admin` shows blank page on deploy | Add SPA rewrite rules (Step 10) |
| `permission-denied` errors | Publish Firestore rules from Step 7 |

---

## File Reference (in this project)

```
src/
  firebase/
    config.js       ← reads VITE_FIREBASE_* from .env
    services.js     ← Firestore CRUD functions
  context/
    AuthContext.jsx ← login/logout state
  admin/
    AdminLogin.jsx
    AdminDashboard.jsx
    AdminReservations.jsx
    AdminOrders.jsx
    AdminMenu.jsx
    AdminSettings.jsx
    admin.css         ← admin-only styles (separate from main site)
```

---

## Need Help?

- [Firebase Auth docs](https://firebase.google.com/docs/auth/web/start)
- [Firestore docs](https://firebase.google.com/docs/firestore/quickstart)
- [Vite env variables](https://vitejs.dev/guide/env-and-mode.html)

Once Firebase is connected, your admin panel at **`/admin`** is fully live with authentication, animated UI, and real-time data.
