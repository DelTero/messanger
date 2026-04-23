import { useForm } from 'react-hook-form';
import { Input } from '@/shared/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@shared/ui/button';
import { Link, useNavigate } from 'react-router';
import chatImg from '@assets/chat.png';
import { LoginDTO, loginSchema, useLoginMutation } from '@features/auth';
import { ROUTES } from '@shared/config/routes';
import { Spinner } from '@/shared/ui/spinner';

export function Login() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: '',
      email: '',
    },
    mode: 'onSubmit',
  });

  const { mutate, isPending } = useLoginMutation();

  const navigate = useNavigate();

  const onSubmit = handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => {
        navigate(ROUTES.ROOT);
      },
    });
  });

  return (
    <div className="flex w-96 max-w-96 flex-1 flex-col justify-center rounded-lg border border-border bg-card px-6 py-12 shadow-md lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src={chatImg}
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-foreground">Войти в аккаунт</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-6"
        >
          <Input
            control={control}
            name="email"
            label="Email"
          />

          <Input
            control={control}
            name="password"
            label="Пароль"
            showPasswordToggle
            type="password"
          />

          <Button
            type="submit"
            className="w-full"
          >
            {(isSubmitting || isPending) && <Spinner data-icon="inline-start" />}
            Войти
          </Button>
        </form>

        <p className="mt-10 text-center text-sm/6 text-muted-foreground">
          Нет аккаунта?{' '}
          <Link
            to={ROUTES.SIGNUP}
            className="font-semibold text-primary hover:text-primary/90"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
