import type { CreateCommentEnum } from '@/lib/validators/comment';
import { FC, Suspense, lazy } from 'react';

const MoetruyenEditor = lazy(
  () => import('@/components/Editor/MoetruyenEditor')
);

interface CommentInputProps {
  isLoggedIn: boolean;
  id: number;
  type: CreateCommentEnum;
  callbackURL: string;
}

const CommentInput: FC<CommentInputProps> = ({
  isLoggedIn,
  id,
  type,
  callbackURL,
}) => {
  return isLoggedIn ? (
    <Suspense
      fallback={
        <div className="w-full h-44 rounded-md animate-pulse dark:bg-zinc-900" />
      }
    >
      <MoetruyenEditor id={id} type={type} callbackURL={callbackURL} />
    </Suspense>
  ) : (
    <div>
      Vui lòng <span className="font-semibold">đăng nhập</span> hoặc{' '}
      <span className="font-semibold">đăng ký</span> để comment
    </div>
  );
};

export default CommentInput;
