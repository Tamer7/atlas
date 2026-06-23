export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  color?: string;
  avatar_url?: string | null;
}
