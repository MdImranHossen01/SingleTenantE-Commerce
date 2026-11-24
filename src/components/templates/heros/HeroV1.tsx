/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useLanguage } from '@/contexts/LanguageContext';

interface Banner {
  _id?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
}

interface HeroSliderProps {
  banners: Banner[];
  layout?: string;
  onSlideChange?: (index: number) => void;
}

const AUTOPLAY_DELAY = 5500;

export default function HeroV1({ banners, layout, onSlideChange }: HeroSliderProps) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = banners && banners.length > 0 ? banners : null;

  // Initialize Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 30, // Smooth transition
    },
    [Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false })]
  );

  // Handle slide change to update active index for Framer Motion animations
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setActiveIndex(idx);
    onSlideChange?.(idx);
  }, [emblaApi, onSlideChange]);

  useEffect(() => {
    if (!emblaApi) return;
    
    // Defer the initial selection update to avoid synchronous setState during render/effect phase
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

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Fallback if no banners
  if (!slides) {
    return (
      <div className={`relative w-full aspect-[21/9] md:max-h-[calc(100vh-10rem)] ${layout === 'v3' ? 'lg:rounded-sm' : ''} flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800`}>
        <div className="text-center px-6 max-w-2xl relative z-10">
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white mb-3 md:mb-4 leading-tight">
            Quality Products,<br />Unbeatable Prices
          </h1>
          <p className="text-[11px] sm:text-sm md:text-base text-slate-300 mb-4 md:mb-6">
            Discover groceries, electronics, and fashion tailored for your needs.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 md:gap-3">
            <Link
              href="/shop"
              className="px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition shadow-lg text-[10px] sm:text-xs md:text-sm flex items-center gap-1.5 group"
            >
              Shop Now <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/categories"
              className="px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 bg-white/10 text-white font-bold rounded-full border border-white/30 hover:bg-white/20 transition text-[10px] sm:text-xs md:text-sm"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={`relative w-full aspect-[21/9] md:max-h-[calc(100vh-10rem)] ${layout === 'v3' ? 'lg:rounded-xl' : ''} overflow-hidden bg-transparent group/slider text-white`}>
      {/* Embla Viewport */}
      <div className="h-full w-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full w-full">
          {slides.map((banner, index) => {
            const primaryHref = banner.primaryBtnLink || banner.link || '/shop';
            const primaryText = banner.primaryBtnText || (t('store.hero.shop_now') as string) || 'Shop Now';
            const secondaryHref = banner.secondaryBtnLink || '/categories';
            const secondaryText = banner.secondaryBtnText;
            const isActive = index === activeIndex;

            return (
              <div key={banner._id || index} className="relative flex-[0_0_100%] min-w-0 h-full overflow-hidden">
                {/* Ken Burns zooming background */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={banner.image || '/placeholder-banner.jpg'}
                    alt={banner.title || 'Hero Banner'}
                    fill
                    className={`object-cover object-center transition-transform duration-[8000ms] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : undefined}
                    sizes="100vw"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

                {/* Content */}
                <div className={`absolute inset-0 flex items-end pb-5 sm:pb-12 md:pb-14 ${layout === 'v3' ? 'lg:pb-12' : 'lg:pb-16'} z-20 px-4 sm:px-10 md:px-16 ${layout === 'v3' ? 'lg:px-14' : 'lg:px-24'}`}>
                  <div className="w-full max-w-[85%] sm:max-w-[60%] lg:max-w-[48%] flex flex-col items-start text-left">
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                            className={`text-sm sm:text-2xl md:text-3xl ${layout === 'v3' ? 'lg:text-3xl' : 'lg:text-4xl xl:text-5xl'} font-black text-white leading-[1.15] tracking-tight drop-shadow-2xl ${banner.subtitle ? 'mb-1.5 sm:mb-3 md:mb-4' : 'mb-2.5 sm:mb-4 md:mb-5'}`}
                          >
                            {banner.title}
                          </motion.h1>


                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                            className="flex flex-wrap items-center gap-1.5 sm:gap-3"
                          >
                            <Link
                              href={primaryHref}
                              className={`flex items-center gap-1.5 px-3 py-1 sm:px-5 sm:py-2 md:px-6 md:py-2.5 ${layout === 'v3' ? 'lg:px-5 lg:py-2 lg:text-xs' : ''} bg-primary text-white font-bold rounded-full hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all text-[9px] sm:text-xs md:text-sm shadow-2xl`}
                            >
                              <span>{primaryText}</span>
                              <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                            </Link>

                            {secondaryText && (
                              <Link
                                href={secondaryHref}
                                className={`px-3 py-1 sm:px-5 sm:py-2 md:px-6 md:py-2.5 ${layout === 'v3' ? 'lg:px-5 lg:py-2 lg:text-xs' : ''} bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 hover:border-white/40 transition-all text-[9px] sm:text-xs md:text-sm shadow-sm`}
                              >
                                {secondaryText}
                              </Link>
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Custom Navigation ────────────────────────────────── */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white opacity-0 group-hover/slider:opacity-100 hover:bg-primary hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer animate-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white opacity-0 group-hover/slider:opacity-100 hover:bg-primary hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer animate-none"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          {/* Custom Pagination Container */}
          {layout !== 'v3' && (
            <div className="absolute bottom-2 sm:bottom-5 left-0 w-full z-30 hidden sm:flex justify-center px-4 sm:px-10">
              <div className="flex items-center gap-1 sm:gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className="transition-all duration-300 cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <span
                      className={`transition-all duration-300 rounded-full h-1.5 sm:h-2 ${index === activeIndex
                        ? "w-4 sm:w-8 bg-primary"
                        : "w-1.5 sm:w-2 bg-white/30"
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] sm:h-[3px] z-40 bg-white/5">
            <motion.div
              key={activeIndex}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: AUTOPLAY_DELAY / 1000, ease: "linear" }}
              className="h-full bg-primary"
            />
          </div>
        </>
      )}
    </section>
  );
}

