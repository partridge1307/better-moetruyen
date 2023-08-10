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
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useReducer, useRef, useState } from 'react';
import { AspectRatio } from '../ui/AspectRatio';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/HoverCard';
import { Input } from '../ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/Select';
const ImageCropModal = dynamic(() => import('../ImageCropModal'), {
  ssr: false,
});

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
  const { push, refresh } = useRouter();
  const { update } = useSession();
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
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
  const [color, setColor] = useState<
    | {
        from: string;
        to: string;
      }
    | { color: string }
    | null
  >(
    user.color
      ? (user.color as
          | {
              from: string;
              to: string;
            }
          | { color: string })
      : null
  );

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
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      update();
      refresh();
      push('/');

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
      color: JSON.stringify(color),
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
        <div className="relative">
          <div
            className="rounded-md cursor-pointer dark:border-zinc-900 dark:bg-zinc-700/40"
            onClick={() => bannerRef.current?.click()}
          >
            <AspectRatio ratio={16 / 9}>
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
            </AspectRatio>
            <EditIcon className="absolute max-sm:w-4 max-sm:h-4 top-2 right-2 opacity-60" />
          </div>

          <div
            className="absolute left-4 max-sm:top-1/2 top-2/3 translate-y-1/3 cursor-pointer w-28 h-28 md:w-36 md:h-36 lg:w-48 lg:h-48 border-4 lg:border-8 rounded-full"
            onClick={() => avatarRef.current?.click()}
          >
            <AspectRatio ratio={1 / 1}>
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
            </AspectRatio>

            <div className="absolute right-0 lg:right-4 top-0 p-2 md:p-2 rounded-full dark:bg-zinc-900/70">
              <EditIcon className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
        </div>

        <div className="relative space-y-6 mt-24 md:mt-32">
          <div className="relative">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 -z-10" />
          </div>

          {user.badge.length ? (
            <div>
              <p>Chọn huy hiệu</p>
              <Select
                value={color !== null ? JSON.stringify(color) : undefined}
                onValueChange={(value: string) => setColor(JSON.parse(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {user.badge.map((b, idx) => (
                    <SelectItem
                      key={idx}
                      value={JSON.stringify(b.color)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full animate-rainbow"
                          style={{
                            backgroundImage: b.color
                              ? // @ts-ignore
                                b.color.from || b.color.to
                                ? // @ts-ignore
                                  `linear-gradient(to right, ${b.color.from}, ${b.color.to})`
                                : ''
                              : '',
                            backgroundColor: b.color
                              ? // @ts-ignore
                                b.color.color
                                ? // @ts-ignore
                                  b.color.color
                                : ''
                              : '',
                          }}
                        />{' '}
                        <p>{b.name}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {user.badge.length ? (
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

                          <h5
                            className="text-sm font-medium bg-clip-text text-transparent animate-rainbow"
                            style={{
                              backgroundImage: b.color
                                ? // @ts-ignore
                                  b.color.from || b.color.to
                                  ? // @ts-ignore
                                    `linear-gradient(to right, ${b.color.from}, ${b.color.to})`
                                  : ''
                                : '',
                              backgroundColor: b.color
                                ? // @ts-ignore
                                  b.color.color
                                  ? // @ts-ignore
                                    b.color.color
                                  : ''
                                : '',
                            }}
                          >
                            {b.name}
                          </h5>
                        </div>
                      </HoverCardTrigger>

                      <HoverCardContent className="flex items-center gap-6 w-fit dark:bg-zinc-600">
                        <div className="relative w-10 h-10">
                          <Image
                            fill
                            sizes="0%"
                            src={b.image}
                            alt="Badge Image"
                            className="object-contain"
                          />
                        </div>
                        <div className="dark:text-white space-y-1">
                          <p>{b.name}</p>
                          <p className="text-xs">{b.description}</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
                setColor(
                  user.color
                    ? (user.color as {
                        gradient: boolean;
                        from: string;
                        to: string;
                      })
                    : null
                );
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

      <input
        ref={avatarRef}
        type="file"
        accept=".jpg, .png, .jpeg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            setPreviewImage({
              type: 'avatar',
              image: URL.createObjectURL(e.target.files[0]),
            });
            setAspect(1);
            e.target.value = '';
            const target = document.getElementById('crop-modal=button');
            target?.click();
          }
        }}
      />
      <input
        ref={bannerRef}
        type="file"
        accept=".jpg, .png, .jpeg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            setPreviewImage({
              type: 'banner',
              image: URL.createObjectURL(e.target.files[0]),
            });
            setAspect(16 / 9);
            e.target.value = '';
            const target = document.getElementById('crop-modal=button');
            target?.click();
          }
        }}
      />
    </form>
  );
};

export default UserProfile;
