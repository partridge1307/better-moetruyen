'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { ChatPayload, ChatValidator } from '@/lib/validators/chat';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Conversation } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { SendHorizonal } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/Form';
import { Input } from '../ui/Input';
import { socket } from '@/lib/socket';
import { cn } from '@/lib/utils';
import type { Session } from 'next-auth';

interface ChatFormProps {
  conversation: Pick<Conversation, 'id'>;
  session: Session;
}

const ChatForm: FC<ChatFormProps> = ({ conversation, session }) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ChatPayload>({
    resolver: zodResolver(ChatValidator),
    defaultValues: {
      content: '',
      conversationId: conversation.id,
      senderId: session.user.id,
    },
  });
  const { mutate: createMessage, isLoading } = useMutation({
    mutationFn: async (values: ChatPayload) => {
      await axios.post('/api/conversation/message/create', values);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return toast({
        title: 'Có lỗi xảy ra',
        description: 'Có lỗi xảy ra. Vui lòng thử lại sau',
        variant: 'destructive',
      });
    },
    onSuccess: (_, values) => {
      const { content, conversationId, senderId } = values;
      socket.emit('message', { content, conversationId, senderId });

      form.setValue('content', '');
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      inputRef.current?.focus();
    }
  }, []);

  function onSubmitHandler(values: ChatPayload) {
    createMessage(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)}>
        <FormField
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="relative flex items-center justify-center gap-4 p-2">
                <FormControl>
                  <Input
                    ref={(e) => {
                      field.ref(e);
                      inputRef.current = e;
                    }}
                    autoComplete="off"
                    placeholder="Nhập nội dung"
                    value={field.value}
                    onChange={(e) => field.onChange(e)}
                    onBlur={() => field.onBlur()}
                    className="focus-visible:ring-1 dark:border-white dark:focus-visible:ring-offset-0 dark:focus-visible:ring-white"
                  />
                </FormControl>
                <FormMessage className="absolute left-2 -top-1/3 text-red-500" />

                <button
                  type="submit"
                  disabled={isLoading || field.value.length < 5}
                  className={cn({
                    'opacity-50': field.value.length < 5,
                  })}
                >
                  <SendHorizonal className="w-8 h-8" />
                </button>
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ChatForm;
