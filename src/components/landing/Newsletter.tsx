import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { trackNewsletterSubscribe } from "@/lib/analytics";
import { Mail } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("Invalid email address")
});

type EmailForm = z.infer<typeof emailSchema>;

export const Newsletter = () => {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema)
  });

  const onSubmit = async (data: EmailForm) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual newsletter API endpoint
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      trackNewsletterSubscribe(data.email);
      
      toast({
        title: t('newsletter.success'),
        duration: 5000,
      });
      
      reset();
    } catch (error) {
      toast({
        title: t('newsletter.error'),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-primary/5">
      <div className="container mx-auto max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Mail className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t('newsletter.title')}
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8">
          {t('newsletter.description')}
        </p>

        <form 
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          noValidate
        >
          <div className="flex-1">
            <Input
              {...register("email")}
              type="email"
              placeholder={t('newsletter.emailPlaceholder')}
              aria-label="Email address"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="w-full"
            />
            {errors.email && (
              <p 
                id="email-error" 
                className="text-destructive text-sm mt-1 text-left"
                role="alert"
              >
                {t('newsletter.error')}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="whitespace-nowrap"
          >
            {isSubmitting ? "..." : t('newsletter.subscribe')}
          </Button>
        </form>
      </div>
    </section>
  );
};
