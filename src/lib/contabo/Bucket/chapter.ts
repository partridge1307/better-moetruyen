import sharp from 'sharp';
import { generateKey, generateName, resizeImage, sendCommand } from '../utils';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';

const UploadChapterImage = async (
  images: Blob[],
  mangaId: number,
  chapterIndex: number
) => {
  const optimizedImages = await Promise.all(
    images.map(async (img) => {
      const arrayBuffer = await new Blob([img]).arrayBuffer();
      const sharpImage = sharp(arrayBuffer)
        .toFormat('webp')
        .webp({ quality: 40 });

      const { width: originalWidth, height: originalHeight } =
        await sharpImage.metadata();

      const buffer = await resizeImage(
        sharpImage,
        originalWidth,
        originalHeight
      ).toBuffer();

      return {
        buffer,
        name: img.name.split('.').shift(),
      };
    })
  );

  let imagesLink: string[] = [];
  for (const image of optimizedImages) {
    const command = new PutObjectCommand({
      Body: image.buffer,
      Bucket: `chapter`,
      Key: `${mangaId}/${chapterIndex}/${image.name}.webp`,
    });

    await sendCommand(contabo, command, 5);

    imagesLink.push(
      `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}/${image.name}.webp`
    );
  }

  return imagesLink;
};

const EditChapterImage = async (
  newImages: (Blob | string)[],
  existingImages: string[],
  mangaId: number,
  chapterIndex: number
) => {
  const [serializedNewImages, serializedExistImages] = await Promise.all([
    newImages.map((image, index) => ({ index, image })),
    existingImages.map((image, index) => ({ index, image })),
  ]);
  const [blobImages, linkImages] = await Promise.all([
    serializedNewImages.filter((image) => image.image instanceof File) as {
      index: number;
      image: File;
    }[],
    serializedNewImages.filter((image) => typeof image.image === 'string') as {
      index: number;
      image: string;
    }[],
  ]);

  const blobImagesHandler = await Promise.all(
    blobImages.map(async (img) => {
      const arrayBuffer = await new Blob([img.image]).arrayBuffer();
      const sharpImage = sharp(arrayBuffer)
        .toFormat('webp')
        .webp({ quality: 40 });

      const { width, height } = await sharpImage.metadata();

      const optimizedImage = await resizeImage(
        sharpImage,
        width,
        height
      ).toBuffer();

      const key = `${
        process.env.IMG_DOMAIN
      }/chapter/${mangaId}/${chapterIndex}/${img.image.name
        .split('.')
        .shift()}.webp`;

      let command, generatedKey;

      const existImage = serializedExistImages.find(
        (exist) => exist.index === img.index && exist.image.startsWith(key)
      );
      if (existImage) {
        command = new PutObjectCommand({
          Body: optimizedImage,
          Bucket: 'chapter',
          Key: `${mangaId}/${chapterIndex}/${img.image.name
            .split('.')
            .shift()}.webp`,
        });

        generatedKey = generateKey(
          `${
            process.env.IMG_DOMAIN
          }/chapter/${mangaId}/${chapterIndex}/${img.image.name
            .split('.')
            .shift()}.webp`,
          existImage.image
        );
      } else {
        const name = img.image.name.split('.')[0].split('_');
        const newName = generateName(
          name[0],
          existingImages,
          Number(name[1]),
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}`
        );

        command = new PutObjectCommand({
          Body: optimizedImage,
          Bucket: 'chapter',
          Key: `${mangaId}/${chapterIndex}/${newName}.webp`,
        });

        generatedKey = generateKey(
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterIndex}/${newName}.webp`,
          null
        );
      }

      return {
        index: img.index,
        image: generatedKey,
        command: command,
      };
    })
  );

  let uploadedNewImages: { index: number; image: string }[] = [];
  for (const blobImage of blobImagesHandler) {
    await sendCommand(contabo, blobImage.command, 5);

    uploadedNewImages.push({ index: blobImage.index, image: blobImage.image });
  }

  const deletedImages = serializedExistImages.filter(
    (img) => !linkImages.some((image) => image.image === img.image)
  );
  for (const deletedImage of deletedImages) {
    const image = new URL(deletedImage.image).pathname.split('/').pop();

    const command = new DeleteObjectCommand({
      Bucket: 'chapter',
      Key: `${mangaId}/${chapterIndex}/${image}`,
    });

    await sendCommand(contabo, command, 5);
  }

  return [...linkImages, ...uploadedNewImages];
};

export { UploadChapterImage, EditChapterImage };
