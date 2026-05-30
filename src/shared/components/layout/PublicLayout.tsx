import { Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-base text-navy flex flex-col">
      <header className="bg-navy shadow-sm border-b-2 border-gold py-4 safe-area-top no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-gold" aria-hidden="true" />
            <span className="font-display text-xl font-bold text-surface tracking-tight">
              CredChain
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="dark" />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-surface py-6 text-center text-sm text-gray-500 shadow-inner mt-auto safe-area-bottom no-print">
        <span className="font-mono">{new Date().getFullYear()}</span> CredChain. All rights
        reserved.
      </footer>
    </div>
  );
}
