import { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { ZodType, z } from 'zod';

export const CommentContentValidator = z.object({
  content: z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>,
  oEmbed: z
    .object({
      link: z.string(),
      meta: z.object({
        title: z.string(),
        description: z.string(),
        image: z.object({ url: z.string() }),
      }),
    })
    .optional(),
  commentId: z.number().optional(),
  id: z.string().optional(),
});
export type CommentContentPayload = z.infer<typeof CommentContentValidator>;
