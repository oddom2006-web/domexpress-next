// src/hooks/index.ts
// All React hooks that wrap Firestore calls
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as fs from '@/lib/firestore';
import type { Order, Branch, Notification, User, OrderStatus } from '@/types';

// ── ORDERS ────────────────────────────────────────────────────────────────────

export function useOrders(filter?: (o: Order) => boolean) {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  // Captured once, at mount — matches the original hook's behavior where the
  // filter function was only read on first render (via useCallback with [] deps).
  const filterRef = useRef(filter);

  useEffect(() => {
    setLoading(true);
    const unsub = fs.subscribeOrders(
      data => {
        setOrders(filterRef.current ? data.filter(filterRef.current) : data);
        setLoading(false);
        setError(null);
      },
      err => { setError(err.message); setLoading(false); }
    );
    return unsub;
  }, []);

  // Real-time listener keeps this current automatically — reload() is a no-op
  // kept only so existing reload() calls elsewhere in the app don't break.
  return { orders, loading, error, reload: () => {} };
}

export function useOrder(orderId: string) {
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    const unsub = fs.subscribeOrder(orderId, data => { setOrder(data); setLoading(false); });
    return unsub;
  }, [orderId]);

  return { order, loading };
}

// ── BRANCHES ──────────────────────────────────────────────────────────────────

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = fs.subscribeBranches(
      data => { setBranches(data); setLoading(false); },
      ()   => setLoading(false)
    );
    return unsub;
  }, []);

  return { branches, loading, reload: () => {} };
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

export function useNotifications(uid: string) {
  const [notifs,   setNotifs]  = useState<Notification[]>([]);
  const [loading,  setLoading] = useState(true);
  const [unread,   setUnread]  = useState(0);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsub = fs.subscribeNotifications(
      uid,
      data => {
        setNotifs(data);
        setUnread(data.filter(n => !n.read).length);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [uid]);

  const markAllRead = async () => {
    // Optimistic local update for snappy UI — the live listener confirms it moments later.
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
    await fs.markAllNotifsRead(uid);
  };

  return { notifs, loading, unread, reload: () => {}, markAllRead };
}

// ── USERS BY ROLE ─────────────────────────────────────────────────────────────

export function useUsersByRole(role: string) {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = fs.subscribeUsersByRole(
      role,
      data => { setUsers(data); setLoading(false); },
      ()   => setLoading(false)
    );
    return unsub;
  }, [role]);

  return { users, loading, reload: () => {} };
}