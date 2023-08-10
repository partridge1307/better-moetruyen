import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { sleep } from './utils';

const contabo = new S3Client({
  endpoint: process.env.CB_URL_ENDPOINT!,
  region: process.env.CB_REGION!,
  credentials: {
    accessKeyId: process.env.CB_ACCESS_KEY!,
    secretAccessKey: process.env.CB_SECRET_KEY!,
  },
  forcePathStyle: true,
  maxAttempts: 5,
});

const sendCommand = async (
  client: S3Client,
  command: PutObjectCommand | DeleteObjectCommand,
  retry = 5
): Promise<PutObjectCommandOutput> => {
  try {
    return await client.send(command);
  } catch (error) {
    if (retry > 0) {
      retry--;
      await sleep(1.5);
      return await sendCommand(client, command, retry);
    } else throw error;
  }
};

const resizeImage = (
  image: sharp.Sharp,
  originalWidth?: number,
  originalHeight?: number
) => {
  let optimizedImage;
  if (originalWidth && originalHeight) {
    if (originalWidth < originalHeight) {
      originalWidth > 1100
        ? (optimizedImage = image.resize(1100))
        : (optimizedImage = image);
    } else {
      originalWidth > 1600
        ? (optimizedImage = image.resize(1600))
        : (optimizedImage = image);
    }
  } else {
    optimizedImage = image;
  }

  return optimizedImage;
};

const generateKey = (key: string, prevImage: string | null) => {
  let Key;

  if (prevImage) {
    const idParam = new URL(prevImage).searchParams.get('id');
    if (idParam) {
      Key = `${key}?id=${Number(idParam) + 1}`;
    } else {
      Key = `${key}?id=1`;
    }
  } else {
    Key = key;
  }

  return Key;
};

const generateName = (
  currentName: string,
  existingImages: string[],
  start: number,
  templateString: string
): string => {
  let newName: string, num;

  if (isNaN(start)) {
    num = 1;
    newName = `${currentName}_${num}`;
  } else {
    num = start;
    newName = `${currentName}_${num}`;
  }

  const existImage = existingImages.some((img) =>
    img.startsWith(`${templateString}/${newName}.webp`)
  );

  if (existImage) {
    return generateName(currentName, existingImages, num + 1, templateString);
  } else {
    return newName;
  }
};

export const UploadChapterImage = (
  images: Blob[],
  mangaId: number,
  chapterIndex: number
) =>
  Promise.all(
    images.map(async (img) => {
      const arrayBuffer = await new Blob([img]).arrayBuffer();
      const sharpImage = sharp(arrayBuffer)
        .toFormat('webp')
        .webp({ quality: 40 });

      const { width: originalWidth, height: originalHeight } =
        await sharpImage.metadata();

      const optimizedImage = await resizeImage(
        sharpImage,
        originalWidth,
        originalHeight
      ).toBuffer();

      const command = new PutObjectCommand({
        Body: optimizedImage,
        Bucket: `chapter`,
        Key: `${mangaId}/${chapterIndex}/${img.name.split('.').shift()}.webp`,
      });

      await sendCommand(contabo, command, 5);

      return `${
        process.env.IMG_DOMAIN
      }/chapter/${mangaId}/${chapterIndex}/${img.name.split('.').shift()}.webp`;
    })
  );

export const UploadMangaImage = async (
  image: Blob,
  mangaId: number,
  prevImage: string | null
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('webp').webp({ quality: 40 });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  const command = new PutObjectCommand({
    Body: optimizedImage,
    Bucket: 'manga',
    Key: `${mangaId}/thumbnail.webp`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/manga/${mangaId}/thumbnail.webp`,
    prevImage
  );
  return Key;
};

export const UploadUserImage = async (
  image: Blob,
  prevImage: string | null,
  userId: string,
  type: 'banner' | 'avatar'
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('webp').webp({ quality: 40 });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  const command = new PutObjectCommand({
    Body: optimizedImage,
    Bucket: 'user',
    Key: `${type}/${userId}.webp`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/user/${type}/${userId}.webp`,
    prevImage
  );

  return Key;
};

export const UploadTeamImage = async (
  image: Blob,
  teamId: number,
  prevImage: string | null
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('webp').webp({ quality: 40 });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  const command = new PutObjectCommand({
    Body: optimizedImage,
    Bucket: 'team',
    Key: `${teamId}.webp`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/team/${teamId}.webp`,
    prevImage
  );

  return Key;
};

export const EditChapterImage = async (
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

  const uploadedNewImages = await Promise.all(
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

      await sendCommand(contabo, command, 5);

      return {
        index: img.index,
        image: generatedKey,
      };
    })
  );

  const deletedImages = serializedExistImages.filter(
    (img) => !linkImages.some((image) => image.image === img.image)
  );

  await Promise.all(
    deletedImages.map(async (img) => {
      const image = new URL(img.image).pathname.split('/').pop();

      const command = new DeleteObjectCommand({
        Bucket: 'chapter',
        Key: `${mangaId}/${chapterIndex}/${image}`,
      });

      await sendCommand(contabo, command);
    })
  );

  return [...linkImages, ...uploadedNewImages];
};
