import { cn } from '@/shared/lib/utils';
import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from '../Spinner';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Иконка (компонент) */
  icon: React.ComponentType<{ className?: string }>;

  /** Дополнительный контент */
  children?: ReactNode;

  /** Дополнительные классы */
  className?: string;

  /** Размер кнопки: 'xs', 'sm', 'md', 'lg' */
  size?: 'xs' | 'sm' | 'md' | 'lg';

  /** Вариант кнопки */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';

  /** Круглая форма */
  round?: boolean;

  /** Заблокированное состояние */
  disabled?: boolean;

  /** Загрузка состояния */
  isLoading?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  children,
  className,
  size = 'md',
  variant = 'ghost',
  round = true,
  disabled,
  isLoading,
  ...props
}) => {
  const sizeClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
  };

  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonClasses = cn(
    'inline-flex items-center justify-center transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative',
    sizeClasses[size],
    variantClasses[variant],
    {
      'rounded-full': round,
      rounded: !round,
    },
    className,
  );

  return (
    <button
      className={buttonClasses}
      type="button"
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner
          size={3}
          className="text-white"
        />
      ) : (
        <Icon className={iconSizeClasses[size]} />
      )}
      {children}
    </button>
  );
};
