import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Header = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-xl font-bold">AccessCode IDE</span>
        </div>
        
        <nav className="flex items-center gap-4" aria-label="Main navigation">
          <Button
            variant="ghost"
            onClick={() => navigate("/docs")}
            className="hidden md:inline-flex"
          >
            {t('nav.docs')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/tutorials")}
            className="hidden md:inline-flex"
          >
            {t('nav.tutorials')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/roadmap")}
            className="hidden lg:inline-flex"
          >
            {t('nav.roadmap')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="hidden sm:inline-flex"
          >
            {t('nav.pricing')}
          </Button>
          <LanguageSwitcher />
          <Button onClick={() => navigate("/auth")}>
            {t('nav.getStarted')}
          </Button>
        </nav>
      </div>
    </header>
  );
};
