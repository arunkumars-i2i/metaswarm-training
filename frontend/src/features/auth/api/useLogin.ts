/**
 * useLogin (T032) — TanStack Query mutation that authenticates against
 * POST /api/auth/login and records the session (token + user) on success.
 */
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../../lib/api-client.js';
import { useAuth, type AuthUser } from '../context/AuthContext.js';

export interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function useLogin(): UseMutationResult<LoginResponse, ApiError, LoginInput> {
  const { setSession } = useAuth();

  return useMutation<LoginResponse, ApiError, LoginInput>({
    mutationFn: (input) =>
      apiFetch<LoginResponse>('/api/auth/login', { method: 'POST', body: input, auth: false }),
    onSuccess: (data) => {
      setSession(data.token, data.user);
    },
  });
}
