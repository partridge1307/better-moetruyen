import { AutoLinkNode, LinkNode } from '@lexical/link';
import { OverflowNode } from '@lexical/overflow';
import { ImageNode } from './nodes/Image';
import { YouTubeNode } from './nodes/Youtube';
import { SteamNode } from './nodes/Steam';
import { MentionNode } from './nodes/Mention';

export const nodes = [
  AutoLinkNode,
  LinkNode,
  MentionNode,
  ImageNode,
  SteamNode,
  YouTubeNode,
  OverflowNode,
];
