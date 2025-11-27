import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Code2, Accessibility, Zap, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { supabase } from "@/integrations/supabase/client";
import { trackCtaClick, trackDemoRun } from "@/lib/analytics";

const defaultCode = `# Try editing and running this code!
name = input("Enter your name: ")
print(f"Hello, {name}! Welcome to AccessCode IDE.")
print("This IDE is built for accessibility.")`;

export const Hero = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [code, setCode] = useState(defaultCode);
  const [stdin, setStdin] = useState("World");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleRunDemo = async () => {
    const startTime = Date.now();
    setIsRunning(true);
    setOutput("Running...");

    try {
      const { data, error } = await supabase.functions.invoke('execute-code', {
        body: { code, language: 'python', stdin }
      });

      if (error) throw error;

      setOutput(data.output || "No output");
      const duration = Date.now() - startTime;
      trackDemoRun('python', duration);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleTryDemo = () => {
    trackCtaClick('try_demo');
    navigate("/auth");
  };

  const handleViewPricing = () => {
    trackCtaClick('view_pricing');
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="relative overflow-hidden py-20 px-4 md:py-32">
      <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-50"></div>
      
      <motion.div 
        className="container relative z-10 mx-auto max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-12">
          <motion.div 
            className="mb-8 flex justify-center gap-4"
            variants={itemVariants}
          >
            <div className="rounded-full bg-primary/10 p-3 shadow-[var(--shadow-primary)]">
              <Code2 className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <div className="rounded-full bg-secondary/10 p-3 shadow-md">
              <Accessibility className="h-8 w-8 text-secondary" aria-hidden="true" />
            </div>
            <div className="rounded-full bg-primary/10 p-3 shadow-[var(--shadow-primary)]">
              <Zap className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
          </motion.div>

          <motion.h1 
            className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
            variants={itemVariants}
          >
            {t('hero.title')}
            <span className="block text-primary mt-2">{t('hero.subtitle')}</span>
          </motion.h1>
          
          <motion.p 
            className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
            variants={itemVariants}
          >
            {t('hero.description')}
          </motion.p>
          
          <motion.div 
            className="flex flex-col gap-4 sm:flex-row sm:justify-center mb-12"
            variants={itemVariants}
          >
            <Button
              size="lg"
              onClick={handleTryDemo}
              className="shadow-[var(--shadow-primary)] hover:scale-105 transition-transform"
            >
              {t('hero.tryDemo')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleViewPricing}
            >
              {t('hero.viewPricing')}
            </Button>
          </motion.div>
        </div>

        {/* Interactive Code Demo */}
        <motion.div 
          className="max-w-4xl mx-auto mb-12"
          variants={itemVariants}
        >
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
            <div className="border-b border-border p-4 flex items-center justify-between bg-muted/30">
              <span className="text-sm font-semibold">Try It Now - Python Demo</span>
              <Button
                size="sm"
                onClick={handleRunDemo}
                disabled={isRunning}
                className="gap-2"
                aria-label={t('hero.runCode')}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                {t('hero.runCode')}
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 p-4">
              <div>
                <label className="text-sm font-semibold block mb-2">Code Editor</label>
                <div className="border border-border rounded-md overflow-hidden">
                  <Editor
                    height="200px"
                    language="python"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true
                    }}
                  />
                </div>
                <div className="mt-3">
                  <label htmlFor="demo-stdin" className="text-sm font-semibold block mb-2">
                    Input (stdin)
                  </label>
                  <input
                    id="demo-stdin"
                    type="text"
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                    placeholder="Enter input here"
                    aria-label="Program input"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold block mb-2">{t('hero.output')}</label>
                <div 
                  className="bg-background border border-border rounded-md p-3 font-mono text-sm h-[280px] overflow-auto"
                  role="log"
                  aria-live="polite"
                  aria-label="Code execution output"
                >
                  {output || "Click 'Run Code' to see output"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>{t('hero.screenReaderReady')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>{t('hero.multiLanguage')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>{t('hero.realTimeExecution')}</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
