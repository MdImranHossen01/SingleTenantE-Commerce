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

interface HeroFalakProps {
  banners: Banner[];
  onSlideChange?: (index: number) => void;
}

const AUTOPLAY_DELAY = 6000;

export default function HeroFalak({ banners, onSlideChange }: HeroFalakProps) {
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

  // Dual side promo cards (from settings.promoBanners if set, else fallback to banners)
  const leftPromo = (settings as any)?.promoBanners?.left;
  const rightPromo = (settings as any)?.promoBanners?.right;

  const topPromoImage =
    leftPromo?.isActive !== false && leftPromo?.image
      ? leftPromo.image
      : slides.length > 1 && slides[1]?.image
      ? slides[1].image
      : slides[0]?.image || '/placeholder.png';
  const topPromoLink =
    leftPromo?.isActive !== false && leftPromo?.image
      ? leftPromo.link || '/shop'
      : slides.length > 1
      ? slides[1]?.link || slides[1]?.primaryBtnLink || '/shop'
      : '/shop';
  const topPromoAlt = leftPromo?.alt || 'Featured Offer 1';

  const bottomPromoImage =
    rightPromo?.isActive !== false && rightPromo?.image
      ? rightPromo.image
      : slides.length > 2 && slides[2]?.image
      ? slides[2].image
      : slides[0]?.image || '/placeholder.png';
  const bottomPromoLink =
    rightPromo?.isActive !== false && rightPromo?.image
      ? rightPromo.link || '/shop'
      : slides.length > 2
      ? slides[2]?.link || slides[2]?.primaryBtnLink || '/shop'
      : '/shop';
  const bottomPromoAlt = rightPromo?.alt || 'Featured Offer 2';

  return (
    <section aria-label="Home hero promotions" className="w-full py-0">
      <div className="container mx-auto px-3 sm:px-4 mt-3 md:mt-4 lg:mt-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-stretch w-full">
          {/* Main Slider: Mobile 9:5 / md 5:2, Desktop 66.2% width + 5:2 aspect */}
          <div className="relative w-full lg:w-[66.2%] min-w-0 shrink-0 aspect-[9/5] md:aspect-[5/2] overflow-hidden rounded-2xl bg-muted">
            <div className="h-full w-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full w-full">
                {slides.map((banner, index) => {
                  const href = banner.link || banner.primaryBtnLink || '/shop';
                  return (
                    <div
                      key={banner._id || index}
                      className="relative h-full w-full flex-[0_0_100%]"
                    >
                      <Link href={href} className="block relative h-full w-full">
                        <Image
                          src={banner.image || '/placeholder.png'}
                          alt={banner.title || `Banner ${index + 1}`}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 1024px) 100vw, 66vw"
                          className="object-cover rounded-2xl"
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Circular Arrow Buttons */}
            {slides.length > 1 && (
              <>
                <div className="pointer-events-none absolute left-3 right-3 lg:left-6 lg:right-6 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between">
                  <button
                    type="button"
                    onClick={scrollPrev}
                    aria-label="Previous hero slide"
                    className="pointer-events-auto flex h-6 w-6 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-background text-primary shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={scrollNext}
                    aria-label="Next hero slide"
                    className="pointer-events-auto flex h-6 w-6 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-background text-primary shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
                  </button>
                </div>

                {/* Bottom-Center Expanding Pill Indicators */}
                <div className="pointer-events-none absolute bottom-3 lg:bottom-4 left-1/2 z-20 -translate-x-1/2">
                  <div className="flex h-1.5 lg:h-2 items-center justify-center gap-1 lg:gap-1.5">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`pointer-events-auto shrink-0 rounded-full transition-all duration-300 cursor-pointer ${
                          activeIndex === index
                            ? 'h-1.5 lg:h-2 w-6 lg:w-10 bg-primary'
                            : 'size-1.5 lg:size-2 bg-background/85 hover:bg-background'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile 2-Column Promo Row */}
          <div className="grid grid-cols-2 gap-4 w-full lg:hidden">
            <Link
              href={topPromoLink}
              className="relative aspect-[41/20] block overflow-hidden rounded-[8px] bg-muted w-full"
            >
              <Image
                src={topPromoImage}
                alt={topPromoAlt}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </Link>
            <Link
              href={bottomPromoLink}
              className="relative aspect-[41/20] block overflow-hidden rounded-[8px] bg-muted w-full"
            >
              <Image
                src={bottomPromoImage}
                alt={bottomPromoAlt}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </Link>
          </div>

          {/* Desktop Right Stacked Dual Promo Banners */}
          <div className="hidden lg:block flex-1 min-w-0 relative">
            <div className="absolute inset-0 flex flex-col gap-5">
              <Link
                href={topPromoLink}
                className="relative block min-h-0 w-full flex-1 overflow-hidden rounded-2xl bg-muted"
              >
                <Image
                  src={topPromoImage}
                  alt={topPromoAlt}
                  fill
                  sizes="33vw"
                  className="object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              </Link>
              <Link
                href={bottomPromoLink}
                className="relative block min-h-0 w-full flex-1 overflow-hidden rounded-2xl bg-muted"
              >
                <Image
                  src={bottomPromoImage}
                  alt={bottomPromoAlt}
                  fill
                  sizes="33vw"
                  className="object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
