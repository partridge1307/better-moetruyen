'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { UserVerifyPayload, UserVerifyValidator } from '@/lib/validators/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Form, FormField, FormItem, FormLabel } from '../ui/Form';
import { Label } from '../ui/Label';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';

const UserVerifyForm = () => {
  const { loginToast, serverErrorToast } = useCustomToast();
  const router = useRouter();

  const form = useForm<UserVerifyPayload>({
    resolver: zodResolver(UserVerifyValidator),
    defaultValues: {
      isChecked: false,
    },
  });

  const { mutate: VerifyRequest, isPending: isRequesting } = useMutation({
    mutationKey: ['user-verify-request'],
    mutationFn: async (values: UserVerifyPayload) => {
      await axios.post('/api/auth/verify', values);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 403)
          return toast({
            title: 'Đã xác thực',
            description: 'Bạn đã được xác thực rồi',
            variant: 'destructive',
          });
        if (err.response?.status === 406)
          return toast({
            title: 'Yêu cầu đồng ý',
            description: 'Bạn cần đồng ý để thực hiện hành động này',
            variant: 'destructive',
          });
        if (err.response?.status === 409)
          return toast({
            title: 'Đã yêu cầu xác thực',
            description: 'Bạn đã yêu cầu xác thực trước đó rồi',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      setTimeout(() => router.push('/'), 15000);

      return toast({
        title: 'Thành công',
        description: 'Đã gửi yêu cầu xác thực. T',
      });
    },
  });

  function onSubmitHandler(values: UserVerifyPayload) {
    VerifyRequest(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <p>
          Bằng cách xác thực bạn sẽ đồng ý mọi điều luật, điều khoản Moetruyen
        </p>

        <FormField
          control={form.control}
          name="isChecked"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bạn có đồng ý</FormLabel>
              <RadioGroup
                defaultValue={field.value ? 'true-opt' : 'false-opt'}
                onValueChange={(value) => field.onChange(value === 'true-opt')}
                className="flex flex-wrap items-center gap-10"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false-opt" id="false-opt" />
                  <Label htmlFor="false-opt">Không</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true-opt" id="true-opt" />
                  <Label htmlFor="true-opt">Đồng ý</Label>
                </div>
              </RadioGroup>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap justify-end items-center gap-6">
          <Button
            type="button"
            variant={'destructive'}
            disabled={isRequesting}
            onClick={() => router.back()}
          >
            Trở lại
          </Button>

          <Button
            type="submit"
            isLoading={isRequesting}
            disabled={isRequesting}
          >
            Xác thực
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserVerifyForm;
