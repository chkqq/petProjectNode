export const passwordRules = [
  'минимум 8 символов',
  'одна строчная буква',
  'одна заглавная буква',
  'одна цифра',
  'один спецсимвол',
];

export function getPasswordChecks(password: string) {
  return [
    { label: '8+ символов', passed: password.length >= 8 },
    { label: 'строчная буква', passed: /[a-z]/.test(password) },
    { label: 'заглавная буква', passed: /[A-Z]/.test(password) },
    { label: 'цифра', passed: /\d/.test(password) },
    { label: 'спецсимвол', passed: /[^A-Za-z\d]/.test(password) },
  ];
}

export function isStrongPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/.test(
    password,
  );
}

export function assertStrongPassword(password: string): void {
  if (!isStrongPassword(password)) {
    throw new Error(`Пароль слабый: нужен ${passwordRules.join(', ')}.`);
  }
}
