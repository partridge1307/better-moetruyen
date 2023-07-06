import '@/styles/editor.css';
import type EditorJS from '@editorjs/editorjs';
import {
  FC,
  useCallback,
  useEffect,
  useState,
  type MutableRefObject,
} from 'react';

interface EditorProps {
  editorRef: MutableRefObject<EditorJS | undefined>;
}

const Editor: FC<EditorProps> = ({ editorRef }) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default;
    const Header = (await import('@editorjs/header')).default;
    const Embed = (await import('@editorjs/embed')).default;
    const SimpleImage = (await import('@editorjs/simple-image')).default;
    const CheckList = (await import('@editorjs/checklist')).default;
    const Quote = (await import('@editorjs/quote')).default;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          editorRef.current = editor;
        },
        placeholder: 'Nhập nội dung vào đây',
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          image: SimpleImage,
          quote: Quote,
          checklist: {
            class: CheckList,
            inlineToolbar: true,
          },
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                facebook: true,
                instagram: true,
                pinterest: true,
                discord: {
                  regex:
                    /https:\/\/discord.com\/channels\/([^A-Za-z\/\?\&]*)\/.*\S/,
                  embedUrl:
                    'https://discord.com/widget?id=<%= remote_id %>&theme=dark',
                  html: '<iframe height="500" allowtransparency="true" frameborder="no" allowfullscreen="true" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" style="width: 100%"></iframe>',
                  id: (groups: string[]) => groups[0],
                },
              },
            },
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);
    }
  }, []);
  useEffect(() => {
    const init = async () => {
      await initializeEditor();
    };
    if (mounted) {
      init();

      return () => {
        editorRef.current?.destroy();
        editorRef.current = undefined;
      };
    }
  }, [mounted, initializeEditor, editorRef]);

  if (!mounted) return null;

  return <div id="editor" className="cursor-text" />;
};

export default Editor;
