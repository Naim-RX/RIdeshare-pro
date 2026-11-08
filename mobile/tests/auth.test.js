import { test, expect, jest, beforeEach } from '@jest/globals';
import { fireEvent, render, screen, act, userEvent, waitFor } from '@testing-library/react-native';
import { useAuth } from '../src/context/AuthContext';
import { BackHandler } from 'react-native';
import PasswordField from '../src/components/PasswordField';
import AuthNavigator from '../src/navigation/AuthNavigator';
import LoginScreen from '../src/screens/auth/LoginScreen';
import RegistrationScreen from '../src/screens/auth/RegistrationScreen';
import PrimaryButton from '../src/components/PrimaryButton';
import SecondaryButton from '../src/components/SecondaryButton';
import RideCard from '../src/components/RideCard';
import BidCard from '../src/components/BidCard';
import LoadingIndicator from '../src/components/LoadingIndicator';
import EmptyState from '../src/components/EmptyState';

jest.mock('../src/context/AuthContext', () => ({ useAuth: jest.fn() }));
beforeEach(() => {
  useAuth.mockReturnValue({ login: jest.fn().mockRejectedValue({ code: 'auth/invalid-credential' }), register: jest.fn().mockRejectedValue({ code: 'auth/email-already-in-use' }), busy: false });
});

test('password visibility toggles without changing entered text', () => {
  render(<PasswordField value="secret123" onChangeText={() => {}} />);
  expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true);
  fireEvent.press(screen.getByRole('button', { name: 'Show password' }));
  expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false);
  expect(screen.getByLabelText('Password').props.value).toBe('secret123');
  fireEvent.press(screen.getByRole('button', { name: 'Hide password' }));
  expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true);
});

test('login shows local validation and Firebase credential errors', async () => {
  render(<LoginScreen onRegister={() => {}} />);
  fireEvent.press(screen.getByRole('button', { name: 'Login' }));
  expect(screen.getByText('Enter your email address.')).toBeTruthy();
  expect(screen.getByText('Enter your password.')).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Email'), 'person@example.com');
  fireEvent.changeText(screen.getByLabelText('Password'), 'secret123');
  expect(screen.queryByText('Enter your email address.')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Login' }));
  await waitFor(() => expect(screen.getByText('Email or password is incorrect.')).toBeTruthy());
  expect(useAuth().login).toHaveBeenCalledWith({ email: 'person@example.com', password: 'secret123' });
});

test('registration validates confirmation and submits the selected biker role', async () => {
  render(<RegistrationScreen onLogin={() => {}} />);
  fireEvent.changeText(screen.getByLabelText('Full name'), 'Test Person');
  fireEvent.changeText(screen.getByLabelText('Email'), 'person@example.com');
  fireEvent.changeText(screen.getByLabelText('Mobile Number'), '+8801712345678');
  fireEvent.changeText(screen.getByLabelText('Password'), 'secret123');
  fireEvent.changeText(screen.getByLabelText('Confirm password'), 'different');
  fireEvent.press(screen.getByRole('radio', { name: 'Biker' }));
  expect(screen.getByRole('radio', { name: 'Biker' }).props.accessibilityState.checked).toBe(true);
  fireEvent.press(screen.getByRole('button', { name: 'Create Account' }));
  expect(screen.getByText('Passwords do not match.')).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Confirm password'), 'secret123');
  fireEvent.press(screen.getByRole('button', { name: 'Create Account' }));
  await waitFor(() => expect(screen.getByText('This email is already registered. Log in instead.')).toBeTruthy());
  expect(useAuth().register).toHaveBeenCalledWith(expect.objectContaining({ role: 'biker' }));
});

test('splash advances to login; links and Android back return from registration', () => {
  jest.useFakeTimers();
  const listener = jest.spyOn(BackHandler, 'addEventListener');
  const view = render(<AuthNavigator />);
  expect(screen.getByText('Motorcycle Ride Sharing')).toBeTruthy();
  act(() => jest.advanceTimersByTime(1200));
  fireEvent.press(screen.getByRole('button', { name: 'New here? Register' }));
  expect(screen.getByText('Create your account')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Already registered? Login' }));
  expect(screen.getByText('Welcome back. Log in to continue.')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'New here? Register' }));
  const handler = listener.mock.calls[listener.mock.calls.length - 1][1];
  act(() => expect(handler()).toBe(true));
  expect(screen.getByText('Welcome back. Log in to continue.')).toBeTruthy();
  view.unmount();
  listener.mockRestore();
  jest.useRealTimers();
});

test('buttons prevent actions while disabled or loading', async () => {
  const onPress = jest.fn();
  render(<><PrimaryButton title="Submit" disabled onPress={onPress} /><SecondaryButton title="Retry" loading onPress={onPress} /></>);
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Submit' }));
  await user.press(screen.getByRole('button', { name: 'Retry' }));
  expect(onPress).not.toHaveBeenCalled();
});

test('cards render supplied data and invoke their callbacks', () => {
  const select = jest.fn();
  const open = jest.fn();
  render(<><RideCard ride={{ status: 'open', pickupLabel: 'Campus', destinationLabel: 'Library', fareLabel: 'BDT 80' }} onPress={open} />
    <BidCard bid={{ bikerName: 'Test biker', fareLabel: 'BDT 90' }} onSelect={select} /></>);
  expect(screen.getByText('Pickup: Campus')).toBeTruthy();
  expect(screen.getByText('Fare: BDT 90')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'View ride' }));
  fireEvent.press(screen.getByRole('button', { name: 'Select biker' }));
  expect(open).toHaveBeenCalledTimes(1);
  expect(select).toHaveBeenCalledTimes(1);
});

test('loading and empty states provide meaningful labels and retry action', () => {
  const retry = jest.fn();
  render(<><LoadingIndicator label="Loading rides" /><EmptyState title="No rides" message="Try again later." actionLabel="Refresh" onAction={retry} /></>);
  expect(screen.getByText('Loading rides')).toBeTruthy();
  expect(screen.getByText('No rides')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Refresh' }));
  expect(retry).toHaveBeenCalledTimes(1);
});
