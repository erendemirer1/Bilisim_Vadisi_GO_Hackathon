export interface User {
  email: string;
  password: string;
  name: string;
  surname: string;
  phone: number;
  isAdmin?: boolean;
}