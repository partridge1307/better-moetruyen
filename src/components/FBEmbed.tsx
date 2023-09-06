'use client';

import '@/styles/facebook.css';
import { FC, memo } from 'react';
import { FacebookProvider, Page } from 'react-facebook';

interface FBEmbedProps {
  facebookLink: string;
}

const FBEmbed: FC<FBEmbedProps> = ({ facebookLink }) => {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-lg px-1">Facebook</h1>
        <div className="relative w-full">
          <FacebookProvider language="vi" lazy appId="1042446022855517">
            <Page
              lazy
              height={300}
              href={facebookLink}
              tabs="timeline"
              adaptContainerWidth
            />
          </FacebookProvider>
        </div>
      </div>
    </>
  );
};

export default memo(FBEmbed);
