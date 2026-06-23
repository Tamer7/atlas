import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginHero } from '@/components/auth/LoginHero';

export const metadata = { title: 'Create account — Atlas' };

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <RegisterForm />
      <LoginHero />
    </div>
  );
}
