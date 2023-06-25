import Link from 'next/link';
import { toast } from './use-toast';
import { buttonVariants } from '@/components/ui/Button';

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: 'Yêu cầu đăng nhập',
      description: 'Bạn cần đăng nhập để thực hiên được hành động này',
      variant: 'destructive',
      action: (
        <Link
          className={buttonVariants({ variant: 'outline' })}
          href={'/sign-in'}
          onClick={() => dismiss()}
        >
          Login
        </Link>
      ),
    });
  };

  return {
    loginToast,
  };
};
