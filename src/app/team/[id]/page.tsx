import TeamInfoSkeleton from '@/components/Skeleton/TeamInfoSkeleton';
import TeamAction from '@/components/Team/TeamAction';
import TeamCover from '@/components/Team/TeamCover';
import TeamFunction from '@/components/Team/TeamFunction';
import TeamImage from '@/components/Team/TeamImage';
import TeamInfo from '@/components/Team/TeamInfo';
import UserAvatar from '@/components/User/UserAvatar';
import UserBanner from '@/components/User/UserBanner';
import Username from '@/components/User/Username';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

const TeamInfoServer = dynamic(
  () => import('@/components/Team/TeamInfoServer'),
  {
    loading: () => <TeamInfoSkeleton />,
  }
);

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const team = await db.team.findUnique({
    where: {
      id: +params.id,
    },
    select: {
      id: true,
      cover: true,
      image: true,
      name: true,
      description: true,
      createdAt: true,
      owner: {
        select: {
          banner: true,
          image: true,
          name: true,
          color: true,
        },
      },
      member: {
        select: {
          image: true,
          banner: true,
          name: true,
          color: true,
        },
      },
    },
  });
  if (!team) return notFound();

  return (
    <main className="relative container max-sm:px-0 mt-4 pb-4 lg:w-4/5">
      {/* Info section */}
      <section className="p-3 pb-7 rounded-t-md bg-primary-foreground">
        {/* Image section */}
        <section className="relative">
          <TeamCover team={team} />
          <div className="absolute left-[3%] bottom-0 w-1/4 h-1/4 md:w-1/5 md:h-1/5">
            <TeamImage
              team={team}
              className="border-[6px] border-primary-foreground rounded-full"
            />
          </div>
        </section>

        {/* Name section */}
        <section className="ml-[30%] md:ml-[26%] mb-[8%] mt-1 md:mt-3 flex items-start justify-between">
          <h1 className="text-2xl md:text-4xl font-semibold">{team.name}</h1>
          <Popover>
            <PopoverTrigger asChild>
              <div className="shrink-0 flex items-center gap-2 px-2 py-2 md:py-1 rounded-full md:rounded-l-full md:rounded-r-none transition-colors hover:bg-muted cursor-pointer">
                <UserAvatar
                  user={team.owner}
                  className="w-14 h-14 md:w-12 md:h-12"
                />
                <Username user={team.owner} className="max-sm:hidden" />
              </div>
            </PopoverTrigger>

            <PopoverContent className="p-1.5 bg-muted" asChild>
              <Link
                href={`/user/${team.owner.name?.split(' ').join('-')}`}
                className="relative block pb-4 border border-primary-foreground transition-colors hover:bg-primary-foreground"
              >
                <div className="relative">
                  <UserBanner user={team.owner} />
                  <UserAvatar
                    user={team.owner}
                    className="absolute left-[5%] bottom-0 translate-y-1/2 w-20 h-20 border-4 border-primary-foreground bg-background"
                  />
                </div>
                <Username
                  user={team.owner}
                  className="ml-[38%] mt-1 text-start text-xl font-semibold"
                />
              </Link>
            </PopoverContent>
          </Popover>
        </section>

        {/* Function section */}
        <section className="ml-[3%] md:ml-[4%]">
          <TeamFunction team={team} />
        </section>

        <hr className="mt-10 my-6 mx-10" />

        {/* Info section */}
        <section className="md:space-y-12">
          <TeamInfo team={team}>
            <TeamInfoServer team={team} />
          </TeamInfo>
        </section>
      </section>

      <section>
        <TeamAction team={team} />
      </section>
    </main>
  );
};

export default page;

export async function generateMetadata({
  params,
}: pageProps): Promise<Metadata> {
  const team = await db.team.findUnique({
    where: {
      id: +params.id,
    },
    select: {
      image: true,
      name: true,
      plainTextDescription: true,
    },
  });

  if (!team)
    return {
      title: 'Nhóm dịch',
      description: 'Team, Nhóm | Moetruyen',
      alternates: {
        canonical: `${process.env.NEXTAUTH_URL}/team/${params.id}`,
      },
    };

  return {
    title: {
      absolute: team.name,
      default: team.name,
    },
    description: team.plainTextDescription,
    keywords: [`Team`, 'Nhóm dịch', `${team.name}`, 'Moetruyen'],
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL}/team/${params.id}`,
    },
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/team/${params.id}`,
      siteName: 'Moetruyen',
      title: team.name,
      description: team.plainTextDescription,
      locale: 'vi_VN',
      images: [
        {
          url: team.image,
          alt: `Ảnh bìa ${team.name}`,
        },
      ],
    },
    twitter: {
      site: 'Moetruyen',
      title: team.name,
      description: team.plainTextDescription,
      card: 'summary_large_image',
      images: [
        {
          url: team.image,
          alt: `Ảnh bìa ${team.name}`,
        },
      ],
    },
  };
}
