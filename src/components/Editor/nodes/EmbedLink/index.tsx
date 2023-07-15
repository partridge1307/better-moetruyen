import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';
import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical';
import Image from 'next/image';

export type SerializedEmbedLink = Spread<
  {
    link: string;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
  },
  SerializedDecoratorBlockNode
>;

type EmbedLinkComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  link: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
}>;

function convertEmbedLink(domNode: HTMLElement): null | DOMConversionOutput {
  const link = domNode.getAttribute('data-lexical-src');
  const title = domNode.getAttribute('data-lexical-embedLink-title');
  const description = domNode.getAttribute(
    'data-lexical-embedLink-description'
  );
  const imageUrl = domNode.getAttribute('data-lexical-embedLink-image');
  if (link) {
    const node = $createEmbedLinkNode({
      link: link,
      title,
      description,
      imageUrl,
    });
    return { node };
  }
  return null;
}

function EmbedLinkComponent({
  className,
  format,
  nodeKey,
  link,
  title,
  description,
  imageUrl,
}: EmbedLinkComponentProps): JSX.Element {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <a href={link} target="_blank" className="text-blue-400">
        {link}
      </a>
      <a
        href={link}
        className="flex gap-4"
        target="_blank"
        title={title ? title : 'Embed Link'}
      >
        {imageUrl && (
          <Image
            width={50}
            height={50}
            src={imageUrl}
            alt="Image"
            className="rounded-md"
          />
        )}
        <div>
          {title && <p>{title}</p>}
          {description && <p>{description}</p>}
        </div>
      </a>
    </BlockWithAlignableContents>
  );
}

export class EmbedLinkNode extends DecoratorBlockNode {
  __link: string;
  __title: string | null;
  __description: string | null;
  __imageUrl: string | null;

  constructor(
    link: string,
    title: string | null,
    description: string | null,
    imageUrl: string | null,
    format?: ElementFormatType,
    key?: NodeKey
  ) {
    super(format, key);
    this.__link = link;
    this.__title = title;
    this.__description = description;
    this.__imageUrl = imageUrl;
  }

  static getType(): string {
    return 'embedLink';
  }

  static clone(node: EmbedLinkNode): EmbedLinkNode {
    return new EmbedLinkNode(
      node.__link,
      node.__title,
      node.__description,
      node.__imageUrl,
      node.__format,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedEmbedLink): EmbedLinkNode {
    const node = $createEmbedLinkNode({
      link: serializedNode.link,
      title: serializedNode.title,
      description: serializedNode.description,
      imageUrl: serializedNode.imageUrl,
    });
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedEmbedLink {
    return {
      ...super.exportJSON(),
      type: 'embedLink',
      version: 1,
      link: this.__link,
      title: this.__title,
      description: this.__description,
      imageUrl: this.__imageUrl,
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('a');
    this.__title
      ? element.setAttribute('data-lexical-embedLink-title', this.__title)
      : null;
    this.__description
      ? element.setAttribute(
          'data-lexical-embedLink-description',
          this.__description
        )
      : null;
    this.__imageUrl
      ? element.setAttribute('data-lexical-embedLink-image', this.__imageUrl)
      : null;
    element.setAttribute('src', this.__link);
    element.setAttribute('title', this.__title ? this.__title : 'Embed Link');

    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-embedLink')) {
          return null;
        }
        return {
          conversion: convertEmbedLink,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getLink(): string {
    return this.__link;
  }

  getTextContent(): string {
    return `${this.__link}`;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };

    return (
      <EmbedLinkComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        link={this.__link}
        title={this.__title}
        description={this.__description}
        imageUrl={this.__imageUrl}
      />
    );
  }
}

export function $isEmbedLinkNode(
  node: EmbedLinkNode | LexicalNode | null | undefined
): node is EmbedLinkNode {
  return node instanceof EmbedLinkNode;
}

export function $createEmbedLinkNode({
  link,
  title,
  description,
  imageUrl,
}: {
  link: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
}): EmbedLinkNode {
  return new EmbedLinkNode(link, title, description, imageUrl);
}
