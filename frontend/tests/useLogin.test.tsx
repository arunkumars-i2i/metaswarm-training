import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLogin } from '../src/features/auth/api/useLogin';
import { AuthProvider } from '../src/features/auth/context/AuthContext';
import { getToken, clearToken } from '../src/lib/token-store';

// T027 [US1] — useLogin mutation stores the session on success, surfaces error on failure.
function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => clearToken());
afterEach(() => vi.unstubAllGlobals());

describe('useLogin', () => {
  it('stores the token after a successful login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ token: 'jwt-abc', user: { id: 'u1', email: 'rep@example.com' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ email: 'rep@example.com', password: 'pw' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getToken()).toBe('jwt-abc');
  });

  it('surfaces a generic error and stores no token on 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    const { result } = renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ email: 'rep@example.com', password: 'bad' }).catch(() => {});
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getToken()).toBeNull();
  });
});
