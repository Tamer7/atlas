import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = { title: 'Sign in — Atlas' };

export default function LoginPage() {
  return (
    <div className="login-shell">
      <LoginForm />
    </div>
  );
}
