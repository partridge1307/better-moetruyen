import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Daily from './Daily';
import Weekly from './Weekly';
import AllTime from './AllTime';

const Top = () => {
  return (
    <Tabs defaultValue="daily">
      <TabsList className="grid grid-cols-3 gap-2 dark:bg-zinc-900 overflow-auto">
        <TabsTrigger value="daily">Ngày</TabsTrigger>
        <TabsTrigger value="weekly">Tuần</TabsTrigger>
        <TabsTrigger value="all-time">Mọi lúc</TabsTrigger>
      </TabsList>

      <TabsContent value="daily">
        <Daily />
      </TabsContent>

      <TabsContent value="weekly">
        <Weekly />
      </TabsContent>

      <TabsContent value="all-time">
        <AllTime />
      </TabsContent>
    </Tabs>
  );
};

export default Top;
