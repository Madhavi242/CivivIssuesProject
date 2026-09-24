import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '../common/Badge';

// Helper to create modern glowing SVG marker icons based on priority level
const createCustomMarker = (priorityLevel = 'Low') => {
  let color = '#10B981'; // emerald
  let pulseClass = '';

  if (priorityLevel === 'Critical') {
    color = '#EF4444'; // rose
    pulseClass = 'animate-ping';
  } else if (priorityLevel === 'High') {
    color = '#F97316'; // orange
  } else if (priorityLevel === 'Medium') {
    color = '#F59E0B'; // amber
  }

  const iconHtml = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 24px; height: 24px; background: ${color}; opacity: 0.3; border-radius: 9999px; transform: scale(1.4);"></div>
      <div style="position: relative; width: 22px; height: 22px; background: ${color}; border: 2px solid white; border-radius: 9999px; box-shadow: 0 0 10px ${color};"></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to dynamically adjust map center
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function IssueMap({
  issues = [],
  center = [12.9716, 77.5946], // Bangalore city center default
  zoom = 13,
  height = '500px',
  selectedIssueId = null,
}) {
  const [mapCenter, setMapCenter] = useState(center);

  useEffect(() => {
    if (selectedIssueId && issues.length > 0) {
      const match = issues.find((i) => i._id === selectedIssueId);
      if (match?.location?.coordinates) {
        setMapCenter([match.location.coordinates[1], match.location.coordinates[0]]);
      }
    }
  }, [selectedIssueId, issues]);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative z-10">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={mapCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {issues.map((issue) => {
          if (!issue?.location?.coordinates || issue.location.coordinates.length < 2) return null;
          const [lng, lat] = issue.location.coordinates;
          const icon = createCustomMarker(issue.priorityLevel);

          return (
            <Marker key={issue._id} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className="p-1 min-w-[220px]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <PriorityBadge level={issue.priorityLevel} size="xs" />
                    <StatusBadge status={issue.status} size="xs" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 mb-1 leading-snug">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                    {issue.description}
                  </p>
                  <div className="text-[11px] text-slate-400 mb-2">
                    📍 {issue.address || 'GPS Coordinate'}
                  </div>
                  <Link
                    to={`/issues/${issue._id}`}
                    className="block text-center text-xs font-semibold py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    View Details & Timeline →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
