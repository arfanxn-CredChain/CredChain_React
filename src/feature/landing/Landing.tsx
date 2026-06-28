import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useStore } from "@app/store";
import { Button } from "@ui/button";
import { cn } from "@shared/lib/cn";
import { SplitLayout } from "@shared/components/layout/SplitLayout";

interface AttestationStampProps {
  verified: string;
  theme?: "light" | "dark";
  size?: "full" | "mini";
  className?: string;
}

function AttestationStamp({
  verified,
  theme = "light",
  size = "full",
  className,
}: AttestationStampProps) {
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
      className={cn(
        "relative mx-auto aspect-square max-w-full shrink-0 select-none",
        containerSize,
        className,
      )}
      aria-hidden="true"
    >
      {/* Rotating inscription ring */}
      <svg
        viewBox="0 0 340 340"
        className="absolute inset-0 h-full w-full animate-[spin_50s_linear_infinite] motion-reduce:animate-none"
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
      <svg viewBox="0 0 340 340" className="absolute inset-0 h-full w-full">
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
            <line
              x1="267"
              y1="65"
              x2="275"
              y2="73"
              stroke="#C9A227"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="65"
              y1="267"
              x2="73"
              y2="275"
              stroke="#C9A227"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="267"
              y1="267"
              x2="275"
              y2="275"
              stroke="#C9A227"
              strokeWidth="1"
              opacity="0.5"
            />
          </>
        )}
      </svg>

      {/* Center mark */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div
          className={cn(
            innerMedallion,
            "flex items-center justify-center rounded-full border",
            medallionBg,
            medallionBorder,
          )}
        >
          <ShieldCheck className={cn(shieldSize, shieldColor)} strokeWidth={1.25} />
        </div>
        {!isMini && (
          <>
            <div className={cn("font-mono text-[10px] tracking-wider", hashColor)}>
              0x7099···79C8
            </div>
            <div className={cn("font-mono text-[9px] tracking-[0.32em] uppercase", stampColor)}>
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

  const primaryHref = isAuthenticated ? "/overview" : "/login";
  const primaryLabel = isAuthenticated ? t("landing.cta.overview") : t("landing.cta.signIn");

  const desktopBrand = (
    <div className="flex flex-col items-center gap-8 text-center">
      <AttestationStamp verified={t("landing.stamp.verified")} theme="dark" size="full" />
      <span className="font-display text-5xl font-extrabold tracking-tight text-gold lg:text-6xl">
        CredChain
      </span>
    </div>
  );

  const mobileBrand = (
    <div className="rounded-b-3xl px-6 py-[2dvh] text-center shadow-md">
      <div className="mx-auto mb-[1dvh] w-fit max-w-[min(160px,18vh)]">
        <AttestationStamp verified={t("landing.stamp.verified")} theme="dark" size="mini" />
      </div>
      <h2 className="font-display text-3xl font-extrabold tracking-tight text-gold">CredChain</h2>
    </div>
  );

  return (
    <SplitLayout brandSlot={desktopBrand} mobileBrandSlot={mobileBrand}>
      <section
        aria-labelledby="landing-title"
        className="relative flex h-full w-full flex-col justify-center space-y-[1.5dvh] py-[2dvh] sm:w-auto sm:self-center sm:max-w-[min(36rem,90vw)] sm:space-y-[2dvh] lg:py-0"
      >
        <div className="flex items-center gap-3">
          <div className="h-px w-10 shrink-0 bg-gold" aria-hidden="true" />
          <span className="font-mono text-[0.6875rem] tracking-[0.22em] text-gold uppercase">
            {t("landing.eyebrow")}
          </span>
        </div>

        <h1
          id="landing-title"
          className="font-display font-bold text-balance text-navy"
          style={{
            fontSize: "clamp(1.25rem, 5.5vw, 4rem)",
            lineHeight: "1.04",
            letterSpacing: "-0.02em",
          }}
        >
          {t("landing.title")}
        </h1>

        <p className="max-w-lg text-justify leading-relaxed text-pretty text-gray-600 sm:text-lg">
          {t("landing.subtitle")}
        </p>

        <div className="flex w-full flex-col gap-x-6 gap-y-3 pt-1 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild variant="gold" size="lg" className="w-full sm:w-auto">
            <Link to={primaryHref} className="inline-flex items-center justify-center gap-2">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:justify-start">
            <Link
              to="/credentials/verify"
              className="text-sm font-semibold text-navy decoration-gold/40 decoration-2 underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              {t("landing.cta.verify")}
            </Link>
            <Link
              to="/about"
              className="text-sm font-semibold text-navy decoration-gold/40 decoration-2 underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              {t("landing.cta.about")}
            </Link>
            <Link
              to="/help"
              className="text-sm font-semibold text-navy decoration-gold/40 decoration-2 underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              {t("landing.cta.help")}
            </Link>
          </div>
        </div>
      </section>
    </SplitLayout>
  );
}
