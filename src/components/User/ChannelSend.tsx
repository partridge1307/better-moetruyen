'use client';

import type { DiscordChannel } from '@prisma/client';
import { FC, useState } from 'react';
import { Button } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Input } from '../ui/Input';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { Label } from '../ui/Label';
import { useRouter } from 'next/navigation';
import { DialogClose } from '@radix-ui/react-dialog';
import { toast } from '@/hooks/use-toast';

interface ChannelSendProps {
  channel: Pick<DiscordChannel, 'channelId' | 'channelName'> | null;
  isLinked: boolean;
}

type ChannelData = {
  id: string;
  name: string;
};

const ChannelSend: FC<ChannelSendProps> = ({ channel, isLinked }) => {
  const { serverErrorToast, loginToast, notFoundToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const [channelIdStr, setChannelIdStr] = useState('');

  const {
    data: channelsData,
    mutate: Fetch,
    isLoading: isFetching,
  } = useMutation({
    mutationKey: ['fetch-channel'],
    mutationFn: async () => {
      const { data } = await axios.get(`/api/channel/${channelIdStr}`);

      return data as ChannelData[];
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
  });

  const { mutate: Set, isLoading: isSetting } = useMutation({
    mutationKey: ['set-channel-query'],
    mutationFn: async (payload: ChannelData) => {
      await axios.post(`/api/channel`, payload);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Kiểm tra lại kênh',
            description:
              'Vui lòng kiểm tra lại kênh của bạn đã chắc chắn hợp lệ',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-channel-query'],
    mutationFn: async () => {
      await axios.delete(`/api/channel`);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  function onClickButtonHandler() {
    const type = !!channel ? 'UNLINK' : 'LINK';

    if (type === 'LINK') {
      const target = document.getElementById(
        'link-channel-button'
      ) as HTMLButtonElement;

      target.click();
    } else {
      Delete();
    }
  }

  return (
    <>
      {isLinked && (
        <Button onClick={() => onClickButtonHandler()}>
          {!!channel ? 'Gỡ' : 'Liên kết'}
        </Button>
      )}

      <Dialog>
        <DialogTrigger
          disabled={isSetting || isDeleting}
          id="link-channel-button"
          className="hidden"
        >
          Link channel button
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {!!channel ? 'Gỡ liên kết' : 'Liên kết'} kênh Discord
            </DialogTitle>
          </DialogHeader>

          <Label htmlFor="input-server-id">Server ID</Label>
          <div className="flex items-center gap-4">
            <Input
              id="input-server-id"
              placeholder="ID Server"
              value={channelIdStr}
              onChange={(e) => setChannelIdStr(e.target.value)}
            />

            <Button
              disabled={isFetching}
              isLoading={isFetching}
              onClick={() => Fetch()}
            >
              Tìm
            </Button>
          </div>

          <div className="max-h-72 overflow-auto space-y-3 scrollbar dark:scrollbar--dark">
            {!!channelsData?.length &&
              channelsData.map((c) => (
                <DialogClose
                  key={c.id}
                  className="w-full text-start p-1 rounded-md hover:cursor-pointer transition-colors hover:dark:bg-zinc-700 dark:bg-zinc-800"
                  onClick={() => Set(c)}
                >
                  <p>
                    <span>ID: </span> {c.id}
                  </p>
                  <p className="line-clamp-1">
                    <span>Tên: </span> {c.name}
                  </p>
                </DialogClose>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChannelSend;
