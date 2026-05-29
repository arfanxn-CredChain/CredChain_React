import { ArrowLeft } from "lucide-react";
import { Button } from "@shared/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  onBack?: () => void;
}

export function PageHeader({ title, description, action, onBack }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Go back"
            className="text-gray-400 hover:text-navy hover:bg-white rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
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
