import { Outlet, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";
import { useScrollToTop } from "@shared/hooks/useScrollToTop";

export function PublicLayout() {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-base text-navy flex flex-col">
      <header className="bg-navy border-b border-gold/30 safe-area-top no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[64px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="CredChain home">
            <ShieldCheck
              className="h-6 w-6 text-gold transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <span className="font-display text-xl font-bold text-gold tracking-tight leading-none">
              CredChain
            </span>
          </Link>
          <div className="flex items-center">
            <LanguageSwitcher variant="dark" />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1 w-full flex flex-col px-4 pt-4 pb-12 sm:px-8">
        <Outlet />
      </main>

      <footer className="bg-surface py-3 text-center text-[0.6875rem] font-mono uppercase tracking-[0.18em] text-gray-400 mt-auto safe-area-bottom no-print">
        <span>{new Date().getFullYear()}</span> · CredChain · All rights reserved
      </footer>
    </div>
  );
}
