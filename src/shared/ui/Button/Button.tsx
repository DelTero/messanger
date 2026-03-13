import { ButtonHTMLAttributes } from 'react';
import { Spinner } from '@shared/ui/Spinner';
import { cn } from '@/shared/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = ({
  ref,
  children,
  variant = 'primary',
  fullWidth,
  isLoading,
  className,
  disabled,
  ...props
}: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
  const buttonVariants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
    secondary: 'bg-white text-gray-900 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };

  const buttonClasses = cn(
    'flex items-center justify-center gap-2 rounded-md px-3 py-1.5 cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    buttonVariants[variant],
    {
      'w-full': fullWidth,
    },
    className,
  );

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="text-white" />}
      {children}
    </button>
  );
};
