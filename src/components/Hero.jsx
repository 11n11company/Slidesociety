import React, { useState } from 'react';
import { ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Hero({ onBuildClick, onWatchSetupClick, onShowToast }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  const handlePrev = (e) => {
    e.stopPropagation();
    const next = (currentSlide - 1 + totalSlides) % totalSlides;
    setCurrentSlide(next);
    onShowToast?.(`P1-X Edition • Slide ${next + 1} of ${totalSlides}`);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const next = (currentSlide + 1) % totalSlides;
    setCurrentSlide(next);
    onShowToast?.(`P1-X Edition • Slide ${next + 1} of ${totalSlides}`);
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#080002] select-none border-b border-white/[0.08]"
      id="hero-section"
      aria-label="P1-X Racing Cockpit Hero"
    >
      {/* Full-Bleed Studio Backdrop - Expands 100% Edge-to-Edge to Both Sides */}
      <div className="absolute inset-0 z-0 overflow-hidden w-full h-full">
        <picture className="w-full h-full block">
          <source srcSet="/hero-backdrop-ultra-hd.webp?v=6" type="image/webp" />
          <img
            src="/hero-backdrop-ultra-hd.jpg?v=6"
            alt="P1-X Sim Racing Cockpit - Slidescoiety"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
            className="w-full h-full object-cover object-[12%_top] sm:object-cover sm:object-[center_12%] pointer-events-none"
          />
        </picture>
        {/* Subtle mobile readability gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080002]/95 via-[#080002]/50 to-transparent sm:hidden pointer-events-none" />
        {/* Bottom atmospheric vignette */}
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-[#070707] via-[#070707]/60 to-transparent pointer-events-none" />
      </div>

      {/* Responsive Content Container */}
      <div className="relative z-10 w-full max-w-[1920px] mx-auto h-[75vh] max-h-[580px] sm:h-[85vh] sm:max-h-[760px] lg:max-h-[840px] xl:max-h-[890px] min-h-[480px] sm:min-h-[520px] flex items-start pt-20 sm:pt-32 md:pt-36 lg:pt-40 xl:pt-44">

        {/* Crisp Vector Typography & Actions (Matching Mockup Coordinates) */}
        <div className="relative z-10 w-full px-5 sm:px-10 lg:px-14 xl:px-16 pointer-events-none">
          <div className="max-w-[260px] sm:max-w-lg lg:max-w-xl">
            {/* Kicker Eyebrow */}
            <p className="font-sans text-[10px] sm:text-xs font-semibold tracking-[0.24em] text-white/85 uppercase mb-1.5 sm:mb-2.5">
              BUILD / RACE / UPGRADE
            </p>

            {/* Main Title: P1-X (Bold Italic Sans) */}
            <h1 className="font-sans font-black italic tracking-tight text-white uppercase leading-[0.88] text-4xl sm:text-6xl md:text-7xl lg:text-[88px] xl:text-[96px] drop-shadow-xl mb-2 sm:mb-3">
              P1-X
            </h1>

            {/* Two-Line Subtitle */}
            <div className="font-sans font-bold text-white text-base sm:text-xl md:text-2xl lg:text-[26px] leading-[1.14] tracking-tight drop-shadow-md mb-5 sm:mb-7 lg:mb-8">
              <div>Build Your Own</div>
              <div>Sim Racing Cockpit</div>
            </div>

            {/* Interactive Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pointer-events-auto">
              {/* Primary White Button: Build Yours → */}
              <button
                type="button"
                onClick={onBuildClick}
                className="group shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 lg:px-7 py-2 sm:py-3 bg-white hover:bg-neutral-100 text-black font-sans font-bold text-xs sm:text-sm tracking-wide rounded-full shadow-xl shadow-black/50 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span>Build Yours</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </button>

              {/* Secondary Outline Glass Button: ▷ Watch Setup */}
              <button
                type="button"
                onClick={onWatchSetupClick}
                className="group shrink-0 inline-flex items-center gap-1 sm:gap-2 px-3.5 sm:px-6 lg:px-7 py-2 sm:py-3 bg-black/20 hover:bg-white/10 text-white font-sans font-semibold text-xs sm:text-sm tracking-wide rounded-full border border-white/50 hover:border-white/90 backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-transparent stroke-white" strokeWidth={2} />
                <span>Watch Setup</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom-Right Carousel Indicator Dots & Arrow Navigation */}
        <div className="absolute bottom-5 sm:bottom-10 lg:bottom-12 xl:bottom-14 right-4 sm:right-9 lg:right-14 z-20 flex flex-nowrap items-center gap-2 sm:gap-4 lg:gap-5">
          {/* Indicator Dots */}
          <div className="flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentSlide(idx);
                  onShowToast?.(`P1-X Edition • Slide ${idx + 1} of ${totalSlides}`);
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? 'w-5 sm:w-6 h-1.5 bg-white shadow-sm'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Previous / Next Arrow Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full border border-white/30 hover:border-white bg-black/25 hover:bg-white/10 backdrop-blur flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105 active:scale-90"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full border border-white/30 hover:border-white bg-black/25 hover:bg-white/10 backdrop-blur flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-105 active:scale-90"
              aria-label="Next slide"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
