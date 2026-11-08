import { useRef } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { theme } from '../theme';

export default function RouteMap({ pickup, destination, coordinates, onSelect, onReady }) {
  const ref = useRef(null);
  function fit() {
    const points = coordinates || [pickup, destination].filter(Boolean);
    if (points.length > 1) ref.current?.fitToCoordinates(points, { edgePadding: { top: 48, right: 32, bottom: 48, left: 32 }, animated: false });
  }
  // Remount on changed selections/route so initial framing cannot show stale endpoints.
  const initial = pickup || destination || { latitude: 23.8103, longitude: 90.4125 };
  return <MapView ref={ref} provider={PROVIDER_GOOGLE}
    style={{ flex: 1, minHeight: 300 }} initialRegion={{ ...initial, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
    onMapReady={() => { fit(); onReady?.(); }} onLayout={fit}
    onPress={(event) => onSelect(event.nativeEvent.coordinate)} showsUserLocation={false} showsMyLocationButton={false} toolbarEnabled={false}
    accessibilityLabel="Route map. Tap to select the active location.">
    {pickup ? <Marker coordinate={pickup} title="Pickup" pinColor={theme.colors.primary} /> : null}
    {destination ? <Marker coordinate={destination} title="Destination" /> : null}
    {coordinates ? <Polyline coordinates={coordinates} strokeColor={theme.colors.primary} strokeWidth={4} /> : null}
  </MapView>;
}
