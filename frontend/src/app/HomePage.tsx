import type { ReactNode } from 'react';

// Placeholder protected landing page. WU5 wraps the protected routes with ProtectedRoute
// and a logout control; this stands in as the CRM home for now.
export default function HomePage(): ReactNode {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">CRM</h1>
      <p className="mt-2 text-gray-700">You are signed in.</p>
    </main>
  );
}
