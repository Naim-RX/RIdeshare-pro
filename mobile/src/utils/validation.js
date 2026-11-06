const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(values) {
  const errors = {};
  if (!values.email.trim()) errors.email = 'Enter your email address.';
  else if (!emailPattern.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Enter your password.';
  return errors;
}

function validateRegistration(values) {
  const errors = validateLogin(values);
  if (values.fullName.trim().length < 2) errors.fullName = 'Enter your full name (at least 2 characters).';
  const phone = values.mobile.trim().replace(/[\s()-]/g, '');
  if (!/^\+?[0-9]{7,15}$/.test(phone)) errors.mobile = 'Enter a valid mobile number with 7–15 digits.';
  if (values.password && values.password.length < 8) errors.password = 'Use at least 8 characters for your password.';
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  if (!['customer', 'biker'].includes(values.role)) errors.role = 'Select Customer or Biker.';
  return errors;
}

module.exports = { validateLogin, validateRegistration };
