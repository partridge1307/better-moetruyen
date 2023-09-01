import type { Manga } from '@prisma/client';
import { FC } from 'react';

interface DiscEmbedProps {
  manga: Pick<Manga, 'discordLink'>;
}

type DiscordProps = {
  code: boolean;
  id?: string;
  name?: string;
};

async function fetchDisc(link: string | null) {
  let result: DiscordProps = { code: false };

  if (link) {
    try {
      const data = await fetch(
        `https://discord.com/api/v10/invites/${link.split('/').pop()}`,
        {
          cache: 'force-cache',
        }
      ).then((res) => res.json());

      if (data.code === 10006) result.code = false;
      result.code = true;
      result.id = data.guild.id;
      result.name = data.guild.name;
    } catch (error) {
      result.code = false;
    }
  }

  return result;
}

const DiscEmbed: FC<DiscEmbedProps> = async ({ manga }) => {
  const discord = await fetchDisc(manga.discordLink);

  return (
    !!discord.code && (
      <div className="space-y-2">
        <h1>Discord{!!discord.name && <span>: {discord.name}</span>}</h1>
        <iframe
          src={`https://discord.com/widget?id=${discord.id}&theme=dark`}
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          className="w-full border dark:border-zinc-700 rounded-md"
        />
      </div>
    )
  );
};

export default DiscEmbed;
