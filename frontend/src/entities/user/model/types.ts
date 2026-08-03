export interface User {
  id: string;
  login: string;
  email: string;
  age: number;
  about: string | null;
  balance: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
