import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { watchCustomerRides } from '../services/rideHistoryService';
import LoadingIndicator from './LoadingIndicator';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import RideCard from './RideCard';
import { theme } from '../theme';

export default function CustomerRides({ count = 5 }) {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, rides: [], error: '' });
  useEffect(() => {
    let active = true;
    const unsubscribe = watchCustomerRides(user.uid, count,
      (rides) => { if (active) setState({ loading: false, rides, error: '' }); },
      () => { if (active) setState({ loading: false, rides: [], error: 'Unable to load rides. Check your connection, deployed rules, and indexes.' }); });
    return () => { active = false; unsubscribe(); };
  }, [user.uid, count]);
  return <View style={{ gap: theme.spacing.md }}>
    {state.loading ? <LoadingIndicator label="Loading rides…" /> : state.error ? <ErrorMessage message={state.error} /> : state.rides.length ? state.rides.map((ride) =>
      <RideCard key={ride.id} ride={{ status: ride.status, pickupLabel: ride.pickupLabel || 'Pickup unavailable', destinationLabel: ride.destinationLabel || 'Destination unavailable' }} />)
      : <EmptyState title="No rides yet" message="Your rides will appear here after ride booking is available." />}
    <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary }}>Showing up to {count} most recent rides.</Text>
  </View>;
}
