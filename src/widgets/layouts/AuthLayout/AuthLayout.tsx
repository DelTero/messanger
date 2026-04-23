import { Outlet } from 'react-router';

export const AuthLayout = () => {
  return (
    <div className="h-full w-full bg-muted">
      <div className="h-full flex items-center justify-center mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
};
