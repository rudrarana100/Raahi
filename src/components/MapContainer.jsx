import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapContainer({ startLocation, destination, currentLocation, polyline, onSimulateMove, onSimulateDeviation }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // Initialize map on mount
  useEffect(() => {
    if (!mapRef.current) return;

    const startLat = startLocation?.lat || 28.6139;
    const startLng = startLocation?.lng || 77.2090;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [startLat, startLng],
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and route polyline when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers & polyline
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const bounds = [];

    // Custom Icon Creators
    const createCustomIcon = (color, label) => L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="
          background-color: ${color};
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
        ">${label}</div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    // Start Location Marker
    if (startLocation && startLocation.lat && startLocation.lng) {
      const startMarker = L.marker([startLocation.lat, startLocation.lng], {
        icon: createCustomIcon('#312e81', 'A')
      }).addTo(map);
      startMarker.bindPopup(`<b>Start:</b> ${startLocation.name || 'Start position'}`);
      markersRef.current.push(startMarker);
      bounds.push([startLocation.lat, startLocation.lng]);
    }

    // Destination Marker
    if (destination && destination.lat && destination.lng) {
      const destMarker = L.marker([destination.lat, destination.lng], {
        icon: createCustomIcon('#059669', 'B')
      }).addTo(map);
      destMarker.bindPopup(`<b>Destination:</b> ${destination.name || 'Target'}`);
      markersRef.current.push(destMarker);
      bounds.push([destination.lat, destination.lng]);
    }

    // Route Polyline
    if (polyline && polyline.length > 0) {
      const latLngs = polyline.map(pt => [pt.lat, pt.lng]);
      const poly = L.polyline(latLngs, {
        color: '#4338ca',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);
      polylineRef.current = poly;
    }

    // Current Live Location Marker
    if (currentLocation && currentLocation.lat && currentLocation.lng) {
      const liveIcon = L.divIcon({
        className: 'custom-live-icon',
        html: `
          <div class="marker-pulse" style="
            background-color: #1e1b4b;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const liveMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: liveIcon }).addTo(map);
      liveMarker.bindPopup(`<b>Current Location</b><br/>Updated just now`);
      markersRef.current.push(liveMarker);
      bounds.push([currentLocation.lat, currentLocation.lng]);
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }

  }, [startLocation, destination, currentLocation, polyline]);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs space-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-indigo-900 border border-white"></span>
          <span className="text-slate-700 font-medium">Start</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white"></span>
          <span className="text-slate-700 font-medium">Destination</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-indigo-950 border border-white"></span>
          <span className="text-slate-700 font-medium">Current Position</span>
        </div>
      </div>

      {/* Interactive Location Simulation Controls for Live Demo */}
      {(onSimulateMove || onSimulateDeviation) && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 shadow-md text-xs flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Demo Simulator:</span>
          {onSimulateMove && (
            <button
              onClick={onSimulateMove}
              className="px-2.5 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded hover:bg-indigo-100 font-medium transition-colors"
            >
              Advance Step
            </button>
          )}
          {onSimulateDeviation && (
            <button
              onClick={onSimulateDeviation}
              className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded hover:bg-amber-100 font-medium transition-colors"
            >
              Simulate 200m Deviation
            </button>
          )}
        </div>
      )}
    </div>
  );
}
