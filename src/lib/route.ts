// src/lib/route.ts
import type { Order, Branch } from '@/types';
import { haversineKm } from './utils';

export interface RouteStop {
  order: Order;
  clusterKey: string;           // branch name, or a pin-based key for precisely-located stops
  clusterLabel: string;         // human-readable label for this stop's location
  lat: number | null;           // resolved coordinates for this stop — use these directly,
  lng: number | null;           // don't re-look-up by branch name (breaks for pinned stops)
  stopNumber: number;           // 1-based position in visit order
  legDistanceKm: number | null; // distance from the previous stop (only set on a cluster's first stop)
  precise: boolean;             // true if this stop used the order's own pin rather than a branch
}

export interface RouteResult {
  stops: RouteStop[];
  totalDistanceKm: number | null; // null if coordinates were missing anywhere in the chain
  hasCoords: boolean;             // whether real distance-based ordering was possible
}

/**
 * Straight-line route approximation — NOT real road routing (no traffic, no actual
 * street distance).
 *
 * Location precedence per order, most accurate first:
 *   1. The order's own receiver pin (receiverLat/receiverLng), if the customer or
 *      staff dropped one — each such order becomes its OWN stop, not grouped with
 *      others, since a pin means we actually know exactly where it goes.
 *   2. Otherwise, the destination branch (receiverBranch, falling back to branch) —
 *      orders sharing a branch and lacking a pin get grouped into one stop, same as
 *      before pins existed.
 *
 * Stops are then visited in greedy-nearest-neighbor order starting from the
 * driver's home branch. This mixes precise and branch-level stops naturally —
 * an order with a pin nearby gets visited in its actual position along the route,
 * not lumped in with everything headed to the same branch.
 */
export function optimizeRoute(
  orders: Order[],
  branches: Branch[],
  startBranchName: string
): RouteResult {
  const branchByName = new Map(branches.map(b => [b.name, b]));
  const start = branchByName.get(startBranchName);

  // Build one cluster per stop location. Pinned orders each get their own cluster
  // (key based on rounded coordinates, so two orders pinned to virtually the same
  // spot still share one stop); unpinned orders cluster by destination branch.
  const clusters = new Map<string, { label: string; lat: number; lng: number | null; orders: Order[]; precise: boolean }>();

  for (const o of orders) {
    const hasPin = o.receiverLat != null && o.receiverLng != null;

    if (hasPin) {
      const key = `pin:${o.receiverLat!.toFixed(4)},${o.receiverLng!.toFixed(4)}`;
      if (!clusters.has(key)) {
        clusters.set(key, { label: o.receiverName || o.address || 'Pinned stop', lat: o.receiverLat!, lng: o.receiverLng!, orders: [], precise: true });
      }
      clusters.get(key)!.orders.push(o);
    } else {
      const branchName = o.receiverBranch || o.branch || 'Unknown';
      const key = `branch:${branchName}`;
      if (!clusters.has(key)) {
        const b = branchByName.get(branchName);
        clusters.set(key, { label: branchName, lat: b?.lat ?? (null as any), lng: b?.lng ?? null, orders: [], precise: false });
      }
      clusters.get(key)!.orders.push(o);
    }
  }

  const clusterKeys = Array.from(clusters.keys());
  const hasCoords =
    start?.lat != null && start?.lng != null &&
    clusterKeys.every(k => {
      const c = clusters.get(k)!;
      return c.lat != null && c.lng != null;
    });

  let visitOrder: string[];
  if (hasCoords) {
    // Greedy nearest-neighbor over all clusters (pinned stops and branch stops alike)
    const remaining = new Set(clusterKeys);
    let curLat = start!.lat!, curLng = start!.lng!;
    visitOrder = [];
    while (remaining.size) {
      let nearest: string | null = null;
      let nearestDist = Infinity;
      for (const key of remaining) {
        const c = clusters.get(key)!;
        const d = haversineKm(curLat, curLng, c.lat!, c.lng!);
        if (d < nearestDist) { nearestDist = d; nearest = key; }
      }
      visitOrder.push(nearest!);
      remaining.delete(nearest!);
      const c = clusters.get(nearest!)!;
      curLat = c.lat!; curLng = c.lng!;
    }
  } else {
    // No usable coordinates anywhere — keep clusters in first-seen order, unordered
    visitOrder = clusterKeys;
  }

  const stops: RouteStop[] = [];
  let prevLat = start?.lat, prevLng = start?.lng;
  let totalDistanceKm: number | null = hasCoords ? 0 : null;
  let stopNumber = 0;

  for (const key of visitOrder) {
    const c = clusters.get(key)!;
    let legDistance: number | null = null;
    if (hasCoords && prevLat != null && prevLng != null && c.lat != null && c.lng != null) {
      legDistance = Math.round(haversineKm(prevLat, prevLng, c.lat, c.lng) * 10) / 10;
      totalDistanceKm = (totalDistanceKm ?? 0) + legDistance;
      prevLat = c.lat; prevLng = c.lng;
    }
    c.orders.forEach((order, i) => {
      stopNumber++;
      stops.push({
        order,
        clusterKey: key,
        clusterLabel: c.label,
        lat: c.lat,
        lng: c.lng,
        stopNumber,
        legDistanceKm: i === 0 ? legDistance : 0,
        precise: c.precise,
      });
    });
  }

  return {
    stops,
    totalDistanceKm: totalDistanceKm != null ? Math.round(totalDistanceKm * 10) / 10 : null,
    hasCoords: !!hasCoords,
  };
}