import { AutoLinkNode, LinkNode } from '@lexical/link';
import { OverflowNode } from '@lexical/overflow';
import { EmojiNode } from './nodes/Emoji';
import { ImageNode } from './nodes/Image';
import { YouTubeNode } from './nodes/Youtube';

export const nodes = [
  AutoLinkNode,
  LinkNode,
  ImageNode,
  EmojiNode,
  YouTubeNode,
  OverflowNode,
];
