import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from './src/navigation/AuthNavigator';
import { theme } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <AuthNavigator />
    </SafeAreaProvider>
  );
}
