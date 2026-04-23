import { ChangeEvent, InputHTMLAttributes, Ref, useRef, useState } from 'react';
import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { cn } from '@shared/lib/utils';
import { Eye, EyeOff, X } from 'lucide-react';

export interface InputProps<TFieldValues extends FieldValues = FieldValues>
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  containerClassName?: string;
  showPasswordToggle?: boolean;
  showClearButton?: boolean;
  control?: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  error?: string;
}

type RawInputProps = Omit<InputProps<FieldValues>, 'control'> & { ref?: Ref<HTMLInputElement> };

function RawInput({
  ref: forwardedRef,
  label,
  helperText,
  className,
  fullWidth = true,
  containerClassName,
  showPasswordToggle = false,
  showClearButton = true,
  type,
  error,
  value,
  onChange,
  ...props
}: RawInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hasValue = Boolean(value);
  const hasError = Boolean(error);

  const handleClear = () => {
    onChange?.({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
    inputRef.current?.focus();
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const mergeRef = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof forwardedRef === 'function') forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
  };

  return (
    <div className={cn('flex flex-col gap-2', containerClassName)}>
      {label && (
        <label
          htmlFor={props.id}
          className={cn('block text-left text-sm/6 font-medium', hasError ? 'text-destructive' : 'text-foreground')}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          ref={mergeRef}
          value={value ?? ''}
          onChange={onChange}
          type={showPassword ? 'text' : type}
          aria-invalid={hasError || undefined}
          className={cn(
            'block rounded-md bg-background px-3 py-1.5 text-base text-foreground',
            'outline-1 -outline-offset-1 outline-input',
            'placeholder:text-muted-foreground',
            'focus:outline-2 focus:-outline-offset-2 focus:outline-ring',
            'sm:text-sm/6',
            {
              'w-full': fullWidth,
              'outline-destructive focus:outline-destructive': hasError,
              'pr-10': showPasswordToggle || (showClearButton && hasValue),
            },
            className,
          )}
        />

        {showClearButton && hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}

        {showPasswordToggle && type === 'password' && hasValue && (
          <button
            type="button"
            onClick={togglePassword}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground',
              showClearButton && hasValue ? 'right-8' : 'right-2',
            )}
          >
            {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </button>
        )}
      </div>

      {(error || helperText) && (
        <span className={cn('text-left text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
          {error || helperText}
        </span>
      )}
    </div>
  );
}

interface ControlledInputProps<TFieldValues extends FieldValues>
  extends Omit<RawInputProps, 'value' | 'onChange' | 'name' | 'ref'> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
}

function ControlledInput<TFieldValues extends FieldValues>({
  control,
  name,
  error,
  ...rest
}: ControlledInputProps<TFieldValues>) {
  const { field, fieldState } = useController<TFieldValues>({ name, control });
  return (
    <RawInput
      {...rest}
      {...field}
      value={field.value ?? ''}
      error={fieldState.error?.message ?? error}
    />
  );
}

export function Input<TFieldValues extends FieldValues = FieldValues>({
  ref,
  control,
  name,
  ...rest
}: InputProps<TFieldValues> & { ref?: Ref<HTMLInputElement> }) {
  if (control && name) {
    return (
      <ControlledInput
        control={control}
        name={name}
        {...rest}
      />
    );
  }
  return (
    <RawInput
      ref={ref}
      {...rest}
    />
  );
}
