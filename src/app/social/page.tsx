import Social from '@/components/Social';
import axios from 'axios';

const getLikes = async (pageId: string) => {
  const data = await axios
    .get(`https://www.facebook.com/plugins/fan.php?id=${pageId}`)
    .then(({ data }) => data as string);

  const likesMatch = data.match(
    /(?:\<div class="_1drq" .*?\>)(.*?)(?=\<\/div\>)/
  );
  const likesStr = !!!likesMatch ? '0' : likesMatch[1];
  const likes = !!likesStr.match(/^[0-9.]*/)
    ? likesStr.match(/^[0-9.]*/)![0]
    : '0';

  return Number(likes);
};

const getServerMembers = async (inviteCode: string) => {
  const { data } = await axios.get(
    `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`
  );

  return data.approximate_member_count;
};

const page = async () => {
  const [pageLikes, serverMembers] = await Promise.all([
    getLikes(`Bfangteam`),
    getServerMembers(`pf26Duy`),
  ]);

  return <Social pageLikes={pageLikes} serverMembers={serverMembers} />;
};

export default page;
