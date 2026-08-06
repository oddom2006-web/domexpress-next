# DOM EXPRESS — Next.js + React + Firebase

Full-stack logistics delivery management system converted from vanilla JS to Next.js 14 with React, TypeScript, and Firebase.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 14 (App Router)             |
| UI          | React 18 + CSS Modules              |
| Language    | TypeScript                          |
| Database    | Firebase Firestore                  |
| Auth        | Firebase Authentication             |
| Toasts      | react-hot-toast                     |
| Deploy      | Firebase Hosting / Vercel           |

---

## Project Structure

```
domexpress-next/
├── middleware.ts                  ← Route protection (Edge)
├── firebase.json                  ← Firebase Hosting config
├── firestore.rules                ← Firestore security rules
├── firestore.indexes.json         ← Composite indexes
├── .env.local                     ← Firebase env vars
└── src/
    ├── app/
    │   ├── layout.tsx             ← Root layout (AuthProvider + Toaster)
    │   ├── page.tsx               ← Root redirect by role
    │   ├── auth/page.tsx          ← Login + Register
    │   ├── customer/page.tsx      ← Customer dashboard (5 sections)
    │   ├── admin/page.tsx         ← Admin dashboard (9 sections)
    │   └── driver/page.tsx        ← Driver dashboard (4 sections)
    ├── components/
    │   ├── layout/DashboardLayout.tsx  ← Sidebar + topbar shell
    │   └── ui/index.tsx           ← Btn, Card, Modal, StatCard, etc.
    ├── context/AuthContext.tsx    ← Firebase Auth state + cookie
    ├── hooks/index.ts             ← useOrders, useBranches, useNotifications
    ├── lib/
    │   ├── firebase.ts            ← Firebase singleton
    │   ├── firestore.ts           ← All Firestore CRUD helpers
    │   └── utils.ts               ← fmtDate, fmtDateTime
    └── types/index.ts             ← TypeScript interfaces
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# Open http://localhost:3000
```

---

## Firebase Setup (one-time)

### Step 1 — Apply Firestore Rules
Go to **Firebase Console → Firestore → Rules** tab  
Paste contents of `firestore.rules` → click **Publish**

### Step 2 — Deploy Indexes
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project, keep defaults
firebase deploy --only firestore:indexes
```

Or create manually in **Firebase Console → Firestore → Indexes**:

| Collection      | Field 1               | Field 2             |
|-----------------|-----------------------|---------------------|
| `orders`        | `assignedDriver` ASC  | `updatedAt` DESC    |
| `orders`        | `assignedDriver` ASC  | `status` ASC        |
| `notifications` | `uid` ASC             | `time` DESC         |
| `notifications` | `uid` ASC             | `read` ASC          |

### Step 3 — Create Admin Account
1. Register on the site (creates a customer account)
2. Go to **Firebase Console → Firestore → users** collection
3. Find your user document → edit `role` field to `"admin"`
4. Log out and log back in → you'll land on Admin Dashboard

### Step 4 — Seed Branches
Admin Dashboard → **Branches** → Add Branch:
- Phnom Penh Branch
- Siem Reap Branch
- Battambang Branch
- Sihanoukville Branch
- Kampot Branch

### Step 5 — Add Drivers
Admin Dashboard → **Driver Management** → Add Driver  
This creates a real Firebase Auth account for the driver.

---

## User Flow

```
Customer creates order
  → Firestore orders/{id}  (status: pending)
  → Notification to customer

Admin approves
  → status: approved
  → Notification to customer ✅

Admin assigns driver
  → status: assigned + driverName set
  → Notification to customer + driver ✅

Driver updates status
  → status: pickedup / transit / delivered
  → Notification to customer ✅

Customer tracks order
  → Reads live from Firestore
  → Sees full history timeline ✅
```

---

## Deploy

### Option A — Vercel (Easiest)
```bash
npm install -g vercel
vercel
# Follow prompts — live in ~30 seconds
```

### Option B — Firebase Hosting (Same project)
```bash
firebase experiments:enable webframeworks
firebase deploy
```

