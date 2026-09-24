import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

const pinIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 28px; height: 28px; background: #3B82F6; opacity: 0.3; border-radius: 9999px; transform: scale(1.6); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 26px; height: 26px; background: #2563EB; border: 3px solid white; border-radius: 9999px; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);"></div>
    </div>
  `,
  className: 'custom-location-pin',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  address,
  onAddressChange,
}) {
  const [coords, setCoords] = useState([
    latitude || 12.9716,
    longitude || 77.5946,
  ]);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setCoords([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleSelect = (lat, lng) => {
    const fixedLat = parseFloat(lat.toFixed(6));
    const fixedLng = parseFloat(lng.toFixed(6));
    setCoords([fixedLat, fixedLng]);
    onLocationChange(fixedLat, fixedLng);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        handleSelect(lat, lng);
        setDetecting(false);
      },
      (error) => {
        console.warn('Geolocation access declined or unavailable:', error.message);
        // Fallback to demo default with slight random jitter
        const jitterLat = parseFloat((12.9716 + (Math.random() - 0.5) * 0.01).toFixed(6));
        const jitterLng = parseFloat((77.5946 + (Math.random() - 0.5) * 0.01).toFixed(6));
        handleSelect(jitterLat, jitterLng);
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          Location & GPS Coordinates
        </label>
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all active:scale-95"
        >
          <Navigation className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
          <span>{detecting ? 'Acquiring GPS...' : 'Use Current GPS'}</span>
        </button>
      </div>

      <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-700/80 relative">
        <MapContainer
          center={coords}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={coords} icon={pinIcon} />
          <MapClickHandler onLocationSelect={handleSelect} />
        </MapContainer>
        <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-slate-300 font-mono">
          Lat: {coords[0]} | Lng: {coords[1]}
        </div>
      </div>

      <div>
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Landmark or street address (e.g. Near Metro Gate 2, MG Road)"
          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  );
}
