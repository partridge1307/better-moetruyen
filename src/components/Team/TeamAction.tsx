import type { Team, User } from '@prisma/client';
import { FC } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';
import Member from './ActionComponents/Member';
import dynamic from 'next/dynamic';

const Manga = dynamic(() => import('./ActionComponents/Manga'));

interface TeamActionProps {
  team: Pick<Team, 'id'> & {
    member: Pick<User, 'banner' | 'image' | 'name' | 'color'>[];
  };
}

const TeamAction: FC<TeamActionProps> = ({ team }) => {
  return (
    <Tabs defaultValue="member">
      <TabsList className="h-fit overflow-x-auto flex items-center justify-between rounded-none rounded-b-md bg-primary-foreground">
        <TabsTrigger
          value="member"
          className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Thành viên
        </TabsTrigger>
        <TabsTrigger
          value="manga"
          className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Truyện tranh
        </TabsTrigger>
      </TabsList>

      <Member members={team.member} />
      <Manga team={team} />
    </Tabs>
  );
};

export default TeamAction;
