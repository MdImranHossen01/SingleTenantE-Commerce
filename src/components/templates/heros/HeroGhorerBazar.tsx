/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useSettings } from '@/components/SettingsProvider';

interface Banner {
  _id?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
}

interface HeroGhorerBazarProps {
  banners: Banner[];
  onSlideChange?: (index: number) => void;
}

const AUTOPLAY_DELAY = 8000;

export default function HeroGhorerBazar({ banners, onSlideChange }: HeroGhorerBazarProps) {
  const settings = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides: Banner[] =
    banners && banners.length > 0
      ? banners
      : [
          {
            _id: 'default-1',
            title: settings?.brandName || 'Featured Collection',
            image: '/placeholder.png',
            link: '/shop',
          },
        ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: slides.length > 1,
      duration: 30,
    },
    [Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setActiveIndex(idx);
    onSlideChange?.(idx);
  }, [emblaApi, onSlideChange]);

  useEffect(() => {
    if (!emblaApi) return;
    const timeoutId = setTimeout(() => {
      onSelect();
    }, 0);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      clearTimeout(timeoutId);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Right-side promo banner (from promoBanners.right if configured, else 2nd banner or fallback)
  const rightPromo = (settings as any)?.promoBanners?.right;
  const sideBannerImage =
    rightPromo?.isActive !== false && rightPromo?.image
      ? rightPromo.image
      : slides.length > 1 && slides[1]?.image
      ? slides[1].image
      : slides[0]?.image || '/placeholder.png';
  const sideBannerLink =
    rightPromo?.isActive !== false && rightPromo?.image
      ? rightPromo.link || '/shop'
      : slides.length > 1
      ? slides[1]?.link || slides[1]?.primaryBtnLink || '/shop'
      : '/shop';
  const sideBannerAlt = rightPromo?.alt || 'Featured Offer';

  return (
    <section className="w-full bg-background py-3 md:py-5">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left 8 Columns: Main Slider (1000x400 aspect ratio on desktop) */}
          <div className="lg:col-span-8 relative group/gb-hero rounded-lg sm:rounded-xl overflow-hidden bg-muted aspect-[16/9] lg:aspect-[5/2]">
            <div className="h-full w-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full w-full">
                {slides.map((banner, index) => {
                  const href = banner.link || banner.primaryBtnLink || '/shop';
                  return (
                    <div
                      key={banner._id || index}
                      className="relative h-full w-full flex-[0_0_100%]"
                    >
                      <Link href={href} className="block relative w-full h-full">
                        <Image
                          src={banner.image || '/placeholder.png'}
                          alt={banner.title || `Banner ${index + 1}`}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 1024px) 100vw, 66vw"
                          className="object-cover"
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slider Prev/Next Square-Rounded Controls */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={scrollPrev}
                  aria-label="Previous slide"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-background/90 hover:bg-background text-primary shadow-md flex items-center justify-center transition-all opacity-90 hover:opacity-100 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  aria-label="Next slide"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-background/90 hover:bg-background text-primary shadow-md flex items-center justify-center transition-all opacity-90 hover:opacity-100 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Bottom-Left Pagination Dots */}
                <div className="absolute bottom-3 left-4 z-10 flex items-center gap-1.5">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => scrollTo(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      className={`rounded-full transition-all cursor-pointer ${
                        activeIndex === index
                          ? 'w-2.5 h-2.5 bg-primary'
                          : 'w-2 h-2 bg-background/80 hover:bg-background'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right 4 Columns: Side Promo Banner (Desktop only, matches slider height) */}
          <div className="hidden lg:block lg:col-span-4 relative rounded-xl overflow-hidden bg-muted">
            <Link href={sideBannerLink} className="block relative w-full h-full">
              <Image
                src={sideBannerImage}
                alt={sideBannerAlt}
                fill
                sizes="33vw"
                className="object-cover hover:scale-[1.02] transition-transform duration-500"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
