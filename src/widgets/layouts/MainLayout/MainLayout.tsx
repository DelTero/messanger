import { Outlet } from 'react-router';
import { Header } from './Header';
import { useAuthenticatedSocket } from '@features/socket';

export function MainLayout() {
  useAuthenticatedSocket();

  return (
    <div className="flex h-dvh w-full flex-col bg-muted">
      <Header />

      <main className="min-h-0 flex-1 w-full overflow-hidden p-5">
        <Outlet />
      </main>
    </div>
  );
}
