'use client';

import { Team } from '@prisma/client';
import { Edit, Loader2, Pencil, Plus } from 'lucide-react';
import Image from 'next/image';
import { FC, useEffect, useRef, useState } from 'react';
import ImageCropModal from '../ImageCropModal';
import { cn, dataUrlToBlob } from '@/lib/utils';
import { Input } from '../ui/Input';
import { useMutation } from '@tanstack/react-query';
import { TeamEditPayload } from '@/lib/validators/team';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface TeamEditProps {
  team: Team;
}

const TeamEdit: FC<TeamEditProps> = ({ team }) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();
  const modalRef = useRef<HTMLButtonElement>(null);
  const [previewImage, setPreviewImage] = useState<{
    type: string;
    image: string;
  } | null>(null);
  const [dataUrl, setDataUrl] = useState<{
    type: string;
    data: string;
  } | null>();
  const [croppedImg, setCroppedImg] = useState<string | null>(null);
  const [blobImg, setBlobImg] = useState<Blob | null>(null);
  const [teamName, setTeamName] = useState<string>(team.name);

  useEffect(() => {
    const handler = async () => {
      if (dataUrl?.type === 'image') {
        const blobImg = dataUrlToBlob(dataUrl.data);
        const url = URL.createObjectURL(blobImg);
        setCroppedImg(url);
        setBlobImg(blobImg);
        setDataUrl(null);
      }
    };

    handler();
  }, [dataUrl]);

  const { mutate: EditTeam, isLoading: isEditting } = useMutation({
    mutationFn: async (values: TeamEditPayload) => {
      const { image, name } = values;
      const form = new FormData();
      form.append('image', image ? image : '');
      form.append('name', name);

      const { data } = await axios.patch(`/api/team/${team.id}`, form);

      return data;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 404) return notFoundToast();
        if (e.response?.status === 422)
          return toast({
            title: 'Không hợp lệ',
            description: 'Biểu mẫu không hợp lệ. Vui lòng thử lại',
            variant: 'destructive',
          });
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.push(`/me/team`);
      router.refresh();

      return toast({
        title: 'Thành công',
      });
    },
  });

  function onSubmitHandler() {
    const payload: TeamEditPayload = {
      image: blobImg ?? undefined,
      name: teamName,
    };

    EditTeam(payload);
  }

  return (
    <form
      id="team-update"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitHandler();
      }}
    >
      <div className="space-y-8 relative min-h-[60vh]">
        <div className="space-y-4 max-sm:flex max-sm:flex-col max-sm:items-center">
          <p className="max-sm:self-start">Ảnh team:</p>
          <div className="relative w-32 h-32">
            {croppedImg ? (
              <Image
                fill
                sizes="0%"
                priority
                src={croppedImg}
                alt="Preview Image"
                className="rounded-full"
              />
            ) : team.image ? (
              <Image
                fill
                sizes="0%"
                priority
                src={team.image}
                alt="Team Image"
                className="rounded-full"
              />
            ) : (
              <div className="h-full w-full rounded-full flex justify-center items-center dark:bg-zinc-900">
                <Plus className="w-10 h-10" />
              </div>
            )}

            <input
              type="file"
              accept=".jpg, .png, .jpeg"
              className="absolute inset-0 rounded-full opacity-0 file:cursor-pointer cursor-pointer"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setPreviewImage({
                    type: 'image',
                    image: URL.createObjectURL(e.target.files[0]),
                  });
                  e.target.value = '';
                  modalRef.current?.click();
                }
              }}
            />
            <Edit className="w-6 h-6 absolute right-2 top-0 z-10 p-1 dark:bg-zinc-900 rounded-full" />
          </div>

          <ImageCropModal
            ref={modalRef}
            previewImage={previewImage}
            aspect={1}
            setCancel={() => {
              setCroppedImg(null);
              setPreviewImage(null);
            }}
            setDone={() => setPreviewImage(null)}
            setDataUrl={(value) => {
              setDataUrl(value);
            }}
          />
        </div>

        <div>
          <p>Tên team:</p>
          <div className="relative">
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 -z-10" />
          </div>
        </div>

        {(teamName !== team.name || croppedImg) && (
          <div className="absolute inset-x-0 h-fit flex items-center justify-end gap-6 rounded-md p-3 px-4 bottom-0 dark:bg-zinc-900/70">
            <button
              disabled={isEditting}
              className="hover:underline underline-offset-2"
              onClick={(e) => {
                e.preventDefault();
                setTeamName(team.name);
                setBlobImg(null);
              }}
            >
              Reset
            </button>
            <button
              form="team-update"
              disabled={isEditting}
              className={cn(
                'bg-green-600 hover:bg-green-800 w-20 px-2 py-1 rounded-md',
                isEditting && 'flex items-center gap-2'
              )}
            >
              {isEditting && <Loader2 className="w-4 h-4 animate-spin" />}
              Sửa
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default TeamEdit;
