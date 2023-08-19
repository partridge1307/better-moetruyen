'use client';

import dynamic from 'next/dynamic';
import { FC } from 'react';
import CustomImage from './Renderer/CustomImage';
import CustomLink from './Renderer/CustomLink';
const Output = dynamic(
  async () => (await import('editorjs-react-renderer')).default,
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse dark:bg-zinc-700" />,
  }
);

const renderers = {
  linktool: CustomLink,
  image: CustomImage,
};

interface EditorOutputProps {
  data: any;
}

const EditorOutput: FC<EditorOutputProps> = ({ data }) => {
  return (
    <div className="relative max-h-72 p-2 rounded-md overflow-auto dark:bg-zinc-700 md:scrollbar md:dark:scrollbar--dark">
      <Output data={data} renderers={renderers} />
    </div>
  );
};

export default EditorOutput;

// {showMore ? (
//   <div
//     role="button"
//     onClick={() => setIsCollapsed((prev) => !prev)}
//     className="absolute inset-x-0 bottom-0 bg-gradient-to-t dark:from-zinc-900 rounded-md flex items-center justify-center"
//   >
//     {isCollapsed ? (
//       <>
//         <ChevronsDown className="w-4 h-4" />
//         Xem thêm
//         <ChevronsDown className="w-4 h-4" />
//       </>
//     ) : (
//       <>
//         <ChevronsUp className="w-4 h-4" />
//         Thu gọn
//         <ChevronsUp className="w-4 h-4" />
//       </>
//     )}
//   </div>
// ) : null}
