import { User } from 'next-auth';
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface UserAnalyticsProps {
  user: Pick<User, 'name'>;
  manga: object[];
}

const UserAnalyticsCard: FC<UserAnalyticsProps> = ({ user, manga }) => {
  return (
    <Card className="bg-zinc-700 text-slate-50 h-fit">
      <CardHeader>
        <CardTitle className="text-center">{user.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <dl className="flex gap-3 tracking-tight">
          <dt>Tổng số truyện đã publish:</dt>
          {/* @ts-expect-error */}
          <dd>{manga.filter((m) => m.isPublished)?.length}</dd>
        </dl>
      </CardContent>
      <CardContent>
        <dl className="flex gap-3 tracking-tight">
          <dt>Tổng số truyện chờ publish:</dt>
          {/* @ts-expect-error */}
          <dd>{manga.filter((m) => !m.isPublished)?.length}</dd>
        </dl>
      </CardContent>
    </Card>
  );
};

export default UserAnalyticsCard;
