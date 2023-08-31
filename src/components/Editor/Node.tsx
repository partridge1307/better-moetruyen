import { AutoLinkNode, LinkNode } from '@lexical/link';
import { OverflowNode } from '@lexical/overflow';
import { ImageNode } from './nodes/Image';
import { YouTubeNode } from './nodes/Youtube';
import { SteamNode } from './nodes/Steam';
import { MentionNode } from './nodes/Mention';
import { ListItemNode, ListNode } from '@lexical/list';
import { QuoteNode } from '@lexical/rich-text';

export const nodes = [
  AutoLinkNode,
  LinkNode,
  ListNode,
  ListItemNode,
  MentionNode,
  QuoteNode,
  ImageNode,
  SteamNode,
  YouTubeNode,
  OverflowNode,
];
