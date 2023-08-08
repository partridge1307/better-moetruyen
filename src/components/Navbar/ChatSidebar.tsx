'use client';

import { useMediaQuery } from '@mantine/hooks';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';
import { FC, createContext } from 'react';
import type { Conversation, User } from '@prisma/client';

export type ExtendedConversation = Conversation & {
  users: Pick<User, 'id' | 'name' | 'color' | 'image'>[];
};

interface ChatSidebarProps {
  conversation: ExtendedConversation[] | null;
}
export const ConversationContext = createContext<
  ExtendedConversation[] | null
>(null);

const ChatSidebar: FC<ChatSidebarProps> = ({ conversation }) => {
  const matches = useMediaQuery('(max-width: 640px)');

  return (
    <ConversationContext.Provider value={conversation}>
      {matches ? <MobileSidebar /> : <DesktopSidebar />}
    </ConversationContext.Provider>
  );
};

export default ChatSidebar;