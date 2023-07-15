import { Input } from '@/components/ui/Input';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isAtNodeEnd } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  type GridSelection,
  type LexicalEditor,
  type NodeSelection,
  type RangeSelection,
} from 'lexical';
import { Check, Pencil, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const lowPriority = 1;

export function getSelectedNode(selection: RangeSelection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

function positionEditorElement(editor: any, rect: any) {
  if (rect === null) {
    editor.style.opacity = '0';
    editor.style.top = '-1000px';
    editor.style.left = '-1000px';
  } else {
    editor.style.opacity = '1';
    editor.style.top = `${rect.top + rect.height + window.scrollY + 10}px`;
    editor.style.left = `${
      rect.left + window.scrollX - editor.offsetWidth / 2 + rect.width / 2
    }px`;
  }
}

export function FloatingLinkEditor({
  editor,
}: {
  editor: LexicalEditor;
}): JSX.Element {
  const editorRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mouseDownRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [lastSelection, setLastSelection] = useState<
    RangeSelection | GridSelection | NodeSelection | null
  >(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl('');
      }
    }
    const editorElement = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElement === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      !nativeSelection?.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection?.anchorNode!)
    ) {
      const domRange = nativeSelection?.getRangeAt(0);
      let rect;
      if (nativeSelection?.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild != null) {
          // @ts-ignore
          inner = inner.firstElementChild;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange?.getBoundingClientRect();
      }

      if (!mouseDownRef.current) {
        positionEditorElement(editorElement, rect);
      }
      setLastSelection(selection);
    } else if (
      !activeElement ||
      activeElement.className !== 'moetruyen-link-input'
    ) {
      positionEditorElement(editorElement, null);
      setLastSelection(null);
      setIsEditMode(false);
      setLinkUrl('');
    }
    return true;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        lowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div ref={editorRef} className="moetruyen-link-editor">
      {isEditMode ? (
        <div className="relative">
          <Input
            ref={inputRef}
            className="moetruyen-link-input"
            value={linkUrl}
            onChange={(e) => {
              setLinkUrl(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (lastSelection !== null) {
                  if (linkUrl !== '') {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                  }
                  setIsEditMode(false);
                }
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsEditMode(false);
              }
            }}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
            <div
              onClick={() => {
                if (lastSelection !== null) {
                  if (linkUrl !== '') {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                  }
                  setIsEditMode(false);
                }
              }}
            >
              <Check className="w-5 h-5 cursor-pointer text-green-400" />
            </div>
            <div
              onClick={() => {
                setIsEditMode(false);
              }}
            >
              <X className="w-5 h-5 cursor-pointer text-red-500" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="moetruyen-link-input">
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              {linkUrl}
            </a>

            <Pencil
              role="button"
              tabIndex={0}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setIsEditMode(true);
              }}
              className="moetruyen-link-edit w-4 h-4 right-2 top-1/2 -translate-y-1/2"
            />
          </div>
        </>
      )}
    </div>
  );
}
