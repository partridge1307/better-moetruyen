import { ChatPayload, ChatValidator } from '@/lib/validators/chat';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendHorizonal } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem } from '../ui/Form';
import { Input } from '../ui/Input';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import type { Conversation } from '@prisma/client';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';

interface ChatFormProps {
  conversation: Pick<Conversation, 'id'>;
}

const ChatForm: FC<ChatFormProps> = ({ conversation }) => {
  const { loginToast, notFoundToast } = useCustomToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ChatPayload>({
    resolver: zodResolver(ChatValidator),
    defaultValues: {
      content: '',
      conversationId: -1,
    },
  });
  const { mutate: createMessage, isLoading } = useMutation({
    mutationFn: async (values: ChatPayload) => {
      const { content } = values;

      await axios.post('/api/message', {
        content,
        conversationId: conversation.id,
      });
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
    onSuccess: () => {
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
            <FormItem className="flex items-center justify-center h-10 gap-4 px-2 space-y-0">
              <FormControl>
                <Input
                  ref={(e) => {
                    field.ref(e);
                    inputRef.current = e;
                  }}
                  className="focus-visible:ring-1 dark:border-white dark:focus-visible:ring-offset-0 dark:focus-visible:ring-white"
                  autoComplete="off"
                  value={field.value}
                  onChange={(e) => field.onChange(e)}
                  onBlur={() => field.onBlur()}
                />
              </FormControl>

              <button disabled={isLoading} type="submit">
                <SendHorizonal className="w-8 h-8" />
              </button>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ChatForm;
