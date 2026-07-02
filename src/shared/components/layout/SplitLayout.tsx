import type { ReactNode } from "react";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";
import { DecorBlob } from "@shared/components/DecorBlob";
import { useScrollToTop } from "@shared/hooks/useScrollToTop";

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
  useScrollToTop();
  return (
    <div className="relative flex h-dvh overflow-hidden bg-surface">
      {/* Desktop floating language switcher — light variant on light right panel */}
      <div className="absolute top-4 right-4 z-20 hidden lg:block">
        <LanguageSwitcher variant="light" />
      </div>

      {/* Desktop navy left panel */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-navy lg:flex lg:w-1/2">
        <DecorBlob tone="gold" position="top-right" size="md" />
        <DecorBlob tone="blue" position="bottom-left" size="xl" />
        <div className="relative z-10 flex w-full flex-col items-center px-4">{brandSlot}</div>
      </div>

      {/* Right panel (or below band on mobile) */}
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-base lg:w-1/2">
        {/* Mobile-only navy band */}
        <div className="safe-area-top relative flex h-[33dvh] w-full shrink-0 flex-col items-center justify-center overflow-hidden bg-navy text-surface lg:hidden">
          {/* Inline language switcher — same placement as PublicLayout header */}
          <div className="absolute top-4 right-4 z-20">
            <LanguageSwitcher variant="dark" />
          </div>
          <div className="relative z-10 flex h-full flex-col items-center justify-center">
            {mobileBrandSlot}
          </div>
        </div>

        {/* Content area — fills remaining viewport */}
        <div className="flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden">
          <div className="flex w-full flex-1 flex-col px-4 pt-4 pb-12 sm:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
