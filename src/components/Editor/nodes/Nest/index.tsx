import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  Spread,
  createEditor,
} from 'lexical';
import NestComponent from './component';

export type SerializedNestNode = Spread<
  {
    content: SerializedEditor;
  },
  SerializedDecoratorBlockNode
>;

export class NestNode extends DecoratorBlockNode {
  __content: LexicalEditor;

  constructor(
    content: LexicalEditor,
    format?: ElementFormatType,
    key?: NodeKey
  ) {
    super(format, key);
    this.__content = content ?? createEditor();
  }

  static getType(): string {
    return 'nest';
  }

  static clone(node: NestNode): NestNode {
    return new NestNode(node.__content, node.__format, node.__key);
  }

  createDOM(): HTMLElement {
    return document.createElement('div');
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedNestNode): NestNode {
    const { content } = serializedNode;

    const nestedEditor = createEditor();
    const editorState = nestedEditor.parseEditorState(content.editorState);

    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }

    return new NestNode(nestedEditor);
  }

  exportJSON(): SerializedNestNode {
    return {
      ...super.exportJSON(),
      content: this.__content.toJSON(),
      type: 'nest',
      version: 1,
    };
  }

  getNest(): LexicalEditor {
    const self = this.getLatest();
    return self.__content;
  }

  setNest(content: LexicalEditor) {
    const self = this.getWritable();
    self.__content = content;
  }

  decorate(): JSX.Element {
    return <NestComponent content={this.__content} />;
  }
}

export function $isNestNode(node: LexicalNode): node is NestNode {
  return node instanceof NestNode;
}

export function $createNestNode(link?: string): NestNode {
  const editor = createEditor();

  if (link) {
    editor.update(
      () => {
        const root = $getRoot();
        if (root.getFirstChild() !== null) return;
        root.append($createParagraphNode().append($createTextNode('test')));
      },
      {
        discrete: true,
      }
    );
  }

  return new NestNode(editor);
}
