/**
 * Real Location & Routing Services with University Campus Presets & Global Nominatim Search
 */

// University Campus Real Landmark Coordinates (MMU Campus, Mullana & Generic University Presets)
export const CAMPUS_PRESETS = [
  { name: 'Girls Hostel Block A', lat: 30.2525, lng: 77.0475, type: 'hostel' },
  { name: 'Boys Hostel Block 2', lat: 30.2510, lng: 77.0460, type: 'hostel' },
  { name: 'Central Library & Admin Block', lat: 30.2530, lng: 77.0490, type: 'academic' },
  { name: 'Engineering & CS Block', lat: 30.2535, lng: 77.0485, type: 'academic' },
  { name: 'Campus Main Gate 1', lat: 30.2505, lng: 77.0500, type: 'gate' },
  { name: 'Medical College & Hospital', lat: 30.2545, lng: 77.0510, type: 'medical' },
  { name: 'Student Cafeteria & Plaza', lat: 30.2520, lng: 77.0480, type: 'amenity' },
  { name: 'Sports Complex & Grounds', lat: 30.2500, lng: 77.0450, type: 'sports' }
];

/**
 * Get user's actual physical GPS position via browser Geolocation API
 * Fallback default is set to MMU Campus, Mullana (30.2525, 77.0475)
 */
export function getUserCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Browser geolocation unavailable, fallback to University Campus (Mullana)');
      resolve({ lat: 30.2525, lng: 77.0475, name: 'Girls Hostel Block A (MMU Campus)' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await res.json();
          const name = data.display_name
            ? data.display_name.split(',').slice(0, 3).join(',')
            : `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

          resolve({ lat, lng, name });
        } catch {
          resolve({ lat, lng, name: `Current GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})` });
        }
      },
      (error) => {
        console.warn('Geolocation error/denied:', error.message);
        // Default to Campus location (Mullana, Ambala) so local campus walks have accurate 0.3km - 1.5km distances!
        resolve({ lat: 30.2525, lng: 77.0475, name: 'Girls Hostel Block A (MMU Campus)' });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

/**
 * Search locations globally using OpenStreetMap Nominatim Geocoding API,
 * with priority given to campus landmarks.
 */
export async function searchLocationsNominatim(searchQuery) {
  if (!searchQuery || searchQuery.trim().length < 2) return [];

  const queryLower = searchQuery.toLowerCase().trim();

  // 1. First check matching Campus Presets for instant zero-latency match
  const campusMatches = CAMPUS_PRESETS.filter(p =>
    p.name.toLowerCase().includes(queryLower) ||
    'campus university hostel library gate'.includes(queryLower)
  ).map(p => ({
    name: p.name,
    fullName: `${p.name}, MMU Campus, Mullana`,
    lat: p.lat,
    lng: p.lng,
    isCampus: true
  }));

  // 2. Fetch from OpenStreetMap Nominatim API
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return campusMatches;

    const data = await res.json();
    const apiMatches = data.map((item) => ({
      name: item.display_name.split(',').slice(0, 3).join(','),
      fullName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      isCampus: false
    }));

    return [...campusMatches, ...apiMatches];
  } catch (err) {
    console.warn('Nominatim search error:', err.message);
    return campusMatches;
  }
}

/**
 * Fetch real road polyline geometry & distance/duration using OSRM Routing Engine API
 */
export async function fetchOsrmRoute(start, destination) {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${start.lng},${start.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM request failed');

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) throw new Error('No route found');

    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
    
    let distanceKm = (route.distance / 1000).toFixed(2);
    let durationMinutes = Math.max(2, Math.round(route.duration / 60));

    // If start and destination are very close (campus walk), format cleanly
    if (parseFloat(distanceKm) < 1.0) {
      const distanceMeters = Math.round(route.distance);
      distanceKm = `${distanceMeters} m`;
    } else {
      distanceKm = `${distanceKm} km`;
    }

    return {
      polyline: coordinates,
      distanceKm,
      durationMinutes
    };
  } catch (err) {
    console.warn('OSRM routing fallback to linear geometry:', err.message);
    // Interpolated polyline fallback
    const steps = 8;
    const polyline = [];
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      polyline.push({
        lat: start.lat + (destination.lat - start.lat) * ratio,
        lng: start.lng + (destination.lng - start.lng) * ratio
      });
    }

    // Haversine distance calculation in meters
    const R = 6371e3; // metres
    const φ1 = start.lat * Math.PI/180;
    const φ2 = destination.lat * Math.PI/180;
    const Δφ = (destination.lat-start.lat) * Math.PI/180;
    const Δλ = (destination.lng-start.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dMeters = Math.round(R * c);

    const distStr = dMeters > 1000 ? `${(dMeters/1000).toFixed(1)} km` : `${dMeters} m`;
    const durMin = Math.max(3, Math.round(dMeters / 80)); // ~80m per min walking speed

    return {
      polyline,
      distanceKm: distStr,
      durationMinutes: durMin
    };
  }
}
