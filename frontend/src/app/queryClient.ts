import { QueryClient } from '@tanstack/react-query';

// Shared TanStack Query client. Auth queries (useMe) tune their own retry/staleness.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});
