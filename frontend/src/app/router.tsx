/**
 * App router (T020). Routes are lazy-loaded so each screen ships as its own chunk
 * (constitution Principle V). WU3 adds the lazy /login route; WU5 wraps protected
 * routes with ProtectedRoute.
 */
import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const HomePage = lazy(() => import('./HomePage.js'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage.js'));

function withSuspense(node: ReactNode): ReactNode {
  return <Suspense fallback={<div className="p-8">Loading…</div>}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<HomePage />),
  },
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
]);

export function AppRouter(): ReactNode {
  return <RouterProvider router={router} />;
}
