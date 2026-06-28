import { Link } from "react-router-dom";
import { LanguageSwitcher } from "@shared/components/LanguageSwitcher";

export function NavbarPublic() {
  return (
    <header className="safe-area-top no-print border-b border-gold/30 bg-navy">
      <div className="mx-auto flex min-h-[64px] max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="CredChain home">
          <img
            src="/logo-icon.svg"
            className="h-6 w-6 transition-transform group-hover:scale-110"
            alt=""
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
  );
}
