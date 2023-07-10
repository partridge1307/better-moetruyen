'use client';

import { cn, dataUrlToBlob } from '@/lib/utils';
import { User } from '@prisma/client';
import { Loader2, Pencil, Plus } from 'lucide-react';
import Image from 'next/image';
import { FC, useEffect, useReducer, useRef, useState } from 'react';
import { PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropModal from '../ImageCropModal';
import { Input } from '../ui/Input';
import { useMutation } from '@tanstack/react-query';
import { UserProfileEditPayload } from '@/lib/validators/user';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface UserProfileProps {
  user: User;
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
  const [completeCrop, setCompleteCrop] = useState<PixelCrop>();
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
      const { avatar, banner, name } = values;
      const form = new FormData();
      form.append('avatar', avatar ? avatar : '');
      form.append('banner', banner ? banner : '');
      form.append('name', name);

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
        <div className="relative rounded-md cursor-pointer border-2 dark:border-zinc-900 border-dashed w-full h-44 md:h-52 dark:bg-zinc-700/40">
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-all dark:hover:bg-zinc-900',
              (user.banner || previewImage) && 'opacity-0 hover:opacity-100'
            )}
          >
            <Plus className="w-1/3 h-1/3" />
          </div>

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
              'absolute w-32 h-32 md:w-36 md:h-36 rounded-full border-[12px] dark:border-zinc-900 max-sm:left-1/2 max-sm:-translate-x-1/2 md:left-3 top-2/3',
              !user.image && 'dark:bg-zinc-700'
            )}
          >
            <div
              className={cn(
                'absolute inset-0 rounded-full flex items-center justify-center transition-all dark:hover:bg-zinc-800'
              )}
            >
              <Plus className="w-1/3 h-1/3" />
            </div>

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

            <div className="absolute top-0 w-full h-full rounded-full">
              <input
                type="file"
                title=""
                accept=".jpg, .png, .jpeg"
                className="absolute inset-0 opacity-0 z-10 rounded-full cursor-pointer"
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
            </div>
          </div>

          <input
            type="file"
            title=""
            accept=".jpg, .png, .jpeg"
            className="absolute inset-0 opacity-0 cursor-pointer"
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
        </div>

        <div className="relative mt-20 md:mt-24">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 -z-10" />
        </div>

        {(state.avatar || state.banner || username !== user.name) && (
          <div className="absolute inset-x-0 h-fit flex items-center justify-end gap-6 rounded-md p-3 px-4 bottom-0 dark:bg-zinc-900/70">
            <button
              disabled={isEditting}
              className="hover:underline underline-offset-2"
              onClick={(e) => {
                e.preventDefault();
                dispatch({ type: ActionType.RESET, payload: '' });
                setUsername(user.name!);
                setBlobImg(null);
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
          completeCrop={completeCrop}
          setCompleteCrop={(value) => setCompleteCrop(value)}
          aspect={aspect}
          setDataUrl={(value) => setDataUrl(value)}
        />
      </div>
    </form>
  );
};

export default UserProfile;
