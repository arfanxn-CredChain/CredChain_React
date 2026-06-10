import { ArrowLeft } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { useSmartBack } from "@shared/hooks/useSmartBack";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /**
   * When true, render the back icon button using `useSmartBack()` (browser
   * history if available, otherwise `/dashboard` for authed users or `/`
   * for unauthed users). Pass a function to override with custom behavior.
   * Omit (or pass `false`) to hide the back button entirely.
   */
  onBack?: (() => void) | true;
}

export function PageHeader({ title, description, action, onBack }: PageHeaderProps) {
  const handleSmartBack = useSmartBack();
  const handleBack = onBack === true ? handleSmartBack : onBack;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        {handleBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Go back"
            className="h-8 w-8 shrink-0 sm:h-10 sm:w-10 text-gray-400 hover:text-navy hover:bg-white rounded-full"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        )}
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-navy tracking-tight">
            {title}
          </h2>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}
