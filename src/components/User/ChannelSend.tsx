'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import type { DiscordChannel } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { Button, buttonVariants } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { cn } from '@/lib/utils';
import { DialogClose } from '@radix-ui/react-dialog';

interface ChannelSendProps {
  channel: Pick<DiscordChannel, 'channelId' | 'channelName'> | null;
  isLinked: boolean;
}

type Data = {
  id: string;
  name: string;
};

const ChannelSend: FC<ChannelSendProps> = ({ channel, isLinked }) => {
  const { serverErrorToast, loginToast, notFoundToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const [channelIdStr, setChannelIdStr] = useState('');
  const [targetChannel, setTargetChannel] = useState<Data>();
  const [targetRole, setTargetRole] = useState<Data>();

  const {
    data: Data,
    mutate: Fetch,
    isLoading: isFetching,
  } = useMutation({
    mutationKey: ['fetch-channel'],
    mutationFn: async () => {
      const { data } = await axios.get(`/api/channel/${channelIdStr}`);

      return data as { channels: Data[]; roles: Data[] };
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406) {
          const { dismiss } = toast({
            title: 'Không tìm thấy',
            description: 'Hãy chắc chắn rằng đã thêm Bot hoặc đó là ID hợp lệ',
            variant: 'destructive',
            action: (
              <a
                target="_blank"
                href="https://discord.com/api/oauth2/authorize?client_id=1112647992160292915&permissions=19456&scope=bot"
                className={buttonVariants()}
                onClick={() => dismiss()}
              >
                Thêm
              </a>
            ),
          });

          return;
        }
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      setChannelIdStr('');
    },
  });

  const { mutate: Set, isLoading: isSetting } = useMutation({
    mutationKey: ['set-channel-query'],
    mutationFn: async () => {
      await axios.post(`/api/channel`, {
        channel: targetChannel,
        role: targetRole,
      });
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
        <Button
          isLoading={isSetting || isDeleting}
          disabled={isSetting || isDeleting}
          variant={!!channel ? 'destructive' : 'default'}
          className="w-full"
          onClick={() => onClickButtonHandler()}
        >
          {!!channel ? 'Gỡ' : 'Liên kết'}
        </Button>
      )}

      <Dialog>
        <DialogTrigger
          disabled={isSetting || isDeleting || !!channel}
          id="link-channel-button"
          className="hidden"
        >
          Link channel button
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {!!channel ? 'Gỡ liên kết' : 'Liên kết'} Discord
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
              disabled={isFetching || !channelIdStr.length}
              isLoading={isFetching}
              onClick={() => Fetch()}
            >
              Tìm
            </Button>
          </div>

          <Tabs defaultValue="channel">
            <TabsList>
              <TabsTrigger value="channel">Kênh có thể gửi</TabsTrigger>
              <TabsTrigger value="role">Role có thể Tag</TabsTrigger>
            </TabsList>

            <TabsContent value="channel">
              <ul className="max-h-64 lg:max-h-72 space-y-2 lg:space-y-3 overflow-auto scrollbar dark:scrollbar--dark">
                {Data?.channels.length ? (
                  Data.channels.map((channel) => (
                    <li
                      key={channel.id}
                      className={cn(
                        'p-1 rounded-md transition-colors hover:cursor-pointer hover:dark:bg-zinc-700 dark:bg-zinc-800',
                        {
                          'hover:dark:bg-green-600 dark:bg-green-600':
                            channel === targetChannel,
                        }
                      )}
                      onClick={() => setTargetChannel(channel)}
                    >
                      <p>
                        <span>ID:</span> {channel.id}
                      </p>
                      <p>
                        <span>Tên: </span> {channel.name}
                      </p>
                    </li>
                  ))
                ) : isFetching ? (
                  <li>Đang tìm kiếm...</li>
                ) : (
                  <li>Không tìm thấy kênh</li>
                )}
              </ul>
            </TabsContent>

            <TabsContent value="role">
              <ul className="max-h-64 lg:max-h-72 space-y-2 lg:space-y-3 overflow-auto scrollbar dark:scrollbar--dark">
                {Data?.roles.length && !isFetching ? (
                  Data.roles.map((role) => (
                    <li
                      key={role.id}
                      className={cn(
                        'p-1 rounded-md transition-colors hover:cursor-pointer hover:dark:bg-zinc-700 dark:bg-zinc-800',
                        {
                          'hover:dark:bg-green-600 dark:bg-green-600':
                            role === targetRole,
                        }
                      )}
                      onClick={() => setTargetRole(role)}
                    >
                      <p>
                        <span>ID:</span> {role.id}
                      </p>
                      <p>
                        <span>Tên: </span> {role.name}
                      </p>
                    </li>
                  ))
                ) : isFetching ? (
                  <li>Đang tìm kiếm...</li>
                ) : (
                  <li>Không tìm thấy Role</li>
                )}
              </ul>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <DialogClose
              disabled={isSetting || !targetChannel}
              className={buttonVariants()}
              onClick={() => Set()}
            >
              Xong
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChannelSend;
