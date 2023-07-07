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
    const SimpleImage = (await import('@editorjs/simple-image')).default;
    const CheckList = (await import('@editorjs/checklist')).default;
    const Quote = (await import('@editorjs/quote')).default;
    const LinkTool = (await import('@editorjs/link')).default;
    const Delimiter = (await import('@editorjs/delimiter')).default;

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
          delimiter: Delimiter,
          checklist: {
            class: CheckList,
            inlineToolbar: true,
          },
          linktool: {
            class: LinkTool,
            config: {
              endpoint: `/api/link`,
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

  return (
    <div
      id="editor"
      className="cursor-text rounded-md border-2 py-2 px-4 border-input/60"
    />
  );
};

export default Editor;
