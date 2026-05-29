import { Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { DecorBlob } from "@shared/components/DecorBlob";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left - branding panel (lg+) */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-center items-center relative overflow-hidden">
        <DecorBlob tone="gold" position="top-right" size="xl" />
        <DecorBlob tone="blue" position="bottom-left" size="xl" />

        <div className="relative z-10 text-center px-12 max-w-md">
          <ShieldCheck
            className="w-24 h-24 text-gold mx-auto mb-8 drop-shadow-xl"
            aria-hidden="true"
          />
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-surface mb-4 tracking-tight text-balance">
            Welcome to CredChain
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed text-pretty">
            The next generation decentralized credential verification platform. Secure, private,
            and mathematically proven.
          </p>
        </div>
      </div>

      {/* Right - form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between lg:justify-center items-center bg-base relative">
        {/* Mobile header */}
        <div className="lg:hidden w-full bg-navy text-center py-10 px-6 shadow-md rounded-b-3xl safe-area-top">
          <ShieldCheck
            className="w-16 h-16 text-gold mx-auto mb-3 drop-shadow-md"
            aria-hidden="true"
          />
          <h2 className="font-display text-3xl font-extrabold text-surface tracking-tight">
            CredChain
          </h2>
          <p className="text-sm text-gray-400 mt-2">Decentralized credential platform</p>
        </div>

        <div className="w-full max-w-md px-4 sm:px-6 my-auto lg:my-0 mt-8 lg:mt-0">
          <div className="bg-surface rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
            <Outlet />
          </div>
          <p className="mt-8 mb-8 text-center text-sm text-gray-500 font-medium safe-area-bottom">
            Secured by Google Sign-In
          </p>
        </div>
      </div>
    </div>
  );
}
