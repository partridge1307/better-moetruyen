'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { cn, dataUrlToBlob } from '@/lib/utils';
import { UserProfileEditPayload } from '@/lib/validators/user';
import { Badge, User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Edit as EditIcon, Loader2, Pencil } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useReducer, useRef, useState } from 'react';
import ImageCropModal from '../ImageCropModal';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/HoverCard';
import { Input } from '../ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';

interface UserProfileProps {
  user: Pick<User, 'name' | 'color' | 'image' | 'banner'> & {
    badge: Badge[];
  };
}

export enum ActionType {
  SET_BANNER = 'SET_BANNER',
  SET_AVATAR = 'SET_AVATAR',
  RESET = 'RESET',
}

type ActionState = {
  type: ActionType;
  payload: string;
};

type StateProps = {
  banner: string;
  avatar: string;
};

const reducer = (state: StateProps, action: ActionState) => {
  const { type, payload } = action;
  switch (type) {
    case ActionType.SET_BANNER:
      return {
        ...state,
        banner: payload,
      };
    case ActionType.SET_AVATAR:
      return { ...state, avatar: payload };
    case ActionType.RESET:
      return { avatar: '', banner: '' };
    default:
      return state;
  }
};

const UserProfile: FC<UserProfileProps> = ({ user }) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const router = useRouter();
  const { update } = useSession();
  const modalRef = useRef<HTMLButtonElement>(null);
  const [aspect, setAspect] = useState(1);
  const [previewImage, setPreviewImage] = useState<{
    type: 'avatar' | 'banner';
    image: string;
  } | null>(null);
  const [dataUrl, setDataUrl] = useState<{
    type: 'avatar' | 'banner';
    data: string;
  } | null>(null);
  const [state, dispatch] = useReducer(reducer, {
    banner: '',
    avatar: '',
  });
  const [blobImg, setBlobImg] = useState<{
    avatar: Blob | undefined;
    banner: Blob | undefined;
  } | null>(null);
  const [username, setUsername] = useState<string>(user.name!);
  const [color, setColor] = useState<string>(user.color ? user.color : '');

  useEffect(() => {
    const handler = async () => {
      if (typeof window !== 'undefined' && dataUrl) {
        if (dataUrl.type === 'avatar') {
          const blobImg = dataUrlToBlob(dataUrl.data);
          const url = URL.createObjectURL(blobImg);
          dispatch({ type: ActionType.SET_AVATAR, payload: url });
          setBlobImg((prev) => ({ avatar: blobImg, banner: prev?.banner }));
          setDataUrl(null);
        } else if (dataUrl.type === 'banner') {
          const blobImg = dataUrlToBlob(dataUrl.data);
          const url = URL.createObjectURL(blobImg);
          dispatch({ type: ActionType.SET_BANNER, payload: url });
          setBlobImg((prev) => ({ avatar: prev?.avatar, banner: blobImg }));
          setDataUrl(null);
        }
      }
    };
    handler();
  }, [dataUrl]);

  const { mutate: Edit, isLoading: isEditting } = useMutation({
    mutationFn: async (values: UserProfileEditPayload) => {
      const { avatar, banner, name, color } = values;
      const form = new FormData();
      form.append('avatar', avatar ? avatar : '');
      form.append('banner', banner ? banner : '');
      form.append('name', name);
      form.append('color', color ? color : '');

      const { data } = await axios.patch('/api/user', form);

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
    onSuccess: async () => {
      update();
      router.push('/');
      router.refresh();

      return toast({
        title: 'Thành công',
      });
    },
  });

  function onSubmitHandler() {
    const payload: UserProfileEditPayload = {
      avatar: blobImg?.avatar,
      banner: blobImg?.banner,
      name: username,
      color: color,
    };

    Edit(payload);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitHandler();
      }}
      id="profile-update"
    >
      <div className="relative min-h-[75vh] w-full h-full p-2">
        <div className="relative rounded-md cursor-pointer dark:border-zinc-900 w-full h-44 md:h-52 dark:bg-zinc-700/40">
          {state.banner ? (
            <div className="relative w-full h-full">
              <Image
                fill
                sizes="0%"
                priority
                src={state.banner}
                alt="Preview Banner"
                className="rounded-md"
              />
            </div>
          ) : (
            user.banner && (
              <div className="relative w-full h-full">
                <Image
                  fill
                  sizes="0%"
                  priority
                  src={user.banner}
                  alt="User Banner"
                  className="rounded-md"
                />
              </div>
            )
          )}

          <div
            className={cn(
              'absolute w-32 h-32 md:w-36 md:h-36 z-20 rounded-full border-8 dark:border-zinc-900 max-sm:left-1/2 max-sm:-translate-x-1/2 md:left-3 top-2/3',
              !user.image && 'dark:bg-zinc-700'
            )}
          >
            {state.avatar ? (
              <div className="relative w-full h-full">
                <Image
                  fill
                  sizes="0%"
                  priority
                  src={state.avatar}
                  alt="Preview Avatar"
                  className="rounded-full"
                />
              </div>
            ) : (
              user.image && (
                <div className="relative w-full h-full">
                  <Image
                    fill
                    sizes="0%"
                    priority
                    src={user.image}
                    alt="Preview Avatar"
                    className="rounded-full"
                  />
                </div>
              )
            )}

            <input
              type="file"
              title=""
              accept=".jpg, .png, .jpeg"
              className="absolute inset-0 opacity-0 file:cursor-pointer rounded-full cursor-pointer"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setPreviewImage({
                    type: 'avatar',
                    image: URL.createObjectURL(e.target.files[0]),
                  });
                  setAspect(1);
                  e.target.value = '';
                  modalRef.current?.click();
                }
              }}
            />
            <div className="absolute right-0 -top-2 p-2 md:p-2 rounded-full dark:bg-zinc-900/70">
              <EditIcon className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>

          <input
            type="file"
            title=""
            accept=".jpg, .png, .jpeg"
            className="absolute inset-0 opacity-0 file:cursor-pointer cursor-pointer"
            onChange={(e) => {
              if (e.target.files?.length) {
                setPreviewImage({
                  type: 'banner',
                  image: URL.createObjectURL(e.target.files[0]),
                });
                setAspect(16 / 9);
                e.target.value = '';
                modalRef.current?.click();
              }
            }}
          />
          <EditIcon className="absolute max-sm:w-4 max-sm:h-4 top-2 right-2 opacity-60" />
        </div>

        <div className="relative space-y-6 mt-20 md:mt-24">
          <div className="relative">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 -z-10" />
          </div>

          {user.badge.length && (
            <div>
              <p>Chọn huy hiệu</p>
              <Select value={color} onValueChange={(value) => setColor(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {user.badge.map((b, idx) => (
                    <SelectItem
                      key={idx}
                      value={b.color}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: b.color ? b.color : '' }}
                        />{' '}
                        <p>{b.name}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {user.badge.length && (
            <div className="space-y-4">
              <p className="text-lg font-semibold">Huy hiệu</p>
              <ul className="flex flex-wrap items-center gap-3">
                {user.badge.map((b, idx) => (
                  <li key={idx} className="space-y-1">
                    <HoverCard openDelay={100} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center gap-2 w-fit p-2 rounded-md dark:bg-zinc-700">
                          <div className="relative h-6 w-6">
                            <Image
                              fill
                              sizes="0%"
                              src={b.image}
                              alt="Badge Image"
                            />
                          </div>
                          <p
                            className="text-sm cursor-default font-medium"
                            style={{ color: b.color ? b.color : '' }}
                          >
                            {b.name}
                          </p>
                        </div>
                      </HoverCardTrigger>

                      <HoverCardContent className="grid grid-cols-2 gap-6 w-fit dark:bg-zinc-600">
                        <div className="relative w-full h-full">
                          <Image
                            fill
                            sizes="0%"
                            src={b.image}
                            alt="Badge Image"
                            className="object-contain"
                          />
                        </div>
                        <div className="text-white space-y-1">
                          <p>{b.name}</p>
                          <p className="text-xs">{b.description}</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {(state.avatar ||
          state.banner ||
          username !== user.name ||
          color !== user.color) && (
          <div className="absolute inset-x-0 h-fit flex items-center justify-end gap-6 rounded-md p-3 px-4 bottom-0 dark:bg-zinc-900/70">
            <button
              disabled={isEditting}
              className="hover:underline underline-offset-2"
              onClick={(e) => {
                e.preventDefault();
                dispatch({ type: ActionType.RESET, payload: '' });
                setUsername(user.name!);
                setBlobImg(null);
                setColor(user.color ? user.color : '');
              }}
            >
              Reset
            </button>
            <button
              form="profile-update"
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

      <ImageCropModal
        ref={modalRef}
        previewImage={previewImage}
        setCancel={(value) => {
          dispatch({
            type:
              value === 'avatar'
                ? ActionType.SET_AVATAR
                : ActionType.SET_BANNER,
            payload: '',
          });
          setPreviewImage(null);
        }}
        setDone={() => setPreviewImage(null)}
        aspect={aspect}
        setDataUrl={(value) =>
          setDataUrl(
            value as {
              type: 'avatar' | 'banner';
              data: string;
            } | null
          )
        }
      />
    </form>
  );
};

export default UserProfile;
