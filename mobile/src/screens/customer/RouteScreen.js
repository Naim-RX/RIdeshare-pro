import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlaceField from '../../components/PlaceField';
import RouteMap from '../../components/RouteMap';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import ErrorMessage from '../../components/ErrorMessage';
import { getRoute } from '../../services/mapsService';
import { decodePolyline, routeSummary, validPoint } from '../../utils/route';
import { theme } from '../../theme';

export default function RouteScreen({ initial, onBack, onConfirm }) {
  const [locations, setLocations] = useState(initial);
  const [activeField, setActiveField] = useState('pickup');
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');
  const [retry, setRetry] = useState(0);
  const latest = useRef(0);
  const { pickup, destination } = locations;
  const hasPoints = validPoint(pickup.point) && validPoint(destination.point);
  useEffect(() => {
    if (!hasPoints) return;
    let active = true;
    const request = latest.current;
    getRoute(pickup.point, destination.point).then((response) => {
      if (!active || request !== latest.current) return;
      if (!(response.distanceMeters > 0) || !(response.durationSeconds > 0)) throw new Error('The route response is incomplete. Please retry.');
      const coordinates = decodePolyline(response.encodedPolyline);
      setRoute({ ...response, coordinates });
    }).catch((failure) => { if (active && request === latest.current) setError(failure.message); });
    return () => { active = false; };
  }, [pickup.point, destination.point, hasPoints, retry]);
  useEffect(() => {
    const timeout = setTimeout(() => { if (!mapReady) setMapError('The map is taking too long to load. Check your network and native Maps key configuration.'); }, 15000);
    return () => clearTimeout(timeout);
  }, [mapReady]);
  function change(field, query, point = null) {
    latest.current += 1;
    setRoute(null); setError('');
    setLocations((current) => ({ ...current, [field]: { query, point } }));
  }
  const mapKey = `${pickup.point?.latitude},${pickup.point?.longitude}:${destination.point?.latitude},${destination.point?.longitude}:${Boolean(route)}`;
  return <SafeAreaView style={styles.screen}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.panel}>
          <SecondaryButton title="Back to Home" onPress={onBack} />
          {['pickup', 'destination'].map((field) => <PlaceField key={field} label={field === 'pickup' ? 'Pickup' : 'Destination'}
            value={locations[field].query} selected={locations[field].point} onChangeText={(text) => change(field, text)}
            onSelect={(place) => { change(field, place.label, place); setActiveField(field === 'pickup' ? 'destination' : 'pickup'); }} />)}
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}><SecondaryButton title={activeField === 'pickup' ? 'Selecting pickup' : 'Select pickup on map'} onPress={() => setActiveField('pickup')} /></View>
            <View style={{ flex: 1 }}><SecondaryButton title={activeField === 'destination' ? 'Selecting destination' : 'Select destination on map'} onPress={() => setActiveField('destination')} /></View>
          </View>
        </View>
        <View style={{ flex: 1, minHeight: 300 }}>
          <RouteMap key={mapKey} pickup={pickup.point} destination={destination.point} coordinates={route?.coordinates}
            onReady={() => { setMapReady(true); setMapError(''); }} onSelect={(point) => {
              if (!validPoint(point)) { setError('Select a valid point on the map.'); return; }
              change(activeField, `Map point (${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)})`, point);
              setActiveField(activeField === 'pickup' ? 'destination' : 'pickup');
            }} />
        </View>
        <View style={styles.panel}>
          <ErrorMessage message={mapError || error} />
          <Text accessibilityLiveRegion="polite" style={{ ...theme.typography.heading, color: theme.colors.text }}>
            {route ? routeSummary(route) : hasPoints && !error ? 'Finding motorcycle route…' : 'Choose a pickup and destination.'}
          </Text>
          <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary }}>Motorcycle routes are in beta and may omit suitable roads. Use caution. ETA is an estimate from Google Maps.</Text>
          {error && hasPoints ? <SecondaryButton title="Retry route" onPress={() => { setError(''); setRoute(null); setRetry((count) => count + 1); }} /> : null}
          <PrimaryButton title="Confirm route" disabled={!route || !mapReady || Boolean(error)} onPress={() => onConfirm({ pickup: pickup.point, destination: destination.point, pickupLabel: pickup.query, destinationLabel: destination.query, ...route })} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: theme.colors.background }, panel: { padding: theme.spacing.md, gap: theme.spacing.sm } });
