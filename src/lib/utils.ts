// src/lib/utils.ts

export function fmtDate(iso?: string | null): string {
  if (!iso) return '–';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return iso; }
}

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return '–';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ── PRICING ── */
// Adjust these to match your real rates.
// "direct"       = door-to-door, one driver goes straight from sender to receiver — priced higher.
// "consolidated" = customer drops the package at the branch; several such orders get batched
//                  onto one driver/truck run — cheaper since the trip cost is shared.
export const PRICING = {
  direct: {
    baseFee:  1.50,
    perKg:    0.60,
    perKm:    0.15,
    minPrice: 2.00,
  },
  consolidated: {
    baseFee:  0.50,
    perKg:    0.35,
    perKm:    0.05,
    minPrice: 1.00,
  },
};

/** Great-circle distance between two lat/lng points, in kilometers. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius, km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface PriceResult {
  price: number;
  distanceKm: number | null; // null when either branch is missing coordinates
}

/**
 * weightKg: package weight.
 * from/to: sender & receiver branch coordinates, or null if not set on the branch yet.
 * serviceType: 'direct' (door-to-door, pricier) or 'consolidated' (branch drop-off, cheaper).
 * Falls back to base + weight only (no distance component) when coordinates are missing,
 * so pricing never breaks — it just can't factor in distance until branches have lat/lng.
 */
export function calculatePrice(
  weightKg: number,
  from: { lat?: number; lng?: number } | null | undefined,
  to:   { lat?: number; lng?: number } | null | undefined,
  serviceType: 'direct' | 'consolidated' = 'direct'
): PriceResult {
  const rates = PRICING[serviceType];
  const hasCoords = from?.lat != null && from?.lng != null && to?.lat != null && to?.lng != null;
  const distanceKm = hasCoords ? haversineKm(from!.lat!, from!.lng!, to!.lat!, to!.lng!) : null;

  let price = rates.baseFee + weightKg * rates.perKg;
  if (distanceKm != null) price += distanceKm * rates.perKm;
  price = Math.max(price, rates.minPrice);

  return { price: Math.round(price * 100) / 100, distanceKm: distanceKm != null ? Math.round(distanceKm * 10) / 10 : null };
}

/**
 * Firestore's setDoc()/addDoc() reject any field explicitly set to `undefined`
 * (a TypeScript-optional field is fine to omit, but not fine to include as
 * literally `undefined`). Call this on any object headed to Firestore that was
 * built with `?? undefined` / ternaries that might leave a key undefined —
 * it removes those keys entirely rather than sending them.
 */
export function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out = {} as T;
  for (const k in obj) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}