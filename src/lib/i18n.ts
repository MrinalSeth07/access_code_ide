import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: {
          hero: {
            title: "Code Without Limits",
            subtitle: "Built for Everyone",
            description: "A powerful, accessible online IDE designed for visually impaired and dyslexic developers. Write, run, and hear your code with full screen reader support and text-to-speech.",
            tryDemo: "Try Demo",
            viewPricing: "View Pricing",
            runCode: "Run Code",
            output: "Output",
            screenReaderReady: "Screen Reader Ready",
            multiLanguage: "Multi-Language Support",
            realTimeExecution: "Real-Time Execution"
          },
          features: {
            title: "Built for Accessibility",
            description: "Every feature is designed with accessibility first, ensuring that developers of all abilities can code effectively.",
            screenReader: {
              title: "Screen Reader Optimized",
              description: "Full ARIA support and semantic HTML throughout the editor"
            },
            textToSpeech: {
              title: "Text-to-Speech Output",
              description: "Hear your code output and errors read aloud automatically"
            },
            voiceControl: {
              title: "Voice-Controlled Mode",
              description: "Navigate and code using voice commands for hands-free operation"
            },
            highContrast: {
              title: "High Contrast Themes",
              description: "Multiple dyslexia-friendly themes with adjustable contrast"
            },
            customizable: {
              title: "Fully Customizable",
              description: "Adjust font size, spacing, and colors to match your needs"
            },
            aiAssistant: {
              title: "AI Coding Assistant",
              description: "Get help with code explanations and debugging assistance"
            }
          },
          testimonials: {
            title: "Trusted by Developers",
            items: [
              {
                quote: "AccessCode IDE has transformed how I write code. The screen reader support is phenomenal.",
                author: "Alex Johnson",
                role: "Full-Stack Developer"
              },
              {
                quote: "Finally, an IDE that understands accessibility isn't an afterthought. Game changer for dyslexic developers.",
                author: "Maria Garcia",
                role: "Frontend Engineer"
              },
              {
                quote: "The voice control mode lets me code when my RSI flares up. Absolutely essential tool.",
                author: "Sam Chen",
                role: "Software Architect"
              }
            ],
            pause: "Pause testimonials",
            play: "Play testimonials",
            previous: "Previous testimonial",
            next: "Next testimonial"
          },
          newsletter: {
            title: "Stay Updated",
            description: "Get the latest features and accessibility updates delivered to your inbox.",
            emailPlaceholder: "Enter your email",
            subscribe: "Subscribe",
            success: "Successfully subscribed! Check your email for confirmation.",
            error: "Please enter a valid email address."
          },
          nav: {
            docs: "Docs",
            tutorials: "Tutorials",
            roadmap: "Roadmap",
            pricing: "Pricing",
            getStarted: "Get Started"
          }
        }
      },
      es: {
        common: {
          hero: {
            title: "Código Sin Límites",
            subtitle: "Construido para Todos",
            description: "Un IDE en línea potente y accesible diseñado para desarrolladores con discapacidad visual y dislexia. Escribe, ejecuta y escucha tu código con soporte completo de lector de pantalla y texto a voz.",
            tryDemo: "Probar Demo",
            viewPricing: "Ver Precios",
            runCode: "Ejecutar Código",
            output: "Salida",
            screenReaderReady: "Listo para Lector de Pantalla",
            multiLanguage: "Soporte Multiidioma",
            realTimeExecution: "Ejecución en Tiempo Real"
          },
          features: {
            title: "Construido para Accesibilidad",
            description: "Cada función está diseñada con accesibilidad primero, asegurando que desarrolladores de todas las habilidades puedan programar efectivamente.",
            screenReader: {
              title: "Optimizado para Lector de Pantalla",
              description: "Soporte completo ARIA y HTML semántico en todo el editor"
            },
            textToSpeech: {
              title: "Salida de Texto a Voz",
              description: "Escucha tu salida de código y errores leídos en voz alta automáticamente"
            },
            voiceControl: {
              title: "Modo Controlado por Voz",
              description: "Navega y programa usando comandos de voz para operación sin manos"
            },
            highContrast: {
              title: "Temas de Alto Contraste",
              description: "Múltiples temas amigables para dislexia con contraste ajustable"
            },
            customizable: {
              title: "Totalmente Personalizable",
              description: "Ajusta tamaño de fuente, espaciado y colores según tus necesidades"
            },
            aiAssistant: {
              title: "Asistente de Codificación IA",
              description: "Obtén ayuda con explicaciones de código y asistencia de depuración"
            }
          },
          testimonials: {
            title: "Confiado por Desarrolladores",
            items: [
              {
                quote: "AccessCode IDE ha transformado cómo escribo código. El soporte de lector de pantalla es fenomenal.",
                author: "Alex Johnson",
                role: "Desarrollador Full-Stack"
              },
              {
                quote: "Finalmente, un IDE que entiende que la accesibilidad no es una ocurrencia tardía. Revolucionario para desarrolladores disléxicos.",
                author: "Maria Garcia",
                role: "Ingeniera Frontend"
              },
              {
                quote: "El modo de control por voz me permite programar cuando mi RSI se agudiza. Herramienta absolutamente esencial.",
                author: "Sam Chen",
                role: "Arquitecto de Software"
              }
            ],
            pause: "Pausar testimonios",
            play: "Reproducir testimonios",
            previous: "Testimonio anterior",
            next: "Siguiente testimonio"
          },
          newsletter: {
            title: "Mantente Actualizado",
            description: "Recibe las últimas funciones y actualizaciones de accesibilidad en tu bandeja de entrada.",
            emailPlaceholder: "Ingresa tu correo electrónico",
            subscribe: "Suscribirse",
            success: "¡Suscripción exitosa! Revisa tu correo para confirmación.",
            error: "Por favor ingresa un correo electrónico válido."
          },
          nav: {
            docs: "Documentación",
            tutorials: "Tutoriales",
            roadmap: "Hoja de Ruta",
            pricing: "Precios",
            getStarted: "Comenzar"
          }
        }
      }
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
