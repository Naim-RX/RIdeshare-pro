import { beforeEach, test, expect, jest } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../src/context/AuthContext';
import RootNavigator from '../src/navigation/RootNavigator';
import * as authService from '../src/services/authService';
import { watchProfile } from '../src/services/profileService';

jest.mock('../src/services/authService', () => ({ watchAuth: jest.fn(), login: jest.fn(), register: jest.fn(), logout: jest.fn() }));
jest.mock('../src/services/profileService', () => ({ watchProfile: jest.fn(), createProfile: jest.fn() }));
let authCallback;
let profileCallback;
beforeEach(() => {
  jest.clearAllMocks();
  authService.watchAuth.mockImplementation((callback) => { authCallback = callback; return jest.fn(); });
  watchProfile.mockImplementation((uid, callback) => { profileCallback = callback; return jest.fn(); });
  authService.logout.mockImplementation(async () => authCallback(null));
});
test('restored session waits for server profile, navigates by role, then logs out', async () => {
  render(<AuthProvider><RootNavigator /></AuthProvider>);
  act(() => authCallback({ uid: 'restored-user', email: 'test@example.com' }));
  expect(screen.getByText('Loading account…')).toBeTruthy();
  act(() => profileCallback({ role: 'customer', status: 'active', fullName: 'Test User' }));
  expect(screen.getByText('Customer home')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Logout' }));
  await waitFor(() => expect(authService.logout).toHaveBeenCalledTimes(1));
  expect(screen.queryByText('Customer home')).toBeNull();
});
test('biker profile routes to biker home and disabled status blocks access', () => {
  render(<AuthProvider><RootNavigator /></AuthProvider>);
  act(() => authCallback({ uid: 'biker-user' }));
  act(() => profileCallback({ role: 'biker', status: 'active', fullName: 'Test Biker' }));
  expect(screen.getByText('Biker home')).toBeTruthy();
  act(() => profileCallback({ role: 'biker', status: 'disabled', fullName: 'Test Biker' }));
  expect(screen.getByText('Account unavailable')).toBeTruthy();
  expect(screen.queryByText('Biker home')).toBeNull();
});
test('admin profile cannot enter customer or biker flow', () => {
  render(<AuthProvider><RootNavigator /></AuthProvider>);
  act(() => authCallback({ uid: 'admin-user' }));
  act(() => profileCallback({ role: 'admin', status: 'active', fullName: 'Admin' }));
  expect(screen.getByText('Access restricted')).toBeTruthy();
});
test('missing profile exposes completion rather than authenticated home', () => {
  render(<AuthProvider><RootNavigator /></AuthProvider>);
  act(() => authCallback({ uid: 'partial-user', email: 'test@example.com' }));
  act(() => profileCallback(null));
  expect(screen.getByText('Complete your profile')).toBeTruthy();
  expect(screen.queryByText('Customer home')).toBeNull();
});
