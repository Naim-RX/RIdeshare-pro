class MapsError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
function coordinate(value) {
  if (!value || !Number.isFinite(value.latitude) || !Number.isFinite(value.longitude)
    || Math.abs(value.latitude) > 90 || Math.abs(value.longitude) > 180) {
    throw new MapsError('invalid-argument', 'Select a valid point on the map.');
  }
  return { latitude: value.latitude, longitude: value.longitude };
}
function text(value, max) { return typeof value === 'string' && value.trim().length > 0 && value.length <= max; }
function validateRequest(data) {
  if (!data || !['autocomplete', 'place', 'route'].includes(data.action)) throw new MapsError('invalid-argument', 'Invalid map request.');
  if (data.action === 'route') {
    const pickup = coordinate(data.pickup);
    const destination = coordinate(data.destination);
    if (pickup.latitude === destination.latitude && pickup.longitude === destination.longitude) throw new MapsError('invalid-argument', 'Choose different pickup and destination points.');
    return { action: 'route', pickup, destination };
  }
  if (!text(data.sessionToken, 36) || !/^[a-zA-Z0-9_-]{16,36}$/.test(data.sessionToken)) throw new MapsError('invalid-argument', 'Invalid search session.');
  if (data.action === 'autocomplete' && (!text(data.query, 200) || data.query.trim().length < 3)) throw new MapsError('invalid-argument', 'Enter at least 3 characters.');
  if (data.action === 'place' && (!text(data.placeId, 256) || !/^[a-zA-Z0-9_-]+$/.test(data.placeId))) throw new MapsError('invalid-argument', 'Select a valid search result.');
  return { ...data, query: data.query?.trim() };
}
async function googleRequest(fetcher, key, url, options, mask) {
  let response;
  try {
    response = await fetcher(url, { ...options, headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': mask }, signal: AbortSignal.timeout(10000) });
  } catch { throw new MapsError('unavailable', 'Unable to reach Google Maps. Please retry.'); }
  if (!response.ok) {
    if (response.status === 429) throw new MapsError('resource-exhausted', 'Map request limit reached. Please try again later.');
    if (response.status === 404) throw new MapsError('not-found', 'This place is unavailable. Choose another result.');
    throw new MapsError('unavailable', 'Google Maps could not complete this request. Please retry later.');
  }
  try { return await response.json(); }
  catch { throw new MapsError('unavailable', 'Google Maps returned an invalid response.'); }
}
async function resolveMaps(data, key, fetcher = fetch) {
  const input = validateRequest(data);
  if (input.action === 'autocomplete') {
    const result = await googleRequest(fetcher, key, 'https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST', body: JSON.stringify({ input: input.query, sessionToken: input.sessionToken, languageCode: 'en', regionCode: 'BD' }),
    }, 'suggestions.placePrediction.placeId,suggestions.placePrediction.text');
    return { suggestions: (result.suggestions || []).filter((entry) => entry.placePrediction?.placeId).slice(0, 5).map(({ placePrediction }) => ({ placeId: placePrediction.placeId, label: placePrediction.text?.text || '' })) };
  }
  if (input.action === 'place') {
    const result = await googleRequest(fetcher, key, `https://places.googleapis.com/v1/places/${encodeURIComponent(input.placeId)}?sessionToken=${encodeURIComponent(input.sessionToken)}`, { method: 'GET' }, 'id,displayName,formattedAddress,location');
    return { ...coordinate(result.location), placeId: result.id, label: result.formattedAddress || result.displayName?.text || 'Selected place' };
  }
  const result = await googleRequest(fetcher, key, 'https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST', body: JSON.stringify({ origin: { location: { latLng: input.pickup } }, destination: { location: { latLng: input.destination } }, travelMode: 'TWO_WHEELER', computeAlternativeRoutes: false, polylineEncoding: 'ENCODED_POLYLINE', languageCode: 'en', units: 'METRIC' }),
  }, 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline');
  const route = result.routes?.[0];
  if (!route) throw new MapsError('not-found', 'No motorcycle route is available between these points.');
  const seconds = typeof route.duration === 'string' && /^\d+(\.\d+)?s$/.test(route.duration) ? Number(route.duration.slice(0, -1)) : NaN;
  if (!Number.isFinite(route.distanceMeters) || route.distanceMeters <= 0 || !Number.isFinite(seconds) || seconds <= 0 || !text(route.polyline?.encodedPolyline, 500000)) {
    throw new MapsError('unavailable', 'Google Maps returned incomplete route information.');
  }
  return { distanceMeters: route.distanceMeters, durationSeconds: seconds, encodedPolyline: route.polyline.encodedPolyline };
}
module.exports = { MapsError, coordinate, validateRequest, resolveMaps };
