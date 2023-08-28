import { AutoLinkNode, LinkNode } from '@lexical/link';
import { OverflowNode } from '@lexical/overflow';
import { ImageNode } from './nodes/Image';
import { YouTubeNode } from './nodes/Youtube';
import { SteamNode } from './nodes/Steam';

export const nodes = [
  AutoLinkNode,
  LinkNode,
  ImageNode,
  SteamNode,
  YouTubeNode,
  OverflowNode,
];
