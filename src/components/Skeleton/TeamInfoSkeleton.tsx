import { File, Loader2, Users2 } from 'lucide-react';

const TeamInfoSkeleton = () => {
  return (
    <>
      <dl className="flex items-center gap-1">
        <dt className="font-semibold">
          <Loader2 className="animate-spin" />
        </dt>
        <dd>
          <File className="w-4 h-4" />
        </dd>
      </dl>
      <dl className="flex items-center gap-1">
        <dt className="font-semibold">
          <Loader2 className="animate-spin" />
        </dt>
        <dd>
          <Users2 className="w-5 h-5" />
        </dd>
      </dl>
    </>
  );
};

export default TeamInfoSkeleton;
