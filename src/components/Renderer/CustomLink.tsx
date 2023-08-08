const CustomLink = ({ data }: any) => {
  return (
    <a
      href={data.link}
      target="_blank"
      className="grid grid-cols-1 md:grid-cols-[.4fr_1fr] dark:bg-zinc-800 dark:hover:bg-zinc-800/60 transition-colors rounded-lg max-w-sm md:max-w-lg xl:max-w-xl gap-6 p-2 md:p-4 mx-auto"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={data.meta.image.url}
        width={100}
        height={100}
        loading="lazy"
        alt="Link Image"
        className="object-cover object-center rounded-xl h-24 w-full md:h-36 md:w-36"
      />

      <div className="flex flex-col justify-center gap-2">
        <p className="text-sky-500">{data.link.split('//')[1]}</p>
        <div className="space-y-2">
          <p className="text-xl font-bold">{data.meta.title}</p>
          <p className="line-clamp-3 leading-5 text-sm">
            {data.meta.description}
          </p>
        </div>
      </div>
    </a>
  );
};

export default CustomLink;
