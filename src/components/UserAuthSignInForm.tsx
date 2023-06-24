'use client';

import { useToast } from '@/hooks/use-toast';
import {
  AuthSignInValidator,
  CreateAuthSignInPayload,
} from '@/lib/validators/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { startTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/Button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/Form';
import { Input } from './ui/Input';
import { useRouter } from 'next/navigation';

const UserAuthSignInForm = () => {
  const form = useForm<CreateAuthSignInPayload>({
    resolver: zodResolver(AuthSignInValidator),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { refresh, push } = useRouter();
  const { toast } = useToast();
  const [isLoading, setLoading] = useState<boolean>(false);

  const onSubmit = async (values: CreateAuthSignInPayload) => {
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

      toast({
        title: 'Thành công',
        description: 'Đang chuyển về trang chủ',
      });
      push('/');
      refresh();
    } catch (error) {
      if (error instanceof Error) {
        return toast({
          title: error.message,
          description: 'Vui lòng thử lại sau',
          variant: 'destructive',
        });
      }

      toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormMessage />
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email của bạn" type="email" {...field} />
              </FormControl>
              <FormDescription>Email của bạn</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormMessage />
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input
                  placeholder="Mật khẩu của bạn"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormDescription>Mật khẩu của bạn</FormDescription>
            </FormItem>
          )}
        />
        <Button
          isLoading={isLoading}
          type="submit"
          variant="ghost"
          className="bg-black w-full"
        >
          Đăng nhập
        </Button>
      </form>
    </Form>
  );
};

export default UserAuthSignInForm;
