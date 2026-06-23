import { LoginForm } from '@/components/auth/LoginForm';
import { LoginHero } from '@/components/auth/LoginHero';

export const metadata = { title: 'Sign in — Atlas' };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <LoginForm />
      <LoginHero />
    </div>
  );
}
