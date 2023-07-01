'use client';

import {
  AuthSignInValidator,
  CreateAuthSignInPayload,
} from '@/lib/validators/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const UserSignInForm = () => {
  const form = useForm<CreateAuthSignInPayload>({
    resolver: zodResolver(AuthSignInValidator),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [isLoading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  async function submitHanlder(values: CreateAuthSignInPayload) {
    setLoading(true);
    try {
      const { email, password } = AuthSignInValidator.parse(values);

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res && res.error === 'CredentialsSignin')
        throw new Error('Tài khoản hoặc mật khẩu không chính xác');

      router.back();
      router.refresh();

      return toast({
        title: 'Thành công',
      });
    } catch (error) {
      if (error instanceof Error) {
        return toast({
          title: error.message,
          description: 'Vui lòng thử lại sau',
          variant: 'destructive',
        });
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
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
                  type="email"
                  placeholder="Email của bạn"
                  className="border-2 dark:border-slate-200 focus:ring-offset-2 focus-visible:dark:ring-slate-200"
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
                  type="password"
                  placeholder="Mật khẩu của bạn"
                  className="border-2 dark:border-slate-200 focus:ring-offset-2 focus-visible:dark:ring-slate-200"
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
  );
};

export default UserSignInForm;
