import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { DecorBlob } from "@shared/components/DecorBlob";
import { Button } from "@ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4 relative overflow-hidden">
      <DecorBlob tone="navy" position="top-right" size="xl" />
      <DecorBlob tone="gold" position="bottom-left" size="lg" />

      <div className="relative z-10 text-center max-w-md">
        <div className="inline-flex items-center justify-center p-4 bg-navy rounded-2xl mb-6 shadow-lg shadow-navy/20">
          <ShieldAlert className="h-12 w-12 text-gold" aria-hidden="true" />
        </div>

        <p className="font-mono text-sm font-bold text-gold uppercase tracking-widest mb-3">
          404
        </p>

        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-navy tracking-tight mb-4 text-balance">
          Page not found
        </h1>

        <p className="text-gray-500 text-lg mb-8 text-pretty">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="primary" size="lg">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
