'use client';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
  defaultCenter?: [number, number]; // used before any pin is set — pass the relevant branch's coords if you have them
  height?: number;
  useMyLocationLabel?: string; // pass a translated label; falls back to English
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onChange(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

export default function LocationPicker({
  lat, lng, onChange,
  defaultCenter = [11.5564, 104.9282], // Phnom Penh — reasonable fallback center if no branch coords are known either
  height = 220,
  useMyLocationLabel = 'Use my current location',
}: LocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const center: [number, number] = lat != null && lng != null ? [lat, lng] : defaultCenter;

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { onChange(pos.coords.latitude, pos.coords.longitude); setLocating(false); },
      ()  => { setLocating(false); }, // silently no-op on denial/failure — the map click still works as a fallback
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div>
      <div style={{
        height, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border2)', marginBottom: 8,
        position: 'relative', isolation: 'isolate', zIndex: 0,
      }}>
        <MapContainer center={center} zoom={lat != null ? 15 : 12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          {lat != null && lng != null && (
            <Marker
              position={[lat, lng]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const pos = (e.target as L.Marker).getLatLng();
                  onChange(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <button
        type="button"
        onClick={useMyLocation}
        disabled={locating}
        style={{
          fontSize: 12, padding: '6px 12px', borderRadius: 8,
          border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text2)',
          cursor: 'pointer',
        }}
      >
        📍 {locating ? '...' : useMyLocationLabel}
      </button>
    </div>
  );
}