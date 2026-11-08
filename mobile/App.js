import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { theme } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <AuthProvider><RootNavigator /></AuthProvider>
    </SafeAreaProvider>
  );
}
