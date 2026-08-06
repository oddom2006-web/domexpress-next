# DOM EXPRESS — Logistics Delivery Management System

A modern full-stack logistics and parcel delivery management system built with **Next.js 14**, **React**, **TypeScript**, and **Firebase**. The application provides role-based dashboards for customers, employees, drivers, and administrators, along with real-time order tracking, notifications, invoice generation, and multilingual support.

---

# Features

## Public Website

* Landing page
* About page
* Services
* Pricing
* Contact page
* Branch locations
* Responsive design

## Customer

* User registration and login
* Create delivery orders
* Track shipments in real time
* View delivery history
* Manage profile
* Receive notifications

## Employee

* Manage customer orders
* Update shipment information
* Process delivery requests
* Customer support workflow

## Driver

* View assigned deliveries
* Update delivery status
* Delivery history
* Route management

## Administrator

* Dashboard analytics
* User management
* Driver management
* Employee management
* Branch management
* Order management
* System settings
* Reports

---

# Tech Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Framework      | Next.js 14 (App Router)   |
| UI             | React 18 + CSS Modules    |
| Language       | TypeScript                |
| Database       | Firebase Firestore        |
| Authentication | Firebase Authentication   |
| Storage        | Firebase Storage          |
| Maps           | Leaflet                   |
| PDF            | jsPDF                     |
| Notifications  | react-hot-toast           |
| Hosting        | Firebase Hosting / Vercel |

---

# Project Structure

```text
domexpress-next/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── middleware.ts
├── next.config.js
├── package.json
└── src/
    ├── app/
    │   ├── admin/
    │   ├── auth/
    │   ├── customer/
    │   ├── driver/
    │   ├── employee/
    │   ├── layout.tsx
    │   └── page.tsx
    │
    ├── components/
    │   ├── layout/
    │   ├── shared/
    │   └── ui/
    │
    ├── context/
    │   ├── AuthContext.tsx
    │   ├── LanguageContext.tsx
    │   └── ThemeContext.tsx
    │
    ├── hooks/
    │
    ├── lib/
    │   ├── firebase.ts
    │   ├── firestore.ts
    │   ├── invoice.ts
    │   ├── route.ts
    │   └── utils.ts
    │
    ├── locales/
    │   ├── en.ts
    │   └── km.ts
    │
    └── types/
```

---

# Main Modules

* Authentication
* Role-Based Authorization
* Order Management
* Driver Assignment
* Shipment Tracking
* Branch Management
* Employee Management
* Customer Management
* Notification System
* Invoice Generation (PDF)
* Route Calculation
* Multi-language Support (English & Khmer)
* Theme Support (Light/Dark)

---

# Quick Start

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

Create a `.env.local` file.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 3. Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Firebase Setup

## Firestore Rules

Publish the contents of:

```
firestore.rules
```

from the Firebase Console.

---

## Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

---

## Create an Administrator

1. Register a normal account.
2. Open Firestore.
3. Navigate to:

```
users
```

4. Change

```json
role: "customer"
```

to

```json
role: "admin"
```

5. Log in again.

---

# Default User Roles

* Customer
* Employee
* Driver
* Admin

Each role has its own protected dashboard and permissions.

---

# Order Workflow

```text
Customer
      │
      ▼
Create Order
      │
      ▼
Employee Reviews
      │
      ▼
Admin Approval
      │
      ▼
Assign Driver
      │
      ▼
Driver Pickup
      │
      ▼
In Transit
      │
      ▼
Delivered
      │
      ▼
Order Completed
```

Every status update automatically synchronizes with Firestore and is reflected across all dashboards.

---

# Deployment

## Vercel

```bash
vercel
```

---

## Firebase Hosting

```bash
firebase deploy
```

---

# Future Improvements

* Email notifications
* SMS notifications
* Online payment integration
* Live GPS tracking
* Customer support chat
* Analytics dashboard
* Mobile application

---

# License

This project was developed for educational purposes and can be extended into a production-ready logistics management platform.
