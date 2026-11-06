import { StyleSheet, Text, View } from 'react-native';
import StatusBadge from './StatusBadge';
import SecondaryButton from './SecondaryButton';
import { theme } from '../theme';
export default function RideCard({ ride, onPress, actionLabel = 'View ride' }) {
  return <View style={cardStyles.card}>
    <StatusBadge status={ride.status} />
    <Text style={cardStyles.title}>Pickup: {ride.pickupLabel}</Text>
    <Text style={cardStyles.body}>Destination: {ride.destinationLabel}</Text>
    {ride.fareLabel ? <Text style={cardStyles.body}>Expected fare: {ride.fareLabel}</Text> : null}
    {ride.routeLabel ? <Text style={cardStyles.body}>{ride.routeLabel}</Text> : null}
    {onPress ? <SecondaryButton title={actionLabel} onPress={onPress} /> : null}
  </View>;
}
export const cardStyles = StyleSheet.create({
  card: { padding: theme.spacing.md, gap: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface },
  title: { ...theme.typography.body, fontWeight: '600', color: theme.colors.text },
  body: { ...theme.typography.body, color: theme.colors.textSecondary },
});
