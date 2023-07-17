import { Button } from '@/components/ui/Button';
import { AutoLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMutation } from '@tanstack/react-query';

export default function Submit(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const editorState = editor.getEditorState();
  const {
    data: oEmbedData,
    mutate: Embed,
    isLoading: isFetchingOEmbed,
  } = useMutation({
    mutationFn: async (linkUrl: string) => {
      const { link, meta } = await (
        await fetch(`/api/link?url=${linkUrl}`)
      ).json();

      return { link, meta };
    },
  });

  function onClick() {
    editorState._nodeMap.forEach((V) => {
      if (V instanceof AutoLinkNode) {
        Embed(V.__url);
      }
    });
  }

  if (typeof oEmbedData !== 'undefined' && !isFetchingOEmbed) {
    console.log(JSON.stringify(editorState.toJSON()));
    console.log(JSON.stringify(oEmbedData));
  }

  return (
    <Button className="w-full" onClick={() => onClick()}>
      Submit
    </Button>
  );
}
