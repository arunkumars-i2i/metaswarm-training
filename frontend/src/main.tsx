import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Placeholder entry. WU2 (T020) replaces this with the router + TanStack Query provider.
const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <div>CRM</div>
    </StrictMode>,
  );
}
