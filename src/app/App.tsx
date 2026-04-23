import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';
import { router } from './router/config';
import { queryClient } from '@shared/lib/queryClient';
import { ErrorBoundary } from '@shared/ui/error-boundary';
import { GlobalCallHandler } from '@features/call';
import { Toaster } from '@/shared/ui/sonner';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          richColors
          closeButton
          duration={5000}
        />
        <GlobalCallHandler />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
