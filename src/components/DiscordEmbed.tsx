import { FC } from 'react';

interface DiscordEmbedProps {
  discordLink: string;
}

type DiscordProps = {
  code: boolean;
  id?: string;
};

async function fetchDisc(link: string | null) {
  let result: DiscordProps = { code: false };

  if (link) {
    try {
      const data = await fetch(
        `https://discord.com/api/v10/invites/${new URL(link).pathname.slice(
          1
        )}`,
        {
          cache: 'force-cache',
          mode: 'cors',
        }
      ).then((res) => res.json());

      if (data.code === 10006) result.code = false;
      result.code = true;
      result.id = data.guild.id;
    } catch (error) {
      result.code = false;
    }
  }

  return result;
}

const DiscordEmbed: FC<DiscordEmbedProps> = async ({ discordLink }) => {
  const discord = await fetchDisc(discordLink);

  return (
    !!discord.code && (
      <iframe
        title="Discord Iframe"
        height={300}
        src={`https://discord.com/widget?id=${discord.id}&theme=dark`}
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        loading="lazy"
        className="w-full border dark:border-zinc-700 rounded-md"
      />
    )
  );
};

export default DiscordEmbed;
