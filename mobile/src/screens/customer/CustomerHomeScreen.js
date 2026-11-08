import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import ErrorMessage from '../../components/ErrorMessage';
import CustomerRides from '../../components/CustomerRides';
import { theme } from '../../theme';

export default function CustomerHomeScreen({ draft, onChange, onContinue, onProfile, message, confirmed }) {
  return <Screen>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
      <Text accessibilityRole="header" style={{ ...theme.typography.title, color: theme.colors.text }}>Book a ride</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={onProfile} style={{ minHeight: 48, minWidth: 48, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="person-circle-outline" size={28} color={theme.colors.primary} />
      </Pressable>
    </View>
    <TextField label="Pickup" value={draft.pickup.query} placeholder="Enter pickup" onChangeText={(text) => onChange('pickup', text)} />
    <TextField label="Destination" value={draft.destination.query} placeholder="Enter destination" onChangeText={(text) => onChange('destination', text)} />
    <ErrorMessage message={message} />
    {confirmed ? <Text accessibilityLiveRegion="polite" style={{ ...theme.typography.body, color: theme.colors.primary, marginBottom: theme.spacing.md }}>Route confirmed: {confirmed}. Ride posting is not available yet.</Text> : null}
    <PrimaryButton title="Continue" onPress={onContinue} />
    <Text accessibilityRole="header" style={{ ...theme.typography.heading, color: theme.colors.text, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md }}>Recent rides</Text>
    <CustomerRides />
  </Screen>;
}
