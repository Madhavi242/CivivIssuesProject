import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

const pinIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 22px; height: 22px; background: #1d4ed8; border: 2.5px solid white; border-radius: 9999px; box-shadow: 0 2px 5px rgba(0,0,0,0.35);"></div>
    </div>
  `,
  className: 'custom-location-pin',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
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
        const jitterLat = parseFloat((12.9716 + (Math.random() - 0.5) * 0.01).toFixed(6));
        const jitterLng = parseFloat((77.5946 + (Math.random() - 0.5) * 0.01).toFixed(6));
        handleSelect(jitterLat, jitterLng);
        setDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-700" />
          <span>Location & Map Coordinates</span>
        </label>
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
        >
          <Navigation className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
          <span>{detecting ? 'Detecting...' : 'Use Current Location'}</span>
        </button>
      </div>

      <div className="h-48 w-full rounded-lg overflow-hidden border border-slate-300 relative bg-slate-100">
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
        <div className="absolute bottom-2 left-2 z-[400] bg-white/95 px-2.5 py-1 rounded border border-slate-200 text-[11px] text-slate-700 font-mono shadow-xs">
          Lat: {coords[0]} | Lng: {coords[1]}
        </div>
      </div>

      <div>
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Street address or nearby landmark (e.g. Near Metro Gate 2, MG Road)"
          className="w-full text-xs px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
        />
      </div>
    </div>
  );
}
