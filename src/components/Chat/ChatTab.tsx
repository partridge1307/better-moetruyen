import { FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import ChatRequest from './ChatRequest';
import ChatList from './ChatList';
import { MessageCircle } from 'lucide-react';

interface ChatTabProps {}

const ChatTab: FC<ChatTabProps> = ({}) => {
  return (
    <Tabs defaultValue="chat" className="relative h-full flex flex-col gap-2">
      <h1 className="md:text-xl font-semibold flex items-center gap-1">
        <MessageCircle className="w-6 h-6" /> <span>Trò chuyện</span>
      </h1>
      <TabsList className="grid grid-cols-[1fr_.7fr] dark:bg-zinc-800">
        <TabsTrigger value="chat">Hội thoại</TabsTrigger>
        <TabsTrigger value="add">Thêm</TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="relative flex-1 overflow-y-auto">
        <ChatList />
      </TabsContent>

      <TabsContent value="add" className="relative overflow-y-auto">
        <ChatRequest />
      </TabsContent>
    </Tabs>
  );
};

export default ChatTab;
