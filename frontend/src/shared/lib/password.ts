export const passwordRules = [
  'at least 8 characters',
  'one lowercase letter',
  'one uppercase letter',
  'one number',
  'one special character',
];

export function getPasswordChecks(password: string) {
  return [
    { label: '8+ chars', passed: password.length >= 8 },
    { label: 'lowercase', passed: /[a-z]/.test(password) },
    { label: 'uppercase', passed: /[A-Z]/.test(password) },
    { label: 'number', passed: /\d/.test(password) },
    { label: 'special char', passed: /[^A-Za-z\d]/.test(password) },
  ];
}

export function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/.test(
    password,
  );
}

export function assertStrongPassword(password: string): void {
  if (!isStrongPassword(password)) {
    throw new Error(`Weak password: required ${passwordRules.join(', ')}.`);
  }
}
