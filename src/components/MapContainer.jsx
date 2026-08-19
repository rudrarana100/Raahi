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

      // Ensure Leaflet calculates dimensions correctly after mount
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
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
    const createCustomIcon = (bgColor, textColor, label) => L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="
          background-color: ${bgColor};
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${textColor};
          font-weight: bold;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
        ">${label}</div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    // Start Location Marker
    if (startLocation && typeof startLocation.lat === 'number' && typeof startLocation.lng === 'number') {
      const startMarker = L.marker([startLocation.lat, startLocation.lng], {
        icon: createCustomIcon('#0a2414', '#f3fbe9', 'A')
      }).addTo(map);
      startMarker.bindPopup(`<b>Start:</b> ${startLocation.name || 'Start position'}`);
      markersRef.current.push(startMarker);
      bounds.push([startLocation.lat, startLocation.lng]);
    }

    // Destination Marker
    if (destination && typeof destination.lat === 'number' && typeof destination.lng === 'number') {
      const destMarker = L.marker([destination.lat, destination.lng], {
        icon: createCustomIcon('#17b267', '#ffffff', 'B')
      }).addTo(map);
      destMarker.bindPopup(`<b>Destination:</b> ${destination.name || 'Target'}`);
      markersRef.current.push(destMarker);
      bounds.push([destination.lat, destination.lng]);
    }

    // Route Polyline
    if (polyline && polyline.length > 0) {
      const latLngs = polyline.map(pt => [pt.lat, pt.lng]);
      const poly = L.polyline(latLngs, {
        color: '#0a2414',
        weight: 5,
        opacity: 0.85,
        dashArray: '6, 6'
      }).addTo(map);
      polylineRef.current = poly;
    }

    // Current Live Location Marker
    if (currentLocation && typeof currentLocation.lat === 'number' && typeof currentLocation.lng === 'number') {
      const liveIcon = L.divIcon({
        className: 'custom-live-icon',
        html: `
          <div class="marker-pulse" style="
            background-color: #1ad379;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid #0a2414;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const liveMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: liveIcon }).addTo(map);
      liveMarker.bindPopup(`<b>Current Location</b><br/>Updated live`);
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
    <div className="relative w-full h-80 sm:h-96 rounded-[9px] overflow-hidden border border-forest/10 shadow-sm bg-card">
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur px-3 py-2 rounded-[6px] border border-forest/10 shadow-sm text-xs font-mono space-y-1">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-forest border border-white"></span>
          <span className="text-forest font-semibold">Start (A)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-botanical border border-white"></span>
          <span className="text-forest font-semibold">Destination (B)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-vivid border border-forest"></span>
          <span className="text-forest font-semibold">Live Position</span>
        </div>
      </div>

      {/* Interactive Location Simulation Controls for Live Demo */}
      {(onSimulateMove || onSimulateDeviation) && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur px-3 py-2 rounded-[6px] border border-forest/10 shadow-md text-xs font-mono flex items-center space-x-2">
          <span className="text-moss font-medium">Demo Simulator:</span>
          {onSimulateMove && (
            <button
              onClick={onSimulateMove}
              className="px-2.5 py-1 bg-parchment text-forest border border-forest/10 rounded-[6px] hover:bg-card font-medium transition-colors cursor-pointer"
            >
              Advance Step
            </button>
          )}
          {onSimulateDeviation && (
            <button
              onClick={onSimulateDeviation}
              className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-[6px] hover:bg-amber-100 font-medium transition-colors cursor-pointer"
            >
              Simulate 200m Deviation
            </button>
          )}
        </div>
      )}
    </div>
  );
}