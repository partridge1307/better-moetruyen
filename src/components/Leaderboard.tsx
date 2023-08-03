import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import TopManga from '@/components/Manga/Top';

const Leaderboard = async () => {
  return (
    <Tabs defaultValue="manga">
      <TabsList className="grid grid-cols-2 gap-2 dark:bg-zinc-900">
        <TabsTrigger value="manga">Manga</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>

      <TabsContent value="manga">
        <TopManga />
      </TabsContent>
    </Tabs>
  );
};

export default Leaderboard;
