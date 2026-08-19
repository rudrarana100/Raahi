/**
 * Calculates Haversine distance in meters between two lat/lng points
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates perpendicular/closest distance from a point to a line segment
 * with accurate metric projection using latitude scaling.
 */
function distanceToSegment(p, v, w) {
  const l2 = calculateHaversineDistance(v.lat, v.lng, w.lat, w.lng);
  if (l2 === 0) return calculateHaversineDistance(p.lat, p.lng, v.lat, v.lng);
  
  // Use average latitude to scale longitude degree differences into meters/equivalent scale
  const avgLatRad = ((v.lat + w.lat) / 2) * (Math.PI / 180);
  const cosLat = Math.cos(avgLatRad);

  const dx = (w.lng - v.lng) * cosLat;
  const dy = w.lat - v.lat;
  
  const pdx = (p.lng - v.lng) * cosLat;
  const pdy = p.lat - v.lat;

  let t = (pdx * dx + pdy * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));

  const projLat = v.lat + t * (w.lat - v.lat);
  const projLng = v.lng + t * (w.lng - v.lng);

  return calculateHaversineDistance(p.lat, p.lng, projLat, projLng);
}

/**
 * Calculates minimum distance from current location to expected route polyline
 */
export function minDistanceToPolyline(currentLocation, polyline) {
  if (!polyline || polyline.length === 0) return 0;
  if (polyline.length === 1) {
    return calculateHaversineDistance(
      currentLocation.lat,
      currentLocation.lng,
      polyline[0].lat,
      polyline[0].lng
    );
  }

  let minDistance = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const dist = distanceToSegment(currentLocation, polyline[i], polyline[i + 1]);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return minDistance === Infinity ? 0 : minDistance;
}

/**
 * Evaluates route deviation state
 */
export function evaluateDeviation({ currentLocation, polyline, consecutiveDeviations = 0, thresholdMeters = 150 }) {
  if (!currentLocation || !polyline || polyline.length === 0) {
    return {
      isDeviated: false,
      distanceMeters: 0,
      consecutiveCount: 0,
      action: 'NONE'
    };
  }

  const distanceMeters = Math.round(minDistanceToPolyline(currentLocation, polyline));
  const isDeviated = distanceMeters > thresholdMeters;
  const consecutiveCount = isDeviated ? (consecutiveDeviations + 1) : 0;

  let action = 'NONE';
  if (consecutiveCount === 1) {
    action = 'TRIGGER_NUDGE'; // "Still good?" soft nudge
  } else if (consecutiveCount >= 2) {
    action = 'ESCALATE_ALERT'; // Escalate to deviation alert
  }

  return {
    isDeviated,
    distanceMeters,
    consecutiveCount,
    action
  };
}