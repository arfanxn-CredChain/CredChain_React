import { Outlet } from "react-router-dom";
import { CopyrightFooter } from "@shared/components/CopyrightFooter";
import { useScrollToTop } from "@shared/hooks/useScrollToTop";
import { NavbarPublic } from "./NavbarPublic";

export function PublicLayout() {
  useScrollToTop();
  return (
    <div className="flex min-h-dvh flex-col bg-base text-navy">
      <NavbarPublic />

      <main id="main" className="flex w-full flex-1 flex-col px-4 pt-4 pb-12 sm:px-8">
        <Outlet />
      </main>

      <CopyrightFooter />
    </div>
  );
}
