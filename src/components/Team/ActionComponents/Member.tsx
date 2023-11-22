import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import { TabsContent } from '@/components/ui/Tabs';
import type { User } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';

interface MemberProps {
  members: Pick<User, 'image' | 'banner' | 'name' | 'color'>[];
}

const Member: FC<MemberProps> = ({ members }) => {
  return (
    <TabsContent
      value="member"
      forceMount
      className="data-[state=inactive]:hidden p-2 rounded-md bg-primary-foreground/50"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {members.map((member, index) => (
          <Link
            key={index}
            href={`/user/${member.name?.split(' ').join('-')}`}
            className="block p-1.5 pb-5 rounded-md transition-colors bg-muted hover:bg-muted/75"
          >
            <div className="relative">
              <UserBanner user={member} />
              <UserAvatar
                user={member}
                className="absolute left-[5%] bottom-0 translate-y-1/2 w-20 h-20 border-4 bg-background"
              />
            </div>
            <Username user={member} className="ml-[35%] text-start text-lg" />
          </Link>
        ))}
      </div>
    </TabsContent>
  );
};

export default Member;
