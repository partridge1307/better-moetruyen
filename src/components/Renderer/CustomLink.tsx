import Image from 'next/image';

const CustomLink = ({ data }: any) => {
  return (
    <a
      href={data.link}
      target="_blank"
      className="grid grid-cols-1 md:grid-cols-[.3fr_1fr] dark:bg-zinc-800 dark:hover:bg-zinc-800/60 transition-colors rounded-lg max-w-sm md:max-w-lg xl:max-w-xl gap-6 p-2 md:p-4 mx-auto"
    >
      <div className="relative h-24 w-full md:h-36 md:w-36">
        <Image
          fill
          sizes="0%"
          src={data.meta.image.url}
          alt="Link Image"
          className="object-cover object-center rounded-xl"
        />
      </div>
      <div className="flex flex-col justify-between max-sm:gap-4">
        <div className="space-y-2">
          <p className="text-xl font-bold">{data.meta.title}</p>
          <p className="line-clamp-3 leading-5 text-sm">
            {data.meta.description}
          </p>
        </div>
        <p className="text-sky-500">{data.link.split('//')[1]}</p>
      </div>
    </a>
  );
};

export default CustomLink;
