import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FloatingLinkEditor, getSelectedNode } from '../Link';
import { Input } from '@/components/ui/Input';
import { ImageInputBody } from '../Image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
const voidPayload = void +'';
const lowPriority = 1;

export function FillURL() {
  const srcfile = prompt('Enter the URL of the image:', '');

  return srcfile;
}

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [selectedInlineStyle, setSelectedInlineStyle] = useState<string[]>([]);
  const [isLink, setIsLink] = useState<boolean>(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    let selectedInlineStyles = [...selectedInlineStyle];
    const updateInlineStyle = (selectedFormat: boolean, format: string) => {
      if (selectedFormat) {
        if (!selectedInlineStyles.includes(format))
          selectedInlineStyles.push(format);
        else return;
      } else {
        selectedInlineStyles = selectedInlineStyles.filter((s) => s !== format);
      }
    };

    if ($isRangeSelection(selection)) {
      updateInlineStyle(selection.hasFormat('bold'), 'bold');
      updateInlineStyle(selection.hasFormat('italic'), 'italic');
      updateInlineStyle(selection.hasFormat('underline'), 'underline');
      updateInlineStyle(selection.hasFormat('strikethrough'), 'strikethrough');

      setSelectedInlineStyle(selectedInlineStyles);

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [selectedInlineStyle]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => updateToolbar());
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        lowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        lowPriority
      )
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div className="overflow-auto flex gap-2 dark:bg-zinc-700">
      <button
        className={cn(
          'p-1 rounded-md transition-colors',
          selectedInlineStyle.includes('bold') ? 'dark:bg-zinc-900' : ''
        )}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <Bold className="w-5 h-5" />
      </button>
      <button
        className={cn(
          'p-1 rounded-md transition-colors',
          selectedInlineStyle.includes('italic') ? 'dark:bg-zinc-900' : ''
        )}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <Italic className="w-5 h-5" />
      </button>
      <button
        className={cn(
          'p-1 rounded-md transition-colors',
          selectedInlineStyle.includes('underline') ? 'dark:bg-zinc-900' : ''
        )}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <Underline className="w-5 h-5" />
      </button>
      <button
        className={cn(
          'p-1 rounded-md transition-colors',
          selectedInlineStyle.includes('strikethrough')
            ? 'dark:bg-zinc-900'
            : ''
        )}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }
      >
        <Strikethrough className="w-5 h-5" />
      </button>
      <Select defaultValue={'left-align'}>
        <SelectTrigger className="w-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="left-align"
            onMouseDown={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
            }}
          >
            <AlignLeft className="w-5 h-5" />
          </SelectItem>
          <SelectItem
            value="center-align"
            onMouseDown={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
            }}
          >
            <AlignCenter className="w-5 h-5" />
          </SelectItem>
          <SelectItem
            value="right-align"
            onMouseDown={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
            }}
          >
            <AlignRight className="w-5 h-5" />
          </SelectItem>
        </SelectContent>
      </Select>
      <ImageInputBody editor={editor} />
      <button
        onClick={insertLink}
        className={cn('p-1 rounded-md', isLink ? 'dark:bg-zinc-900' : '')}
      >
        <LinkIcon className="w-5 h-5" />
      </button>
      {isLink &&
        createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
      <button
        disabled={!canUndo}
        className={cn(!canUndo && 'dark:text-gray-500')}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, voidPayload);
        }}
      >
        <Undo className="w-5 h-5" />
      </button>
      <button
        disabled={!canRedo}
        className={cn(!canRedo && 'dark:text-gray-500')}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, voidPayload)}
      >
        <Redo className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toolbar;
