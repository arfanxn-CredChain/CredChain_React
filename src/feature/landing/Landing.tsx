import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useStore } from "@app/store";
import { Button } from "@ui/button";
import { SplitLayout } from "@shared/components/layout/SplitLayout";

interface AttestationStampProps {
  verified: string;
  theme?: "light" | "dark";
  size?: "full" | "mini";
  className?: string;
}

function AttestationStamp({ verified, theme = "light", size = "full", className }: AttestationStampProps) {
  const isMini = size === "mini";
  const isDark = theme === "dark";

  const ring1Opacity = isDark ? "0.5" : "0.4";
  const ring2Opacity = isDark ? "0.25" : "0.2";
  const medallionBg = isDark ? "bg-surface/[0.06]" : "bg-navy/[0.04]";
  const medallionBorder = isDark ? "border-gold/50" : "border-gold/30";
  const shieldColor = isDark ? "text-gold" : "text-navy";
  const hashColor = isDark ? "text-surface/60" : "text-navy/60";
  const stampColor = isDark ? "text-surface/40" : "text-gray-400";

  const containerSize = isMini ? "w-40" : "w-[340px] xl:w-[420px]";
  const innerMedallion = isMini ? "w-[96px] h-[96px]" : "w-[140px] h-[140px]";
  const shieldSize = isMini ? "h-16 w-16" : "h-24 w-24";

  return (
    <div
      className={`relative aspect-square ${containerSize} max-w-full mx-auto select-none flex-shrink-0 ${className ?? ""}`}
      aria-hidden="true"
    >
      {/* Rotating inscription ring */}
      <svg
        viewBox="0 0 340 340"
        className="absolute inset-0 w-full h-full animate-[spin_50s_linear_infinite] motion-reduce:animate-none"
      >
        <defs>
          <path
            id={`stamp-circle-${size}-${theme}`}
            d="M 170,170 m -148,0 a 148,148 0 1,1 296,0 a 148,148 0 1,1 -296,0"
          />
        </defs>
        {!isMini && (
          <text fill="#C9A227" style={{ fontSize: "11px", letterSpacing: "0.32em" }}>
            <textPath href={`#stamp-circle-${size}-${theme}`} startOffset="0%">
              CREDCHAIN · ATTESTED · ON-CHAIN · CREDCHAIN · ATTESTED · ON-CHAIN ·{" "}
            </textPath>
          </text>
        )}
      </svg>

      {/* Static rings + tick marks */}
      <svg viewBox="0 0 340 340" className="absolute inset-0 w-full h-full">
        <circle
          cx="170"
          cy="170"
          r="135"
          fill="none"
          stroke="#C9A227"
          strokeWidth={isMini ? "1.5" : "1"}
          opacity={ring1Opacity}
        />
        {!isMini && (
          <>
            <circle
              cx="170"
              cy="170"
              r="125"
              fill="none"
              stroke="#C9A227"
              strokeWidth="0.5"
              strokeDasharray="1 3"
              opacity={ring2Opacity}
            />
            <line x1="170" y1="22" x2="170" y2="34" stroke="#C9A227" strokeWidth="1.5" />
            <line x1="170" y1="306" x2="170" y2="318" stroke="#C9A227" strokeWidth="1.5" />
            <line x1="22" y1="170" x2="34" y2="170" stroke="#C9A227" strokeWidth="1.5" />
            <line x1="306" y1="170" x2="318" y2="170" stroke="#C9A227" strokeWidth="1.5" />
            <line x1="65" y1="65" x2="73" y2="73" stroke="#C9A227" strokeWidth="1" opacity="0.5" />
            <line x1="267" y1="65" x2="275" y2="73" stroke="#C9A227" strokeWidth="1" opacity="0.5" />
            <line x1="65" y1="267" x2="73" y2="275" stroke="#C9A227" strokeWidth="1" opacity="0.5" />
            <line x1="267" y1="267" x2="275" y2="275" stroke="#C9A227" strokeWidth="1" opacity="0.5" />
          </>
        )}
      </svg>

      {/* Center mark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2">
        <div className={`${innerMedallion} rounded-full ${medallionBg} border ${medallionBorder} flex items-center justify-center`}>
          <ShieldCheck className={`${shieldSize} ${shieldColor}`} strokeWidth={1.25} />
        </div>
        {!isMini && (
          <>
            <div className={`font-mono text-[10px] ${hashColor} tracking-wider`}>
              0x7099···79C8
            </div>
            <div className={`font-mono text-[9px] ${stampColor} uppercase tracking-[0.32em]`}>
              {verified} · 2026
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Landing() {
  const { t } = useTranslation();
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  const primaryHref = isAuthenticated ? "/dashboard" : "/login";
  const primaryLabel = isAuthenticated ? t("landing.cta.dashboard") : t("landing.cta.signIn");

  const desktopBrand = (
    <div className="flex flex-col items-center gap-8 text-center">
      <AttestationStamp
        verified={t("landing.stamp.verified")}
        theme="dark"
        size="full"
      />
      <span className="font-display text-5xl lg:text-6xl font-extrabold text-gold tracking-tight">
        CredChain
      </span>
    </div>
  );

  const mobileBrand = (
    <div className="text-center py-[2dvh] px-6 shadow-md rounded-b-3xl">
      <div className="mx-auto mb-[1dvh] w-fit max-w-[min(160px,18vh)]">
        <AttestationStamp
          verified={t("landing.stamp.verified")}
          theme="dark"
          size="mini"
        />
      </div>
      <h2 className="font-display text-3xl font-extrabold text-gold tracking-tight">
        CredChain
      </h2>
    </div>
  );

  return (
    <SplitLayout brandSlot={desktopBrand} mobileBrandSlot={mobileBrand}>
      <section
        aria-labelledby="landing-title"
        className="relative flex h-full w-full max-w-xl flex-col items-start justify-center py-[2dvh] lg:py-0 space-y-[1.5dvh] sm:space-y-[2dvh]"
      >
        <div className="flex items-center gap-3">
          <div className="h-px w-10 bg-gold shrink-0" aria-hidden="true" />
          <span className="text-[0.6875rem] font-mono uppercase tracking-[0.22em] text-gold">
            {t("landing.eyebrow")}
          </span>
        </div>

        <h1
          id="landing-title"
          className="font-display font-bold text-navy text-balance"
          style={{
            fontSize: "clamp(1.25rem, 5.5vw, 4rem)",
            lineHeight: "1.04",
            letterSpacing: "-0.02em",
          }}
        >
          {t("landing.title")}
        </h1>

        <p className="max-w-lg text-base sm:text-lg leading-relaxed text-gray-600 text-pretty">
          {t("landing.subtitle")}
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
          <Button asChild variant="gold" size="lg">
            <Link to={primaryHref} className="inline-flex items-center gap-2">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Link
            to="/about"
            className="text-sm font-semibold text-navy underline-offset-4 decoration-gold/40 decoration-2 hover:underline hover:text-gold transition-colors"
          >
            {t("landing.cta.about")}
            <span aria-hidden="true"> →</span>
          </Link>
          <Link
            to="/help"
            className="text-sm font-medium text-gray-400 hover:text-navy transition-colors"
          >
            {t("landing.cta.help")}
          </Link>
        </div>
      </section>
    </SplitLayout>
  );
}
