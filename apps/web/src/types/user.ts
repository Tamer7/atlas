export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  color?: string;
  avatar_url?: string | null;
}
