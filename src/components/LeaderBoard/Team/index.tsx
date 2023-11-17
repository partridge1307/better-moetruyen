import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Daily from './Daily';
import Weekly from './Weekly';
import All from './All';

const Team = () => {
  return (
    <Tabs defaultValue="daily">
      <TabsList className="grid grid-cols-3 gap-2 bg-primary-foreground">
        <TabsTrigger value="daily">Ngày</TabsTrigger>
        <TabsTrigger value="weekly">Tuần</TabsTrigger>
        <TabsTrigger value="all">Mọi lúc</TabsTrigger>
      </TabsList>

      <TabsContent value="daily">
        <Daily />
      </TabsContent>

      <TabsContent value="weekly">
        <Weekly />
      </TabsContent>

      <TabsContent value="all">
        <All />
      </TabsContent>
    </Tabs>
  );
};

export default Team;
