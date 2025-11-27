import { supabase } from "@/integrations/supabase/client";

interface AnalyticsEvent {
  event_name: string;
  properties?: Record<string, any>;
}

export const trackEvent = async (event: AnalyticsEvent) => {
  try {
    // Non-blocking analytics call
    const { data: { user } } = await supabase.auth.getUser();
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event.event_name, event.properties);
    }

    // TODO: Implement server-side analytics endpoint
    // For now, we'll just track in usage table if user is authenticated
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      
      // Update usage record based on event type
      if (event.event_name === 'code_run') {
        await supabase.from('usage').upsert({
          user_id: user.id,
          date: today,
          code_runs: 1
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        });
      }
    }
  } catch (error) {
    // Silent fail for analytics
    console.error('Analytics error:', error);
  }
};

export const trackCtaClick = (ctaName: string) => {
  trackEvent({
    event_name: 'cta_click',
    properties: { cta_name: ctaName }
  });
};

export const trackLanguageSwitch = (fromLang: string, toLang: string) => {
  trackEvent({
    event_name: 'language_switch',
    properties: { from: fromLang, to: toLang }
  });
};

export const trackDemoRun = (language: string, duration: number) => {
  trackEvent({
    event_name: 'demo_run',
    properties: { language, duration }
  });
};

export const trackNewsletterSubscribe = (email: string) => {
  trackEvent({
    event_name: 'newsletter_subscribe',
    properties: { email_domain: email.split('@')[1] } // Only track domain for privacy
  });
};
