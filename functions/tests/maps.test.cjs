const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateRequest, resolveMaps } = require('../maps');
const routeInput = { action: 'route', pickup: { latitude: 23.81, longitude: 90.41 }, destination: { latitude: 23.82, longitude: 90.42 } };
test('route forwards real motorcycle request and preserves Google distance and ETA', async () => {
  const result = await resolveMaps(routeInput, 'test-only-key', async (url, options) => {
    assert.equal(url, 'https://routes.googleapis.com/directions/v2:computeRoutes');
    const body = JSON.parse(options.body);
    assert.equal(body.travelMode, 'TWO_WHEELER');
    assert.deepEqual(body.origin.location.latLng, routeInput.pickup);
    return { ok: true, json: async () => ({ routes: [{ distanceMeters: 1234, duration: '345.5s', polyline: { encodedPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' } }] }) };
  });
  assert.equal(result.distanceMeters, 1234);
  assert.equal(result.durationSeconds, 345.5);
});
test('rejects empty, invalid, identical, or out-of-range route points', () => {
  for (const data of [null, { action: 'bad' }, { ...routeInput, pickup: null }, { ...routeInput, pickup: { latitude: 91, longitude: 0 } }, { ...routeInput, pickup: routeInput.destination }]) assert.throws(() => validateRequest(data));
});
test('unavailable routes and invalid route responses produce actionable failures', async () => {
  for (const response of [{ routes: [] }, { routes: [{ distanceMeters: 1, duration: 'bad', polyline: {} }] }]) {
    await assert.rejects(resolveMaps(routeInput, 'test', async () => ({ ok: true, json: async () => response })), (error) => ['not-found', 'unavailable'].includes(error.code));
  }
});
test('network failures, billing/key failures, and quota errors do not leak upstream secrets', async () => {
  await assert.rejects(resolveMaps(routeInput, 'secret', async () => { throw new Error('secret'); }), /Unable to reach Google Maps/);
  for (const status of [403, 429, 500]) {
    await assert.rejects(resolveMaps(routeInput, 'secret', async () => ({ ok: false, status })), (error) => !error.message.includes('secret') && ['unavailable', 'resource-exhausted'].includes(error.code));
  }
});
test('autocomplete sessions and selected place IDs are validated; place coordinates are resolved', async () => {
  assert.throws(() => validateRequest({ action: 'place', placeId: '../bad', sessionToken: 'abcdefghijklmnop' }));
  assert.throws(() => validateRequest({ action: 'autocomplete', query: '', sessionToken: 'abcdefghijklmnop' }));
  const result = await resolveMaps({ action: 'place', placeId: 'test_place', sessionToken: 'abcdefghijklmnop' }, 'test', async () => ({ ok: true, json: async () => ({ id: 'test_place', formattedAddress: 'Test address', location: { latitude: 23, longitude: 90 } }) }));
  assert.equal(result.latitude, 23);
  assert.equal(result.label, 'Test address');
  await assert.rejects(resolveMaps({ action: 'place', placeId: 'bad', sessionToken: 'abcdefghijklmnop' }, 'test', async () => ({ ok: true, json: async () => ({}) })));
});
