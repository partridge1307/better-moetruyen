import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import Manga from './Manga';
import Team from './Team';

const Leaderboard = () => {
  return (
    <Tabs defaultValue="manga">
      <TabsList className="dark:bg-zinc-900/60">
        <TabsTrigger value="manga">Manga</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>

      <TabsContent value="manga">
        <Manga />
      </TabsContent>

      <TabsContent value="team">
        <Team />
      </TabsContent>
    </Tabs>
  );
};

export default Leaderboard;
