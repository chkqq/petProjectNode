export interface User {
  id: string;
  login: string;
  email: string;
  age: number;
  about: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
