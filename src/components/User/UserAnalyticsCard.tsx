import { User } from 'next-auth';
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Manga } from '@prisma/client';

interface UserAnalyticsProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Pick<User, 'name'>;
  manga: Array<Manga>;
}

const UserAnalyticsCard: FC<UserAnalyticsProps> = ({
  user,
  manga,
  ...props
}) => {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle className="text-center">{user.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <dl className="flex gap-3 tracking-tight">
          <dt>Tổng số truyện đã publish:</dt>
          <dd>{manga.filter((m) => m.isPublished)?.length}</dd>
        </dl>
      </CardContent>
      <CardContent>
        <dl className="flex gap-3 tracking-tight">
          <dt>Tổng số truyện chờ publish:</dt>
          <dd>{manga.filter((m) => !m.isPublished)?.length}</dd>
        </dl>
      </CardContent>
    </Card>
  );
};

export default UserAnalyticsCard;
