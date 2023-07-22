import ForceSignOut from '@/components/ForceSignOut';
import TeamMangaList from '@/components/Team/TeamMangaList';
import { buttonVariants } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn, formatTimeToNow } from '@/lib/utils';
import { Clock, Edit, Loader2, Upload, Users2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
const TeamChapterList = dynamic(
  () => import('@/components/Team/TeamChapterList'),
  { loading: () => <Loader2 className="w-6 h-6 animate-spin" /> }
);

const page = async () => {
  const session = await getAuthSession();
  if (!session) return notFound();

  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
    },
  });
  if (!user) return <ForceSignOut />;

  const memberOnTeam = await db.memberOnTeam.findUnique({
    where: {
      userId: user.id,
    },
    include: {
      team: {
        select: {
          image: true,
          name: true,
          createdAt: true,
          member: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  banner: true,
                  color: true,
                },
              },
            },
          },
          owner: {
            select: {
              id: true,
              image: true,
              name: true,
              color: true,
            },
          },
          chapter: {
            select: {
              id: true,
              name: true,
              volume: true,
              chapterIndex: true,
              createdAt: true,
              manga: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return (
    <>
      {!memberOnTeam ? (
        <div>Bạn chưa có team nào.</div>
      ) : (
        <Tabs defaultValue="info">
          <TabsList className="md:space-x-4 dark:bg-zinc-800 max-sm:w-full max-sm:justify-start overflow-auto">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="member">Member</TabsTrigger>
            <TabsTrigger value="chapter">Chapter</TabsTrigger>
            <TabsTrigger value="manga">Manga</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-10">
            <div className="flex max-sm:flex-col max-sm:items-center max-sm:dark:bg-zinc-800   gap-6 rounded-xl p-4">
              {memberOnTeam.team.image && (
                <div className="relative w-32 h-32">
                  <Image
                    fill
                    sizes="0%"
                    priority
                    src={memberOnTeam.team.image}
                    alt="Team Image"
                    className="rounded-full"
                  />
                </div>
              )}

              <div className="flex flex-col justify-between max-sm:gap-4">
                <p className="text-xl max-sm:text-center font-semibold row-span-5">
                  {memberOnTeam.team.name}
                </p>
                <div className="space-y-1">
                  <p className="text-sm max-sm:hidden">Owner:</p>
                  <div className="flex justify-center items-center w-fit gap-4 dark:bg-zinc-700 px-3 py-2 rounded-xl">
                    {memberOnTeam.team.owner.image && (
                      <div className="relative w-10 h-10">
                        <Image
                          fill
                          sizes="0%"
                          priority
                          src={memberOnTeam.team.owner.image}
                          alt="Owner Image"
                          className="rounded-full"
                        />
                      </div>
                    )}
                    <p
                      style={{
                        color: memberOnTeam.team.owner.color
                          ? memberOnTeam.team.owner.color
                          : '',
                      }}
                    >
                      {memberOnTeam.team.owner.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {memberOnTeam.team.owner.id === user.id ? (
              <Link
                href={`/me/team/${memberOnTeam.teamId}/edit`}
                className={cn(buttonVariants(), 'space-x-2 max-sm:w-full')}
              >
                <p>Chỉnh sửa</p>
                <Edit className="w-5 h-5" />
              </Link>
            ) : (
              // TODO: Member leave
              <div></div>
            )}

            <div className="flex max-sm:flex-col gap-2 md:gap-10 px-4">
              <dl className="flex gap-2">
                <dt>Đã đăng:</dt>
                <dd className="flex items-center gap-1">
                  {memberOnTeam.team.chapter.length}
                  <Upload className="w-5 h-5" />
                </dd>
              </dl>
              <dl className="flex gap-2">
                <dt>Member:</dt>
                <dd className="flex items-center gap-1">
                  {memberOnTeam.team.member.length}
                  <Users2 className="w-5 h-5" />
                </dd>
              </dl>
              <dl className="flex gap-2">
                <dt>Tạo từ:</dt>
                <dl className="flex items-center gap-1">
                  {formatTimeToNow(memberOnTeam.team.createdAt)}
                  <Clock className="w-4 md:w-5 h-4 md:h-5" />
                </dl>
              </dl>
            </div>
          </TabsContent>

          <TabsContent value="member">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memberOnTeam.team.member.map((mem, idx) => (
                <Link
                  key={idx}
                  href={`/user/${mem.user.id}`}
                  className="relative p-3 dark:bg-zinc-800 hover:dark:bg-zinc-700 transition-colors rounded-md"
                >
                  {mem.user.image && (
                    <div
                      className={cn(
                        mem.user.banner
                          ? 'absolute z-10 top-1/2 left-4'
                          : 'flex justify-center'
                      )}
                    >
                      <div className="relative border-4 rounded-full w-16 h-16">
                        <Image
                          fill
                          sizes="0%"
                          src={mem.user.image}
                          alt="Member Avatar"
                          className="rounded-full"
                        />
                      </div>
                    </div>
                  )}
                  {mem.user.banner && (
                    <div className="relative w-full h-24">
                      <Image
                        fill
                        sizes="0%"
                        priority
                        src={mem.user.banner}
                        alt="Member Banner"
                        className="rounded-md"
                      />
                    </div>
                  )}
                  <p
                    className="text-center text-lg font-semibold"
                    style={{ color: mem.user.color ? mem.user.color : '' }}
                  >
                    {mem.user.name}
                  </p>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chapter" className="space-y-4">
            <TeamChapterList chapter={memberOnTeam.team.chapter} />
          </TabsContent>

          <TabsContent value="manga">
            <TeamMangaList chapter={memberOnTeam.team.chapter} />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
};

export default page;
