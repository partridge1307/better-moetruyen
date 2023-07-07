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

  const verifyToast = () => {
    const { dismiss } = toast({
      title: 'Yêu cầu có quyền',
      description:
        'Có vẻ như bạn chưa được cấp quyền upload. Để được cấp quyền hãy IB admin nhé.',
      variant: 'destructive',
      action: (
        <Link
          href="https://discord.gg/dongmoe"
          target="_blank"
          className={buttonVariants({ variant: 'outline' })}
          onClick={() => dismiss()}
        >
          Xác thực
        </Link>
      ),
    });
  };

  const notFoundToast = () =>
    toast({
      title: 'Không tìm thấy',
      description: 'Không tìm thấy đối tượng. Vui lòng thử lại',
      variant: 'destructive',
    });

  return {
    loginToast,
    verifyToast,
    notFoundToast,
  };
};
