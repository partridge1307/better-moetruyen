import { FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import ChatRequest from './ChatRequest';
import ChatList from './ChatList';

interface ChatTabProps {}

const ChatTab: FC<ChatTabProps> = ({}) => {
  return (
    <Tabs defaultValue="chat" className="max-h-[90%]">
      <TabsList className="grid grid-cols-[1fr_.7fr] dark:bg-zinc-800">
        <TabsTrigger value="chat">Hội thoại</TabsTrigger>
        <TabsTrigger value="add">Thêm</TabsTrigger>
      </TabsList>

      <TabsContent value="chat">
        <ChatList />
      </TabsContent>

      <TabsContent value="add">
        <ChatRequest />
      </TabsContent>
    </Tabs>
  );
};

export default ChatTab;
