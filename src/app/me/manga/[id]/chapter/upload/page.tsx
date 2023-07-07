import ForceSignOut from "@/components/ForceSignOut";
import ChapterUpload from "@/components/Manage/ChapterUpload";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

const page = async ({ params }: { params: { id: string } }) => {
  const session = await getAuthSession();
  if (!session) return <ForceSignOut />;
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return <ForceSignOut />;

  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
      creatorId: user.id,
    },
  });
  if (!manga) return notFound();

  return <ChapterUpload id={params.id} />;
};

export default page;
