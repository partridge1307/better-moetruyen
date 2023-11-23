import ShareButton from '@/components/ShareButton';
import { User } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';

const SessionFunction = dynamic(() => import('./SessionFunction'), {
  loading: () => (
    <div className="w-[30%] md:w-[15%] h-10 rounded-md animate-pulse bg-background" />
  ),
});

interface UserFunctionProps {
  user: Pick<User, 'id' | 'name'>;
}

const UserFunction: FC<UserFunctionProps> = async ({ user }) => {
  return (
    <>
      <SessionFunction user={user} />
      <ShareButton
        title={user.name ?? 'Moetruyen'}
        url={`/user/${user.name?.split(' ').join('-')}`}
        className="w-[30%] md:w-[15%]"
      />
    </>
  );
};

export default UserFunction;
