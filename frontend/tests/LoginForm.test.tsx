import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../src/features/auth/components/LoginForm';
import { AuthProvider } from '../src/features/auth/context/AuthContext';
import { clearToken } from '../src/lib/token-store';

// T026 [US1] — accessible login form with validation and generic error display.
function renderForm(onSuccess = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <LoginForm onSuccess={onSuccess} />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return { onSuccess };
}

beforeEach(() => clearToken());
afterEach(() => vi.unstubAllGlobals());

describe('LoginForm', () => {
  it('renders accessible, labeled email and password fields', () => {
    renderForm();
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors and does not call the API on empty submit', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    renderForm();

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    // Inputs marked invalid for assistive tech.
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('calls onSuccess after a successful login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ token: 'jwt-abc', user: { id: 'u1', email: 'rep@example.com' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    const { onSuccess } = renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), 'rep@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'correct-password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('shows the generic error message on invalid credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    const { onSuccess } = renderForm();

    await userEvent.type(screen.getByLabelText(/email/i), 'rep@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email or password/i);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
