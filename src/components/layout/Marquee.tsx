'use client';

import FastMarquee from 'react-fast-marquee';
import { useSettings } from '@/components/SettingsProvider';

export function Marquee({ marqueeText: initialText }: { marqueeText?: string }) {
  const settings = useSettings();
  const defaultText = `Welcome to ${settings?.brandName || process.env.NEXT_PUBLIC_STORE_NAME || 'Store'}! Free shipping on orders over ৳500.`;
  const marqueeText = initialText || settings?.marqueeText || defaultText;

  if (!marqueeText) return null;

  return (
    <div className="bg-primary text-white py-2 overflow-hidden flex items-center font-semibold">
      <FastMarquee
        gradient={false}
        speed={50}
        pauseOnHover={true}
      >
        <span className="mx-10 font-medium uppercase tracking-wider text-xs sm:text-sm flex items-center">
          {marqueeText}
        </span>
        <span className="mx-10 font-medium uppercase tracking-wider text-xs sm:text-sm flex items-center border-l border-white/25 pl-10">
          {marqueeText}
        </span>
        <span className="mx-10 font-medium uppercase tracking-wider text-xs sm:text-sm flex items-center border-l border-white/25 pl-10">
          {marqueeText}
        </span>
        <span className="mx-10 font-medium uppercase tracking-wider text-xs sm:text-sm flex items-center border-l border-white/25 pl-10">
          {marqueeText}
        </span>
      </FastMarquee>
    </div>
  );
}

