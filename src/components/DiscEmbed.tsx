import { FC } from 'react';

interface DiscEmbedProps {
  discordLink: string;
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
        `https://discord.com/api/v10/invites/${new URL(link).pathname.slice(
          1
        )}`,
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

const DiscEmbed: FC<DiscEmbedProps> = async ({ discordLink }) => {
  const discord = await fetchDisc(discordLink);

  return (
    !!discord.code && (
      <div className="space-y-2">
        <h1>Discord{!!discord.name && <span>: {discord.name}</span>}</h1>
        <iframe
          title="Discord Iframe"
          height={300}
          src={`https://discord.com/widget?id=${discord.id}&theme=dark`}
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          loading="lazy"
          className="w-full border dark:border-zinc-700 rounded-md"
        />
      </div>
    )
  );
};

export default DiscEmbed;
