import { ArrowLeft } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { useSmartBack } from "@shared/hooks/useSmartBack";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /**
   * When true, render the back icon button using `useSmartBack()` (browser
   * history if available, otherwise `/overview` for authed users or `/`
   * for unauthed users). Pass a function to override with custom behavior.
   * Omit (or pass `false`) to hide the back button entirely.
   */
  onBack?: (() => void) | true;
}

export function PageHeader({ title, description, action, onBack }: PageHeaderProps) {
  const handleSmartBack = useSmartBack();
  const handleBack = onBack === true ? handleSmartBack : onBack;

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        {handleBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Go back"
            className="h-8 w-8 shrink-0 rounded-full text-gray-400 hover:bg-white hover:text-navy sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}
