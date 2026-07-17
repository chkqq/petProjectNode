export type AuthMode = 'login' | 'register';

export interface UserFormState {
  login: string;
  email: string;
  password: string;
  age: string;
  about: string;
}
