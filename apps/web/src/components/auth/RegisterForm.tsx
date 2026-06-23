'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '@/hooks/auth/useRegister';
import { Spinner } from '@/components/ui/Spinner';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ name, email, password, password_confirmation: confirm });
  };

  const error =
    (register.error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
      ?.response?.data;

  const fieldError = (field: string) => error?.errors?.[field]?.[0];

  return (
    <div className="flex items-center justify-center p-12 bg-paper min-h-screen">
      <div className="w-full max-w-[420px]">
        {/* Brand mark */}
        <div className="flex items-center gap-2.5 mb-10">
          <div
            className="w-7 h-7 flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--ink)', borderRadius: 'var(--r-sm)' }}
          >
            A
          </div>
          <span className="font-semibold text-ink text-lg tracking-tight">Atlas</span>
        </div>

        <h1
          className="text-ink font-semibold mb-2"
          style={{ fontSize: 38, letterSpacing: '-0.025em' }}
        >
          Create your account.
        </h1>
        <p className="text-muted mb-8" style={{ fontSize: 15 }}>
          Join thousands of learners on Atlas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name', label: 'Full name', type: 'text', value: name, setter: setName, placeholder: 'Sofia Chen', required: true },
            { id: 'email', label: 'Email', type: 'email', value: email, setter: setEmail, placeholder: 'you@email.com', required: true },
            { id: 'password', label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: '8+ characters', required: true },
            { id: 'confirm', label: 'Confirm password', type: 'password', value: confirm, setter: setConfirm, placeholder: '••••••••', required: true },
          ].map(({ id, label, type, value, setter, placeholder, required }) => (
            <div key={id}>
              <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
              <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                required={required}
                minLength={id === 'password' ? 8 : undefined}
                className="w-full h-11 px-3.5 text-sm text-ink placeholder:text-faint"
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${fieldError(id) ? 'var(--danger)' : 'var(--line-2)'}`,
                  borderRadius: 'var(--r-md)',
                  outline: 'none',
                }}
                onFocus={(e) =>
                  !fieldError(id) && (e.currentTarget.style.borderColor = 'var(--brand)')
                }
                onBlur={(e) =>
                  !fieldError(id) && (e.currentTarget.style.borderColor = 'var(--line-2)')
                }
              />
              {fieldError(id) && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
                  {fieldError(id)}
                </p>
              )}
            </div>
          ))}

          {error?.message && !error.errors && (
            <p className="text-sm" style={{ color: 'var(--danger)' }}>
              {error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full h-11 flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all active:translate-y-px disabled:opacity-60"
            style={{
              background: 'var(--ink)',
              borderRadius: 'var(--r-md)',
              border: 0,
              cursor: register.isPending ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) =>
              !register.isPending && (e.currentTarget.style.background = 'var(--ink-2)')
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--ink)')}
          >
            {register.isPending ? <Spinner size={16} /> : 'Create account'}
          </button>
        </form>

        <p className="mt-7 text-center text-xs" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-ink">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
