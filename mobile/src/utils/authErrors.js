export function authErrorMessage(error) {
  const messages = {
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/user-not-found': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'This email is already registered. Log in instead.',
    'auth/weak-password': 'Use a stronger password with at least 8 characters.',
    'auth/password-does-not-meet-requirements': 'Your password does not meet the project password policy.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Unable to connect. Check your internet connection and try again.',
    'auth/user-disabled': 'This account has been disabled. Contact the administrator.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled. Contact the administrator.',
    'permission-denied': 'Profile access was denied. Contact the administrator if this continues.',
    unavailable: 'Unable to load your profile. Check your connection and try again.',
  };
  return messages[error?.code] || 'Something went wrong. Please try again.';
}
