import { cn } from '@/lib/utils';
import Image from 'next/image';
import { forwardRef, useRef, useState } from 'react';
import type { Crop, PixelCrop } from 'react-image-crop';
import { ReactCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
} from './ui/AlertDialog';
import { buttonVariants } from './ui/Button';
import { Slider } from './ui/Slider';

interface ImageCropModalProps {
  previewImage: {
    type: string;
    image: string;
  } | null;
  setCancel: (type: string) => void;
  setDone: () => void;
  aspect: number;
  setDataUrl: ({ type, data }: { type: string; data: string }) => void;
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
  ({ previewImage, setCancel, setDone, aspect, setDataUrl }, ref) => {
    const [completeCrop, setCompleteCrop] = useState<PixelCrop>();
    const [crop, setCrop] = useState<Crop>({
      unit: 'px',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
    const imageRef = useRef<HTMLImageElement | null>(null);
    let mediaWidth = 0,
      mediaHeight = 0;

    if (imageRef.current) {
      mediaWidth = imageRef.current.naturalWidth;
      mediaHeight = imageRef.current.naturalHeight;
    }

    function onDoneHandler() {
      if (
        completeCrop?.width &&
        completeCrop?.height &&
        imageRef.current &&
        previewImage
      ) {
        const dataUrl = cropImage(imageRef.current, completeCrop);
        setDataUrl({ type: previewImage.type, data: dataUrl });
        setDone();
      }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }

    return (
      <AlertDialog>
        <AlertDialogTrigger ref={ref} className="hidden">
          Cropper
        </AlertDialogTrigger>
        <AlertDialogContent>
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
                  className="object-fill w-full h-1/3"
                />
              </ReactCrop>
            )}

            {mediaWidth !== 0 && mediaHeight !== 0 && (
              <Slider
                defaultValue={[aspect === 1 ? 100 : 75]}
                min={aspect === 1 ? 25 : 50}
                max={aspect === 1 ? 100 : 100}
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
              <AlertDialogCancel
                className={cn(
                  buttonVariants({ variant: 'destructive' }),
                  'bg-red-600 w-20'
                )}
                onClick={() => {
                  setCancel(previewImage?.type!);
                }}
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                className={cn(buttonVariants({ variant: 'default' }), 'w-20')}
                onClick={() => onDoneHandler()}
              >
                Xong
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);

ImageCropModal.displayName = 'ImageCropModal';

export default ImageCropModal;
