import type { User } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';

const Manga = dynamic(() => import('./ActionComponents/Manga'));
const Team = dynamic(() => import('./ActionComponents/Team'));
const Forum = dynamic(() => import('./ActionComponents/Forum'));
const FollowBy = dynamic(() => import('./ActionComponents/FollowBy'));
const Following = dynamic(() => import('./ActionComponents/Following'));

interface UserActionProps {
  user: Pick<User, 'id'>;
}

const UserAction: FC<UserActionProps> = ({ user }) => {
  return (
    <Tabs defaultValue="manga">
      <TabsList className="h-fit overflow-x-auto flex items-center justify-between rounded-none rounded-b-md bg-primary-foreground">
        <TabsTrigger
          value="manga"
          className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Truyện tranh
        </TabsTrigger>
        <TabsTrigger
          value="team"
          className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Team
        </TabsTrigger>
        <TabsTrigger
          value="forum"
          className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Forum
        </TabsTrigger>
        <TabsTrigger
          value="followBy"
          className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Theo dõi
        </TabsTrigger>
        <TabsTrigger
          value="following"
          className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Đang theo dõi
        </TabsTrigger>
      </TabsList>

      <Manga user={user} />
      <Team user={user} />
      <Forum user={user} />
      <FollowBy user={user} />
      <Following user={user} />
    </Tabs>
  );
};

export default UserAction;
