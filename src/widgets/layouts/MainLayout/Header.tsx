import { Link, useLocation } from 'react-router';
import { UserMenu } from './UserMenu';
import { cn } from '@shared/lib/utils';
import { useState } from 'react';
import { ROUTES } from '@shared/config/routes';
import { Notifications } from '@features/notifications';
import { Button } from '@shared/ui/button';
import { Menu, X } from 'lucide-react';
import logo from '@assets/chat.png';
import { useUserStore } from '@/features/auth';

export const Header = () => {
  const user = useUserStore((state) => state.user);

  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [{ name: 'Chat', to: ROUTES.CHAT }];

  const getNavItemClasses = (path: string) => {
    const isActive = location.pathname === path;

    return cn(
      {
        'bg-primary text-primary-foreground': isActive,
        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground': !isActive,
      },
      'rounded-md px-3 py-2 text-sm font-medium',
    );
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const mobileMenuClasses = cn(
    {
      block: isMenuOpen,
      hidden: !isMenuOpen,
    },
    'md:hidden',
  );

  const getMobileNavItemClasses = (path: string) => {
    const isActive = location.pathname === path;

    return cn(
      {
        'bg-primary text-primary-foreground': isActive,
        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground': !isActive,
      },
      'block rounded-md px-3 py-2 text-base font-medium',
    );
  };

  return (
    <header className="sticky top-0 z-10 bg-sidebar shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-8">
            <Link
              to={ROUTES.ROOT}
              className="text-2xl font-bold text-primary"
            >
              <img
                src={logo}
                alt="Logo"
                className="size-10"
              />
            </Link>

            {/* Десктопная навигация */}
            <nav className="hidden gap-8 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={getNavItemClasses(item.to)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Кнопка уведомлений */}
            <Notifications />

            <div className="flex items-center gap-2">
              <span className="hidden text-sidebar-foreground sm:inline">{user?.name}</span>
              <UserMenu />
            </div>

            {/* Бургер-кнопка для мобильного меню */}
            <Button
              variant="secondary"
              size="icon"
              className="md:hidden"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              {!isMenuOpen ? <Menu data-icon="inline-start" /> : <X data-icon="inline-start" />}
              <span className="sr-only">Открыть главное меню</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        className={mobileMenuClasses}
        id="mobile-menu"
      >
        <div className="flex flex-col gap-1 px-2 pt-2 pb-3 sm:px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className={getMobileNavItemClasses(item.to)}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};
