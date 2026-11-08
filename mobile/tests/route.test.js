import { beforeEach, test, expect, jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import RouteScreen from '../src/screens/customer/RouteScreen';
import PlaceField from '../src/components/PlaceField';
import CustomerNavigator from '../src/navigation/CustomerNavigator';
import { decodePolyline } from '../src/utils/route';
import { getRoute, searchPlaces, resolvePlace } from '../src/services/mapsService';

jest.mock('../src/context/AuthContext', () => ({ useAuth: () => ({ user: { uid: 'customer' }, profile: { fullName: 'Test User' } }) }));
jest.mock('../src/services/mapsService', () => ({ getRoute: jest.fn(), searchPlaces: jest.fn(), resolvePlace: jest.fn() }));
jest.mock('../src/services/rideHistoryService', () => ({ watchCustomerRides: (uid, count, callback) => { callback([]); return () => {}; } }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Map = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({ fitToCoordinates: () => {} }));
    return <View {...props} testID="native-map" />;
  });
  Map.displayName = 'MockMap';
  return { __esModule: true, default: Map, PROVIDER_GOOGLE: 'google', Marker: (props) => <View {...props} testID={`marker-${props.title}`} />, Polyline: (props) => <View {...props} testID="route-line" /> };
});
const line = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
const initial = { pickup: { query: 'Campus', point: { latitude: 38.5, longitude: -120.2 } }, destination: { query: 'Library', point: { latitude: 43.252, longitude: -126.453 } } };
beforeEach(() => {
  jest.clearAllMocks();
  getRoute.mockResolvedValue({ distanceMeters: 1234, durationSeconds: 345, encodedPolyline: line });
  searchPlaces.mockResolvedValue({ suggestions: [] });
});
test('valid endpoints render two markers and the provider route; confirm returns provider totals', async () => {
  const confirm = jest.fn();
  render(<RouteScreen initial={initial} onBack={() => {}} onConfirm={confirm} />);
  fireEvent(screen.getByTestId('native-map'), 'mapReady');
  await waitFor(() => expect(screen.getByText('1.2 km · 6 min')).toBeTruthy());
  expect(screen.getByTestId('marker-Pickup').props.coordinate).toEqual(initial.pickup.point);
  expect(screen.getByTestId('marker-Destination').props.coordinate).toEqual(initial.destination.point);
  expect(screen.getByTestId('route-line').props.coordinates).toEqual(decodePolyline(line));
  fireEvent.press(screen.getByRole('button', { name: 'Confirm route' }));
  expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ distanceMeters: 1234, durationSeconds: 345 }));
});
test('changing either input clears the selected point and stale route immediately', async () => {
  render(<RouteScreen initial={initial} onBack={() => {}} onConfirm={() => {}} />);
  await waitFor(() => expect(screen.getByTestId('route-line')).toBeTruthy());
  fireEvent.changeText(screen.getByLabelText('Pickup'), 'New campus');
  expect(screen.queryByTestId('marker-Pickup')).toBeNull();
  expect(screen.queryByTestId('route-line')).toBeNull();
  fireEvent.changeText(screen.getByLabelText('Destination'), 'New library');
  expect(screen.queryByTestId('marker-Destination')).toBeNull();
  expect(screen.getByRole('button', { name: 'Confirm route' })).toBeDisabled();
});
test('empty and invalid locations cannot request or confirm a route', () => {
  render(<RouteScreen initial={{ pickup: { query: '', point: null }, destination: { query: '', point: null } }} onBack={() => {}} onConfirm={() => {}} />);
  expect(getRoute).not.toHaveBeenCalled();
  fireEvent(screen.getByTestId('native-map'), 'press', { nativeEvent: { coordinate: { latitude: 200, longitude: 0 } } });
  expect(screen.getByText('Select a valid point on the map.')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Confirm route' })).toBeDisabled();
});
test('map taps select manual pickup and destination without device location access', async () => {
  render(<RouteScreen initial={{ pickup: { query: '', point: null }, destination: { query: '', point: null } }} onBack={() => {}} onConfirm={() => {}} />);
  fireEvent(screen.getByTestId('native-map'), 'press', { nativeEvent: { coordinate: initial.pickup.point } });
  fireEvent(screen.getByTestId('native-map'), 'press', { nativeEvent: { coordinate: initial.destination.point } });
  await waitFor(() => expect(getRoute).toHaveBeenCalledWith(initial.pickup.point, initial.destination.point));
});
test('API failure displays an error and retry can recover', async () => {
  getRoute.mockRejectedValueOnce(new Error('No motorcycle route is available.'));
  render(<RouteScreen initial={initial} onBack={() => {}} onConfirm={() => {}} />);
  await waitFor(() => expect(screen.getByText('No motorcycle route is available.')).toBeTruthy());
  expect(screen.getByRole('button', { name: 'Confirm route' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Retry route' }));
  await waitFor(() => expect(screen.getByText('1.2 km · 6 min')).toBeTruthy());
});
test('invalid place details never become a selected endpoint', async () => {
  searchPlaces.mockResolvedValue({ suggestions: [{ placeId: 'test', label: 'Campus result' }] });
  resolvePlace.mockResolvedValue({ label: 'Bad place', latitude: NaN, longitude: 90 });
  const select = jest.fn();
  render(<PlaceField label="Pickup" value="Campus" selected={null} onChangeText={() => {}} onSelect={select} />);
  await waitFor(() => expect(screen.getByText('Campus result')).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: 'Campus result' }));
  await waitFor(() => expect(screen.getByText('This place has no valid coordinates. Select another result.')).toBeTruthy());
  expect(select).not.toHaveBeenCalled();
});
test('home validates empty inputs and provides history/profile tabs', () => {
  render(<CustomerNavigator />);
  fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.getByText(/Enter a pickup and destination/)).toBeTruthy();
  fireEvent.press(screen.getByRole('tab', { name: 'History' }));
  expect(screen.getByText('Ride history')).toBeTruthy();
  fireEvent.press(screen.getByRole('tab', { name: 'Profile' }));
  expect(screen.getByText('Test User')).toBeTruthy();
});
test('invalid route encodings fail rather than drawing invented lines', () => {
  expect(() => decodePolyline('')).toThrow();
  expect(() => decodePolyline('???')).toThrow();
  expect(decodePolyline(line)).toHaveLength(3);
});
test('a late route response cannot restore the old route after an endpoint edit', async () => {
  let finish;
  getRoute.mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
  render(<RouteScreen initial={initial} onBack={() => {}} onConfirm={() => {}} />);
  fireEvent.changeText(screen.getByLabelText('Destination'), 'Changed destination');
  await act(async () => finish({ distanceMeters: 1234, durationSeconds: 345, encodedPolyline: line }));
  expect(screen.queryByTestId('route-line')).toBeNull();
  expect(screen.getByRole('button', { name: 'Confirm route' })).toBeDisabled();
});
test('place-search network failures are shown without inventing suggestions', async () => {
  searchPlaces.mockRejectedValue(new Error('Unable to reach the map service.'));
  render(<PlaceField label="Pickup" value="Campus" selected={null} onChangeText={() => {}} onSelect={() => {}} />);
  await waitFor(() => expect(screen.getByText('Unable to reach the map service.')).toBeTruthy());
  expect(screen.queryByText('Campus result')).toBeNull();
});
