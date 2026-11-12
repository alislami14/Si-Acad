import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit
      gcTime: 1000 * 60 * 15, // 15 menit
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default queryClient;

