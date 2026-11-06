const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateLogin, validateRegistration } = require('../src/utils/validation');

const valid = { fullName: 'Test User', email: ' user@example.com ', mobile: '+880 1712-345678', password: 'secret123', confirmPassword: 'secret123', role: 'customer' };
test('login requires email and password and rejects malformed email', () => {
  assert.deepEqual(Object.keys(validateLogin({ email: ' ', password: '' })), ['email', 'password']);
  assert.equal(validateLogin({ email: 'bad@', password: 'x' }).email, 'Enter a valid email address.');
  assert.deepEqual(validateLogin({ email: ' user@example.com ', password: 'x' }), {});
});
test('registration accepts both public roles and formatted mobile numbers', () => {
  assert.deepEqual(validateRegistration(valid), {});
  assert.deepEqual(validateRegistration({ ...valid, role: 'biker' }), {});
});
test('registration rejects empty fields', () => {
  const errors = validateRegistration({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '', role: '' });
  assert.deepEqual(Object.keys(errors).sort(), ['confirmPassword', 'email', 'fullName', 'mobile', 'password', 'role']);
});
test('registration rejects invalid names, phone numbers, short passwords, mismatches and privileged roles', () => {
  const errors = validateRegistration({ ...valid, fullName: ' ', mobile: '12abc345678', password: 'short', confirmPassword: 'different', role: 'admin' });
  for (const field of ['fullName', 'mobile', 'password', 'confirmPassword', 'role']) assert.ok(errors[field]);
});
test('phone length boundaries and password confirmation are enforced', () => {
  for (const mobile of ['123456', '1234567890123456', '++123456789', '123.4567']) assert.ok(validateRegistration({ ...valid, mobile }).mobile);
  for (const mobile of ['1234567', '+123456789012345']) assert.equal(validateRegistration({ ...valid, mobile }).mobile, undefined);
  assert.ok(validateRegistration({ ...valid, confirmPassword: '' }).confirmPassword);
});
