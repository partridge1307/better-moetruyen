import '@/styles/editor.css';
import type EditorJS from '@editorjs/editorjs';
import type { OutputBlockData } from '@editorjs/editorjs';
import type { BlockMutationEvent } from '@editorjs/editorjs/types/events/block';
import { FC, useCallback, useEffect, useState } from 'react';

interface EditorProps {
  editorRef: React.MutableRefObject<EditorJS | undefined>;
  initialData?: any;
}

const charactersLimit = 2048;

function couldBeCounted(block: OutputBlockData<string, any>) {
  return 'text' in block.data;
}
function getBlocksTextLen(blocks: OutputBlockData<string, any>[]) {
  return blocks.filter(couldBeCounted).reduce((sum, block) => {
    sum += block.data.text.length;

    return sum;
  }, 0);
}

const Editor: FC<EditorProps> = ({ editorRef, initialData }) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default;
    const CheckList = (await import('@editorjs/checklist')).default;
    const Quote = (await import('@editorjs/quote')).default;
    const LinkTool = (await import('@editorjs/link')).default;
    const DragDrop = (await import('editorjs-drag-drop')).default;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'editor',
        placeholder: 'Nhập nội dung vào đây',
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          quote: Quote,
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
        i18n: {
          messages: {
            ui: {
              blockTunes: {
                toggler: {
                  'Click to tune': 'Điều khiển',
                },
              },
              inlineToolbar: {
                converter: {
                  'Convert to': 'Chuyển',
                },
              },
              toolbar: {
                toolbox: {
                  Add: 'Thêm',
                },
              },
              popover: {
                Filter: 'Lọc',
                'Nothing found': 'Không tìm thấy',
              },
            },
            toolNames: {
              Bold: 'In đậm',
              Italic: 'In nghiêng',
              Checklist: 'Danh sách',
              Heading: 'Tiêu đề',
              Text: 'Văn bản',
              Quote: 'Trích dẫn',
              Link: 'Liên kết',
            },
            blockTunes: {
              delete: {
                Delete: 'Xóa',
              },
              moveUp: {
                'Move up': 'Chuyển lên',
              },
              moveDown: {
                'Move down': 'Chuyển xuống',
              },
            },
          },
        },
        onChange: async (api, event: BlockMutationEvent) => {
          const content = await api.saver.save();
          const contentLen = getBlocksTextLen(content.blocks);

          if (contentLen <= charactersLimit || !event.detail) return;

          const workingBlock = event.detail.target;
          // @ts-ignore
          const workingBlockIndex = event.detail.index;

          const workingBlockSaved = content.blocks
            .filter((block) => block.id === workingBlock.id)
            .pop();

          const otherBlocks = content.blocks.filter(
            (block) => block.id !== workingBlock.id
          );
          const otherBlocksLen = getBlocksTextLen(otherBlocks);

          const workingBlockLimit = charactersLimit - otherBlocksLen;

          api.blocks.update(workingBlock.id, {
            text: workingBlockSaved?.data.text.substr(0, workingBlockLimit),
          });

          api.caret.setToBlock(workingBlockIndex, 'end');
        },
      });

      editor.isReady.then(() => {
        editorRef.current = editor;
        new DragDrop(editorRef.current);

        if (initialData) {
          editorRef.current.render(initialData);
        }
      });
    }
  }, [editorRef, initialData]);

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
