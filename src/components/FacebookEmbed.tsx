import { FC } from 'react';

interface FacebookEmbedProps {
  facebookLink: string;
}

const FacebookEmbed: FC<FacebookEmbedProps> = ({ facebookLink }) => {
  return (
    <iframe
      allowFullScreen
      loading="lazy"
      height="300"
      title="Facebook Iframe"
      src={`https://www.facebook.com/plugins/page.php?href=${facebookLink}&tabs=timeline&width=300&height=300&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&lazy=true&appId=1042446022855517`}
      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      className="w-full border dark:border-zinc-700 rounded-md"
    />
  );
};

export default FacebookEmbed;
