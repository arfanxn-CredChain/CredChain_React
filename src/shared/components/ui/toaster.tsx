import { Toaster as Sonner } from "sonner";
import { useTheme } from "@app/ThemeProvider";

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      position="top-right"
      theme={resolvedTheme}
      richColors={false}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-surface text-navy border border-gray-100 shadow-xl shadow-gray-200/50 rounded-2xl",
          title: "font-bold text-sm",
          description: "text-gray-500 text-sm",
          actionButton: "bg-navy text-surface rounded-xl px-3 py-1 text-xs font-bold",
          cancelButton: "bg-gray-100 text-gray-600 rounded-xl px-3 py-1 text-xs font-bold",
          success: "border-l-4 border-l-success",
          error: "border-l-4 border-l-error",
          warning: "border-l-4 border-l-warning",
          info: "border-l-4 border-l-info",
        },
      }}
    />
  );
}
