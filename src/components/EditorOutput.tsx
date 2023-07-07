'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import CustomImage from './Renderer/CustomImage';
import CustomLink from './Renderer/CustomLink';
const Output = dynamic(() => import('editorjs-react-renderer'), {
  ssr: false,
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});

interface EditorOutputProps {
  content: any;
}

const renderers = {
  linktool: CustomLink,
  image: CustomImage,
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  // TODO: add show more
  // if (content.blocks.length >= 3) {
  //   return (
  //     <div className="relative">
  //       <Output data={content} renderers={renderers} />
  //       <div className="absolute w-full h-10 flex justify-center items-center cursor-pointer rounded-md bg-gradient-to-t dark:from-zinc-800 to-transparent">
  //         Xem thêm
  //       </div>
  //     </div>
  //   );
  // }

  return <Output data={content} renderers={renderers} />;
};

export default EditorOutput;
