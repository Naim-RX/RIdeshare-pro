export function validPoint(point) {
  return Boolean(point && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90 && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180);
}
export function decodePolyline(encoded) {
  if (typeof encoded !== 'string' || !encoded.length || encoded.length > 500000) throw new Error('Invalid route line.');
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const coordinates = [];
  function next() {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      if (index >= encoded.length || shift > 30) throw new Error('Invalid route line.');
      byte = encoded.charCodeAt(index++) - 63;
      if (byte < 0 || byte > 63) throw new Error('Invalid route line.');
      result |= (byte & 31) << shift;
      shift += 5;
    } while (byte >= 32);
    return result & 1 ? ~(result >> 1) : result >> 1;
  }
  while (index < encoded.length) {
    latitude += next();
    longitude += next();
    const point = { latitude: latitude / 100000, longitude: longitude / 100000 };
    if (!validPoint(point)) throw new Error('Invalid route coordinates.');
    coordinates.push(point);
  }
  if (coordinates.length < 2) throw new Error('No route line is available.');
  return coordinates;
}
export function routeSummary(route) {
  return `${(route.distanceMeters / 1000).toFixed(1)} km · ${Math.max(1, Math.ceil(route.durationSeconds / 60))} min`;
}
