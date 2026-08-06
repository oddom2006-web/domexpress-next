// src/lib/route.ts
import type { Order, Branch } from '@/types';
import { haversineKm } from './utils';

export interface RouteStop {
  order: Order;
  clusterBranch: string;        // the branch used to represent this stop's approximate location
  stopNumber: number;           // 1-based position in cluster visit order
  legDistanceKm: number | null; // distance from the previous cluster (only set on a cluster's first stop)
}

export interface RouteResult {
  stops: RouteStop[];
  totalDistanceKm: number | null; // null if coordinates were missing anywhere in the chain
  hasCoords: boolean;             // whether real distance-based ordering was possible
}

/**
 * Straight-line route approximation — NOT real road routing (no traffic, no actual
 * street distance). Since individual delivery addresses don't have coordinates
 * (only branches do), orders are grouped by destination branch first, then those
 * branch-groups are visited in greedy-nearest-neighbor order starting from the
 * driver's home branch. Stops within the same branch-group keep their original
 * relative order, since there's no finer-grained location data to sort by.
 */
export function optimizeRoute(
  orders: Order[],
  branches: Branch[],
  startBranchName: string
): RouteResult {
  const branchByName = new Map(branches.map(b => [b.name, b]));
  const start = branchByName.get(startBranchName);

  // Group orders by destination branch, preserving original order within each group
  const clusters = new Map<string, Order[]>();
  for (const o of orders) {
    const dest = o.receiverBranch || o.branch || 'Unknown';
    if (!clusters.has(dest)) clusters.set(dest, []);
    clusters.get(dest)!.push(o);
  }
  const clusterNames = Array.from(clusters.keys());

  const hasCoords =
    start?.lat != null && start?.lng != null &&
    clusterNames.every(name => {
      const b = branchByName.get(name);
      return b?.lat != null && b?.lng != null;
    });

  let visitOrder: string[];
  if (hasCoords) {
    // Greedy nearest-neighbor over cluster branches
    const remaining = new Set(clusterNames);
    let curLat = start!.lat!, curLng = start!.lng!;
    visitOrder = [];
    while (remaining.size) {
      let nearest: string | null = null;
      let nearestDist = Infinity;
      for (const name of remaining) {
        const b = branchByName.get(name)!;
        const d = haversineKm(curLat, curLng, b.lat!, b.lng!);
        if (d < nearestDist) { nearestDist = d; nearest = name; }
      }
      visitOrder.push(nearest!);
      remaining.delete(nearest!);
      const b = branchByName.get(nearest!)!;
      curLat = b.lat!; curLng = b.lng!;
    }
  } else {
    // No usable coordinates anywhere — keep clusters in first-seen order, unordered
    visitOrder = clusterNames;
  }

  const stops: RouteStop[] = [];
  let prevLat = start?.lat, prevLng = start?.lng;
  let totalDistanceKm: number | null = hasCoords ? 0 : null;
  let stopNumber = 0;

  for (const clusterName of visitOrder) {
    const b = branchByName.get(clusterName);
    let legDistance: number | null = null;
    if (hasCoords && prevLat != null && prevLng != null && b?.lat != null && b?.lng != null) {
      legDistance = Math.round(haversineKm(prevLat, prevLng, b.lat, b.lng) * 10) / 10;
      totalDistanceKm = (totalDistanceKm ?? 0) + legDistance;
      prevLat = b.lat; prevLng = b.lng;
    }
    clusters.get(clusterName)!.forEach((order, i) => {
      stopNumber++;
      stops.push({
        order,
        clusterBranch: clusterName,
        stopNumber,
        legDistanceKm: i === 0 ? legDistance : 0,
      });
    });
  }

  return {
    stops,
    totalDistanceKm: totalDistanceKm != null ? Math.round(totalDistanceKm * 10) / 10 : null,
    hasCoords: !!hasCoords,
  };
}