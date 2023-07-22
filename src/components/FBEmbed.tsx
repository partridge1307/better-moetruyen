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
      <div className="p-1">
        <p className="text-lg px-1">Facebook</p>
        <div className="relative w-full">
          <FacebookProvider lazy appId="1042446022855517">
            <Page height={300} href={facebookLink} tabs="timeline" />
          </FacebookProvider>
        </div>
      </div>
    </>
  );
};

export default memo(FBEmbed);
