/**
 * LoginPage (T034). Lazy-loaded route hosting the LoginForm. On success it routes to
 * the CRM home; already-authenticated users are redirected away from the login screen.
 */
import type { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm.js';
import { useAuth } from '../context/AuthContext.js';

export default function LoginPage(): ReactNode {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Sign in to the CRM</h1>
      <LoginForm onSuccess={() => navigate('/', { replace: true })} />
    </main>
  );
}
