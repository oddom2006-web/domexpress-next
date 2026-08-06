'use client';
// src/components/shared/DomMap.tsx
//
// IMPORTANT: this component touches `window`/`document` at import time
// (Leaflet's marker-icon setup), which breaks Next.js server-side rendering.
// Never import this directly — always load it with next/dynamic and
// { ssr: false } from whichever page uses it. See the usage examples
// wherever this is wired in.
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet's default marker icon paths break under Next.js/webpack bundling
// (the images resolve to the wrong URL) — this points them at Leaflet's own
// CDN-hosted copies instead, which always works regardless of bundler config.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  sub?: string;
  stopNumber?: number; // when set, shows a numbered circular pin instead of the default marker
}

interface DomMapProps {
  points: MapPoint[];
  polyline?: boolean; // connect points in array order with a line — for showing a route
  height?: number;
}

function numberedIcon(n: number) {
  return L.divIcon({
    className: 'dom-map-pin',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:var(--accent);color:#14161c;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:13px;font-family:var(--font-mono);
      border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);
    ">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function DomMap({ points, polyline = false, height = 360 }: DomMapProps) {
  const valid = points.filter(p => p.lat != null && p.lng != null);

  if (!valid.length) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg3)', borderRadius: 12, color: 'var(--text3)', fontSize: 13,
        border: '1px solid var(--border2)',
      }}>
        No locations with coordinates to show
      </div>
    );
  }

  const center: [number, number] = [valid[0].lat, valid[0].lng];
  const positions: [number, number][] = valid.map(p => [p.lat, p.lng]);

  return (
    <div style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border2)' }}>
      <MapContainer center={center} zoom={valid.length > 1 ? 8 : 12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polyline && positions.length > 1 && (
          <Polyline positions={positions} pathOptions={{ color: 'var(--accent)', weight: 3, opacity: 0.8 }} />
        )}
        {valid.map((p, i) => (
          <Marker
            key={i}
            position={[p.lat, p.lng]}
            {...(p.stopNumber != null
              ? { icon: numberedIcon(p.stopNumber) }
              : {})}
          >
            <Popup>
              <strong>{p.label}</strong>
              {p.sub && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{p.sub}</div>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}