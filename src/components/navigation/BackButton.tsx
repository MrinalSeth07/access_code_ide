import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRef } from "react";

interface BackButtonProps {
  fallbackPath?: string;
}

export const BackButton = ({ fallbackPath = "/editor" }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  };

  const handleBack = () => {
    announce("Going back to previous page");
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  const handleHome = () => {
    announce("Going to editor");
    navigate(fallbackPath);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label="Go back to previous page"
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go back</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleHome}
              aria-label="Go to editor home"
              className="h-9 w-9"
            >
              <Home className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go to editor</p>
          </TooltipContent>
        </Tooltip>

        {/* ARIA live region for announcements */}
        <div
          ref={announcementRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </div>
    </TooltipProvider>
  );
};
