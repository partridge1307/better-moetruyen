import '@/styles/facebook.css';
import { Loader2 } from 'lucide-react';
import Script from 'next/script';
import { FC, memo } from 'react';

interface FBEmbedProps {
  facebookLink: string;
}

const FBEmbed: FC<FBEmbedProps> = ({ facebookLink }) => {
  return (
    <>
      <div className="p-1">
        <p className="text-lg px-1">Facebook</p>
        <div className="relative w-full">
          <div
            className="fb-page"
            data-lazy="true"
            data-href={facebookLink}
            data-tabs="timeline"
            data-height="300"
            data-small-header="false"
            data-adapt-container-width="true"
            data-hide-cover="false"
            data-show-facepile="true"
          >
            <blockquote cite={facebookLink} className="fb-xfbml-parse-ignore">
              <a href={facebookLink} target="_blank">
                <Loader2 className="w-6 h-6 animate-spin" />
              </a>
            </blockquote>
          </div>
        </div>
      </div>

      <Script
        strategy="lazyOnload"
        async
        defer
        crossOrigin="anonymous"
        src="https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v17.0"
      />
    </>
  );
};

export default memo(FBEmbed);
