import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import RouteScreen from '../screens/customer/RouteScreen';
import AccountScreen from '../screens/AccountScreen';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import CustomerRides from '../components/CustomerRides';
import { useAuth } from '../context/AuthContext';
import { routeSummary } from '../utils/route';
import { theme } from '../theme';

export default function CustomerNavigator() {
  const { profile } = useAuth();
  const [tab, setTab] = useState('Home');
  const [routeOpen, setRouteOpen] = useState(false);
  const [draft, setDraft] = useState({ pickup: { query: '', point: null }, destination: { query: '', point: null } });
  const [message, setMessage] = useState('');
  const [confirmed, setConfirmed] = useState('');
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (routeOpen) { setRouteOpen(false); return true; }
      if (tab !== 'Home') { setTab('Home'); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [routeOpen, tab]);
  if (routeOpen) return <RouteScreen initial={draft} onBack={() => setRouteOpen(false)} onConfirm={(route) => {
    setDraft({ pickup: { query: route.pickupLabel, point: route.pickup }, destination: { query: route.destinationLabel, point: route.destination } });
    setConfirmed(routeSummary(route)); setRouteOpen(false);
  }} />;
  const icons = { Home: 'home-outline', History: 'time-outline', Profile: 'person-outline' };
  return <View style={styles.container}>
    <View style={styles.container}>
      {tab === 'Home' ? <CustomerHomeScreen draft={draft} confirmed={confirmed} message={message} onProfile={() => setTab('Profile')}
        onChange={(field, text) => { setDraft((current) => ({ ...current, [field]: { query: text, point: null } })); setMessage(''); setConfirmed(''); }}
        onContinue={() => {
          if (!draft.pickup.query.trim() || !draft.destination.query.trim()) { setMessage('Enter a pickup and destination, then select their locations on the map.'); return; }
          setMessage(''); setRouteOpen(true);
        }} /> : tab === 'History' ? <Screen><ScreenHeader title="Ride history" /><CustomerRides count={20} /></Screen> :
        <AccountScreen title="Profile">
          <Text style={styles.text}>{profile.fullName}</Text><Text style={styles.text}>{profile.email}</Text><Text style={styles.text}>{profile.mobile}</Text><Text style={styles.text}>Customer</Text>
        </AccountScreen>}
    </View>
    <SafeAreaView edges={['bottom']} style={styles.bar}>
      <View style={{ flexDirection: 'row' }}>{Object.keys(icons).map((name) => <Pressable key={name} accessibilityRole="tab" accessibilityState={{ selected: tab === name }} onPress={() => setTab(name)} style={styles.tab}>
        <Ionicons name={icons[name]} size={20} color={tab === name ? theme.colors.primary : theme.colors.textSecondary} />
        <Text style={{ ...theme.typography.caption, color: tab === name ? theme.colors.primary : theme.colors.textSecondary }}>{name}</Text>
      </Pressable>)}</View>
    </SafeAreaView>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  bar: { backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.border },
  tab: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs, padding: theme.spacing.sm },
  text: { ...theme.typography.body, color: theme.colors.text, marginBottom: theme.spacing.md },
});
