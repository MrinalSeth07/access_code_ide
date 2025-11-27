import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accessibility, 
  Volume2, 
  Keyboard, 
  Eye, 
  Languages, 
  Save 
} from "lucide-react";

export const Features = () => {
  const { t } = useTranslation('common');
  
  const features = [
    {
      icon: Accessibility,
      title: t('features.screenReader.title'),
      description: t('features.screenReader.description'),
    },
    {
      icon: Volume2,
      title: t('features.textToSpeech.title'),
      description: t('features.textToSpeech.description'),
    },
    {
      icon: Keyboard,
      title: t('features.voiceControl.title'),
      description: t('features.voiceControl.description'),
    },
    {
      icon: Eye,
      title: t('features.highContrast.title'),
      description: t('features.highContrast.description'),
    },
    {
      icon: Languages,
      title: t('features.customizable.title'),
      description: t('features.customizable.description'),
    },
    {
      icon: Save,
      title: t('features.aiAssistant.title'),
      description: t('features.aiAssistant.description'),
    },
  ];

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="features" className="py-20 px-4 bg-card/50">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4 md:text-4xl">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('features.description')}
          </p>
        </motion.div>

        <motion.div 
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.currentTarget.querySelector('a')?.click();
                }
              }}
            >
              <Card className="h-full shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-primary)] transition-shadow duration-300 cursor-pointer">
                <CardHeader>
                  <div className="mb-4 rounded-lg bg-primary/10 p-3 w-fit">
                    <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
