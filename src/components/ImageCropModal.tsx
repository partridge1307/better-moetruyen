import { cn } from '@/lib/utils';
import { DialogClose } from '@radix-ui/react-dialog';
import { useDebounce } from '@uidotdev/usehooks';
import Image from 'next/image';
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  ReactCrop,
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';
import { buttonVariants } from './ui/Button';
import { Dialog, DialogContent, DialogTrigger } from './ui/Dialog';
import { Slider } from './ui/Slider';

interface ImageCropModalProps {
  previewImage: {
    type: 'avatar' | 'banner';
    image: string;
  } | null;
  setCancel: (type: 'avatar' | 'banner') => void;
  setDone: () => void;
  setCompleteCrop: Dispatch<SetStateAction<PixelCrop | undefined>>;
  aspect: number;
  completeCrop: PixelCrop | undefined;
  setDataUrl: Dispatch<
    SetStateAction<{
      type: 'avatar' | 'banner';
      data: string;
    } | null>
  >;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: aspect === 1 ? 100 : 75,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function cropImage(image: HTMLImageElement, crop: PixelCrop) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx?.translate(-cropX, -cropY);
  ctx?.translate(centerX, centerY);
  ctx?.translate(-centerX, -centerY);

  ctx?.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );
  const res = canvas.toDataURL('image/webp');
  canvas.remove();

  return res;
}

const ImageCropModal = forwardRef<HTMLButtonElement, ImageCropModalProps>(
  (
    {
      previewImage,
      setCancel,
      setDone,
      completeCrop,
      setCompleteCrop,
      aspect,
      setDataUrl,
    },
    ref
  ) => {
    const [crop, setCrop] = useState<Crop>({
      unit: 'px',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
    const debouncedCrop = useDebounce(completeCrop, 300);
    const imageRef = useRef<HTMLImageElement | null>(null);
    let mediaWidth = 0,
      mediaHeight = 0;

    if (imageRef.current) {
      mediaWidth = imageRef.current.naturalWidth;
      mediaHeight = imageRef.current.naturalHeight;
    }

    useEffect(() => {
      const handler = async () => {
        if (
          completeCrop?.width &&
          completeCrop?.height &&
          imageRef.current &&
          previewImage
        ) {
          const dataUrl = cropImage(imageRef.current, completeCrop);
          setDataUrl({ type: previewImage.type, data: dataUrl });
        }
      };

      handler();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [completeCrop, debouncedCrop, previewImage]);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }

    return (
      <Dialog>
        <DialogTrigger ref={ref} className="hidden">
          Cropper
        </DialogTrigger>
        <DialogContent isCustomDialog={true}>
          <div className="relative w-[1280x] h-fit space-y-10">
            {previewImage && (
              <ReactCrop
                locked
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompleteCrop(c)}
                aspect={aspect}
                circularCrop={aspect === 1}
              >
                <Image
                  ref={imageRef}
                  width={0}
                  height={0}
                  sizes="0%"
                  priority
                  src={previewImage.image}
                  alt="Profile Banner"
                  onLoad={onImageLoad}
                  className="object-cover w-full h-1/3"
                />
              </ReactCrop>
            )}

            {mediaWidth !== 0 && mediaHeight !== 0 && (
              <Slider
                defaultValue={[aspect === 1 ? 55 : 75]}
                min={aspect === 1 ? 25 : 50}
                max={55}
                step={1}
                onValueChange={(value) =>
                  setCrop(
                    centerCrop(
                      makeAspectCrop(
                        { unit: '%', width: value[0] },
                        aspect,
                        mediaWidth,
                        mediaHeight
                      ),
                      mediaWidth,
                      mediaHeight
                    )
                  )
                }
              />
            )}

            <div className="w-full flex items-center justify-end gap-6">
              <DialogClose
                className={cn(
                  buttonVariants({ variant: 'destructive' }),
                  'bg-red-600 w-20'
                )}
                onClick={() => {
                  setCancel(previewImage?.type!);
                }}
              >
                Hủy
              </DialogClose>
              <DialogClose
                className={cn(buttonVariants({ variant: 'default' }), 'w-20')}
                onClick={() => setDone()}
              >
                Xong
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

ImageCropModal.displayName = 'ImageCropModal';

export default ImageCropModal;
