/**
 * LoginForm (T033). Accessible (WCAG 2.1 AA): every control has an associated <label>,
 * errors are programmatically linked via aria-describedby + aria-invalid, the failure
 * message is an aria-live alert, and the form is fully keyboard operable. Client-side
 * validation mirrors the server's (FR-002/FR-003) so bad input never hits the network.
 */
import { useState, type FormEvent, type ReactNode } from 'react';
import { useLogin } from '../api/useLogin.js';

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ onSuccess }: { onSuccess?: () => void }): ReactNode {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!EMAIL_RE.test(email.trim())) {
      next.email = 'A valid email address is required.';
    }
    if (password.length === 0) {
      next.password = 'Password is required.';
    }
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.email || found.password) {
      return;
    }
    login.mutate(
      { email: email.trim(), password },
      { onSuccess: () => onSuccess?.() },
    );
  }

  const genericError = login.isError ? 'Invalid email or password.' : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {genericError && (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">
          {genericError}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-900">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="rounded border border-gray-400 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {errors.email && (
          <span id="email-error" className="text-sm text-red-800">
            {errors.email}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-900">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className="rounded border border-gray-400 px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {errors.password && (
          <span id="password-error" className="text-sm text-red-800">
            {errors.password}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={login.isPending}
        className="rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
      >
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
