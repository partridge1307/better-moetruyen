'use client';

import dynamic from 'next/dynamic';
import { FC } from 'react';
import CustomImage from './CustomImage';
import CustomLink from './CustomLink';

const Output = dynamic(
  async () => (await import('editorjs-react-renderer')).default,
  {
    ssr: false,
  }
);

const renderers = {
  linktool: CustomLink,
  image: CustomImage,
};

interface EditorJSOutputProps {
  data: any;
}

const EditorJSOutput: FC<EditorJSOutputProps> = ({ data }) => {
  return <Output data={data} renderers={renderers} />;
};

export default EditorJSOutput;
