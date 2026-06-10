import { Outlet, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";
import { CopyrightFooter } from "@shared/components/CopyrightFooter";
import { useScrollToTop } from "@shared/hooks/useScrollToTop";

export function PublicLayout() {
  useScrollToTop();
  return (
    <div className="flex min-h-dvh flex-col bg-base text-navy">
      <header className="safe-area-top no-print border-b border-gold/30 bg-navy">
        <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5" aria-label="CredChain home">
            <ShieldCheck
              className="h-6 w-6 text-gold transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <span className="font-display text-xl leading-none font-bold tracking-tight text-gold">
              CredChain
            </span>
          </Link>
          <div className="flex items-center">
            <LanguageSwitcher variant="dark" />
          </div>
        </div>
      </header>

      <main id="main" className="flex w-full flex-1 flex-col px-4 pt-4 pb-12 sm:px-8">
        <Outlet />
      </main>

      <CopyrightFooter />
    </div>
  );
}
