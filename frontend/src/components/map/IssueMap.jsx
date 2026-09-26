import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '../common/Badge';

// Helper to create clean standard circular SVG marker icons
const createCustomMarker = (priorityLevel = 'Low') => {
  let color = '#2563eb'; // blue

  if (priorityLevel === 'Critical') {
    color = '#dc2626'; // red
  } else if (priorityLevel === 'High') {
    color = '#ea580c'; // orange
  } else if (priorityLevel === 'Medium') {
    color = '#d97706'; // amber
  } else if (priorityLevel === 'Low') {
    color = '#16a34a'; // green
  }

  const iconHtml = `
    <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 22px; height: 22px; background: ${color}; border: 2.5px solid white; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.25);"></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
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
    <div style={{ height }} className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs relative z-10 bg-slate-100">
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
                  <h4 className="font-semibold text-xs text-slate-900 mb-1 leading-snug">
                    {issue.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mb-2 line-clamp-2">
                    {issue.description}
                  </p>
                  <div className="text-[11px] text-slate-500 mb-2">
                    📍 {issue.address || 'Reported Location'}
                  </div>
                  <Link
                    to={`/issues/${issue._id}`}
                    className="block text-center text-xs font-semibold py-1.5 px-3 rounded-md bg-blue-700 hover:bg-blue-800 text-white transition-colors"
                  >
                    View Details →
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
