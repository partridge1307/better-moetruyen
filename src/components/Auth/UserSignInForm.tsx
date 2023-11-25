'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  AuthSignInValidator,
  CreateAuthSignInPayload,
} from '@/lib/validators/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

const TwoFactorForm = dynamic(() => import('./TwoFactorForm'), {
  ssr: false,
  loading: () => (
    <div className="h-20 rounded-md animate-pulse bg-background" />
  ),
});

const UserSignInForm = ({
  signInType,
}: {
  signInType: 'MAGIC_LINK' | 'CREDENTIALS';
}) => {
  const { serverErrorToast, successToast } = useCustomToast();
  const [emailString, setEmailString] = useState('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isTwoFactor, setTwoFactor] = useState(false);
  const router = useRouter();

  const form = useForm<CreateAuthSignInPayload>({
    resolver: zodResolver(AuthSignInValidator),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function magicLinkHandler() {
    setLoading(true);
    try {
      await signIn('email', {
        email: emailString,
        redirect: true,
        callbackUrl: '/',
      });
    } catch (error) {
      return serverErrorToast();
    } finally {
      setLoading(false);
    }
  }

  async function submitHanlder(values: CreateAuthSignInPayload) {
    setLoading(true);

    try {
      const { email, password } = AuthSignInValidator.parse(values);

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error === 'CredentialsSignin')
        throw new Error('Tài khoản hoặc mật khẩu không chính xác');

      if (res?.error === 'TWO_FACTOR') {
        setTwoFactor(true);
        return;
      }

      router.back();
      router.refresh();

      return successToast();
    } catch (error) {
      if (error instanceof Error) {
        return toast({
          title: error.message,
          description: 'Vui lòng thử lại sau',
          variant: 'destructive',
        });
      }

      return serverErrorToast();
    } finally {
      setLoading(false);
    }
  }

  return signInType === 'CREDENTIALS' ? (
    !isTwoFactor ? (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitHanlder)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    required
                    type="email"
                    autoComplete="username"
                    placeholder="Email của bạn"
                    className="border-2 focus:ring-offset-2 dark:border-slate-200 focus-visible:dark:ring-slate-200"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    required
                    type="password"
                    autoComplete="current-password"
                    placeholder="Mật khẩu của bạn"
                    className="border-2 focus:ring-offset-2 dark:border-slate-200 focus-visible:dark:ring-slate-200"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            Đăng nhập
          </Button>
        </form>
      </Form>
    ) : (
      <TwoFactorForm
        email={form.getValues('email')}
        password={form.getValues('password')}
      />
    )
  ) : (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="magic_link">Email</Label>

        <Input
          id="magic_link"
          placeholder="Email"
          type="email"
          autoComplete="username"
          value={emailString}
          disabled={isLoading}
          onChange={(e) => {
            setEmailString(e.target.value);
            form.setValue('email', e.target.value);
          }}
          className="dark:border-slate-200 border-2"
        />
      </div>
      <Button
        disabled={isLoading}
        isLoading={isLoading}
        className="w-full"
        onClick={() => magicLinkHandler()}
      >
        Đăng nhập
      </Button>
    </div>
  );
};

export default UserSignInForm;
