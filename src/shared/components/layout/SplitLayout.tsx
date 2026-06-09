import type { ReactNode } from "react";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";
import { DecorBlob } from "@shared/components/DecorBlob";

interface SplitLayoutProps {
  /** Desktop navy left panel content (>= lg breakpoint) */
  brandSlot: ReactNode;
  /** Mobile top navy band content (< lg breakpoint) */
  mobileBrandSlot: ReactNode;
  /** Right panel content on desktop, below the navy band on mobile */
  children: ReactNode;
}

/**
 * Split-screen layout shared by Landing and Login.
 *
 * Desktop (>= lg): 50/50 horizontal split — navy brand panel left, light content right.
 * Mobile (< lg):   stacked vertically — navy brand band on top, light content below.
 *
 * On desktop, the language switcher floats top-right over the light content.
 * On mobile, it lives inside the navy band's top-right corner (matches PublicLayout).
 */
export function SplitLayout({ brandSlot, mobileBrandSlot, children }: SplitLayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex relative">
      {/* Desktop floating language switcher — light variant on light right panel */}
      <div className="hidden lg:block absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="light" />
      </div>

      {/* Desktop navy left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-center items-center relative overflow-hidden">
        <DecorBlob tone="gold" position="top-right" size="xl" />
        <DecorBlob tone="blue" position="bottom-left" size="xl" />
        <div className="relative z-10 flex flex-col items-center px-4 w-full">
          {brandSlot}
        </div>
      </div>

      {/* Right panel (or below band on mobile) */}
      <div className="w-full lg:w-1/2 flex flex-col bg-base relative min-h-screen">
        {/* Mobile-only navy band */}
        <div className="lg:hidden w-full bg-navy text-surface relative overflow-hidden safe-area-top">
          <DecorBlob tone="gold" position="top-right" size="md" />
          {/* Inline language switcher — same placement as PublicLayout header */}
          <div className="absolute top-4 right-4 z-20">
            <LanguageSwitcher variant="dark" />
          </div>
          <div className="relative z-10">{mobileBrandSlot}</div>
        </div>

        {/* Content area — fills remaining viewport, centers content */}
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
