import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { Chat, Login, Signup, MainLayout, AuthLayout, NotFound } from './lazyComponents';
import { authCheck } from '@features/auth';
import { ROUTES } from '@shared/config/routes';
import { RouterErrorBoundary } from '@shared/ui/error-boundary';
import { LoadingIndicator } from '@shared/ui/loading-indicator';
import { Spinner } from '@shared/ui/spinner';

const routeSuspenseFallback = (
  <div className="flex items-center justify-center h-full">
    <Spinner className="size-12" />
  </div>
);

// Функция для обертывания компонентов в Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={routeSuspenseFallback}>
    <Component />
  </Suspense>
);

// Функция для создания корневого компонента с индикатором загрузки
const withRootLayout = (Component: React.ComponentType) => (
  <>
    <LoadingIndicator />
    {withSuspense(Component)}
  </>
);

export const router = createBrowserRouter([
  {
    element: withRootLayout(MainLayout),
    path: ROUTES.ROOT,
    errorElement: <RouterErrorBoundary />,
    loader: authCheck,
    children: [
      {
        path: ROUTES.CHAT,
        element: withSuspense(Chat),
      },
    ],
  },
  {
    element: withRootLayout(AuthLayout),
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: withSuspense(Login),
      },
      {
        path: ROUTES.SIGNUP,
        element: withSuspense(Signup),
      },
    ],
  },
  {
    path: ROUTES.NOT_FOUND,
    errorElement: <RouterErrorBoundary />,
    element: withRootLayout(NotFound),
  },
]);
