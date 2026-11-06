import { Text, View } from 'react-native';
import { theme } from '../theme';
const labels = { open: 'Open', assigned: 'Assigned', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled', pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' };
export default function StatusBadge({ status }) {
  return <View style={{ alignSelf: 'flex-start', paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.radius.sm, backgroundColor: theme.colors.primaryTint }}>
    <Text style={{ ...theme.typography.caption, color: theme.colors.primary }}>{labels[status] || status || 'Unknown status'}</Text>
  </View>;
}
