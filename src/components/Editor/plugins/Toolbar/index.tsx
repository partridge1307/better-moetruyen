import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
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
  UNDO_COMMAND,
} from 'lexical';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link as LinkIcon,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImageInputBody } from '../Image';
import { FloatingLinkEditor, getSelectedNode } from '../Link';

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
  const [linkInput, setLinkInput] = useState<string>('');
  const [isLinkDisabled, setIsLinkDisabled] = useState<boolean>(false);

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

      selection.getTextContent() === ''
        ? setIsLinkDisabled(true)
        : setIsLinkDisabled(false);

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

  const insertLink = useCallback(
    (link: string) => {
      if (!isLink) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, link);
      } else {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      }
    },
    [editor, isLink]
  );

  return (
    <div className="overflow-auto flex justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            title="Ctrl + B"
            className={cn(
              'p-1 rounded-md transition-colors',
              selectedInlineStyle.includes('bold') ? 'dark:bg-zinc-700' : ''
            )}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          >
            <Bold className="w-5 h-5" />
          </button>
          <button
            title="Ctrl + I"
            className={cn(
              'p-1 rounded-md transition-colors',
              selectedInlineStyle.includes('italic') ? 'dark:bg-zinc-700' : ''
            )}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
            }
          >
            <Italic className="w-5 h-5" />
          </button>
          <button
            title="Ctrl + U"
            className={cn(
              'p-1 rounded-md transition-colors',
              selectedInlineStyle.includes('underline')
                ? 'dark:bg-zinc-700'
                : ''
            )}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
            }
          >
            <Underline className="w-5 h-5" />
          </button>
          <button
            className={cn(
              'p-1 rounded-md transition-colors',
              selectedInlineStyle.includes('strikethrough')
                ? 'dark:bg-zinc-700'
                : ''
            )}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
            }
          >
            <Strikethrough className="w-5 h-5" />
          </button>
        </div>
        <Select defaultValue={'left-align'}>
          <SelectTrigger className="w-fit px-1 border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="left-align"
              className="cursor-pointer"
              onMouseDown={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
              }}
            >
              <AlignLeft className="w-5 h-5" />
            </SelectItem>
            <SelectItem
              value="center-align"
              className="cursor-pointer"
              onMouseDown={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
              }}
            >
              <AlignCenter className="w-5 h-5" />
            </SelectItem>
            <SelectItem
              value="right-align"
              className="cursor-pointer"
              onMouseDown={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
              }}
            >
              <AlignRight className="w-5 h-5" />
            </SelectItem>
          </SelectContent>
        </Select>
        <ImageInputBody editor={editor} />
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn('transition-opacity', isLinkDisabled && 'opacity-50')}
            disabled={isLinkDisabled}
          >
            <LinkIcon className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="flex items-center p-1 gap-2">
              <Input
                placeholder="Điền Link..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
              />
              <DropdownMenuItem
                disabled={linkInput === ''}
                onSelect={() => {
                  insertLink(linkInput);
                  setLinkInput('');
                }}
                className="dark:bg-white dark:text-black p-2"
              >
                Xong
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {isLink &&
          createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
      </div>

      <div className="flex items-center gap-2 pr-2">
        <button
          title="Ctrl + Z"
          disabled={!canUndo}
          className={cn('transition-opacity', !canUndo && 'opacity-50')}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, void +'');
          }}
        >
          <Undo className="w-5 h-5" />
        </button>
        <button
          disabled={!canRedo}
          className={cn('transition-opacity', !canRedo && 'opacity-50')}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, void +'')}
        >
          <Redo className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
