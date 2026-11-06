import { Text, View } from 'react-native';
import PrimaryButton from './PrimaryButton';
import StatusBadge from './StatusBadge';
import { cardStyles } from './RideCard';
export default function BidCard({ bid, onSelect, disabled = false, loading = false }) {
  return <View style={cardStyles.card}>
    <Text style={cardStyles.title}>{bid.bikerName}</Text>
    <Text style={cardStyles.body}>Fare: {bid.fareLabel}</Text>
    {bid.ratingLabel ? <Text style={cardStyles.body}>{bid.ratingLabel}</Text> : null}
    {bid.status ? <StatusBadge status={bid.status} /> : null}
    {onSelect ? <PrimaryButton title="Select biker" onPress={onSelect} disabled={disabled} loading={loading} /> : null}
  </View>;
}
