import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { AlertCircle } from "lucide-react";

interface ErrorTooltipProps {
  errors: string[];
}

export function ErrorTooltip({ errors }: ErrorTooltipProps) {
  if (!errors.length) return null;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-pointer text-red-600">
            <AlertCircle className="h-4 w-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-white text-red-700 border border-red-200 shadow-lg p-2 rounded text-xs">
          <ul className="list-disc pl-4">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
