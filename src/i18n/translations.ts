export const supportedLanguages = ["en", "hi", "es"] as const;

export type LanguageCode = (typeof supportedLanguages)[number];
export type TranslationKey = keyof typeof translations.en;

export const languageNames: Record<LanguageCode, string> = {
  en: "English",
  hi: "हिन्दी",
  es: "Español",
};

const en = {
  home: "Home",
  pulse: "Pulse",
  briefs: "Briefs",
  connect: "Connect",
  loading: "Getting things ready...",
  loginTitle: "A better workday break.",
  loginText: "Sign in with your Google account to join your workplace community.",
  continueGoogle: "Continue with Google",
  greeting: "Good to see you,",
  account: "Account",
  signOut: "Sign out",
  available: "AVAILABLE FOR A BREAK",
  heroEyebrow: "YOUR WORKDAY, RECHARGED",
  heroTitle: "Take a thoughtful\nbreak from the busy.",
  heroText: "Meet another professional for a quick, anonymous conversation away from the inbox.",
  findPartner: "Find a break partner",
  officePulse: "Office Pulse",
  officePulseText: "Share what you’re working on, applaud colleagues, and add a thoughtful note.",
  communitySafety: "Google-verified workplace membership. Community content can be reported and reviewed.",
  breakBriefs: "BREAK BRIEFS",
  breakBriefsText: "Watch or share a 10-second workday moment →",
  back: "← Back",
  accountPrivacy: "Account & privacy",
  language: "Language",
  languageHelp: "Choose the language used across Breakroom.",
  terms: "Terms of Use",
  privacy: "Privacy Policy",
  deleteAccount: "Delete my account",
  deleteTitle: "Delete account?",
  deleteText: "This permanently removes your Breakroom profile and associated content.",
  cancel: "Cancel",
  delete: "Delete account",
};

const hi: typeof en = {
  home: "होम", pulse: "पल्स", briefs: "संक्षेप", connect: "जुड़ें", loading: "तैयारी की जा रही है...",
  loginTitle: "काम के बीच बेहतर ब्रेक.", loginText: "अपनी कार्यस्थल कम्युनिटी में जुड़ने के लिए Google से साइन इन करें.", continueGoogle: "Google से जारी रखें",
  greeting: "आपको फिर देखकर अच्छा लगा,", account: "खाता", signOut: "साइन आउट", available: "ब्रेक के लिए उपलब्ध",
  heroEyebrow: "आपका कार्यदिवस, तरोताज़ा", heroTitle: "व्यस्तता से एक\nसोच-समझकर ब्रेक लें.", heroText: "इनबॉक्स से दूर, एक त्वरित गुमनाम बातचीत के लिए किसी दूसरे प्रोफेशनल से मिलें.",
  findPartner: "ब्रेक पार्टनर खोजें", officePulse: "ऑफिस पल्स", officePulseText: "बताएँ कि आप किस पर काम कर रहे हैं, साथियों की सराहना करें और नोट जोड़ें.",
  communitySafety: "Google-प्रमाणित कार्यस्थल सदस्यता। कम्युनिटी कंटेंट की रिपोर्ट और समीक्षा की जा सकती है.", breakBriefs: "ब्रेक ब्रीफ्स", breakBriefsText: "10-सेकंड का कार्यदिवस क्षण देखें या साझा करें →",
  back: "← वापस", accountPrivacy: "खाता और गोपनीयता", language: "भाषा", languageHelp: "Breakroom में उपयोग की जाने वाली भाषा चुनें.", terms: "उपयोग की शर्तें", privacy: "गोपनीयता नीति", deleteAccount: "मेरा खाता हटाएँ", deleteTitle: "खाता हटाएँ?", deleteText: "इससे आपका Breakroom प्रोफ़ाइल और संबंधित कंटेंट स्थायी रूप से हट जाएगा.", cancel: "रद्द करें", delete: "खाता हटाएँ",
};

const es: typeof en = {
  home: "Inicio", pulse: "Pulso", briefs: "Breves", connect: "Conectar", loading: "Preparando todo...",
  loginTitle: "Una mejor pausa laboral.", loginText: "Inicia sesión con Google para unirte a tu comunidad de trabajo.", continueGoogle: "Continuar con Google",
  greeting: "Qué bueno verte,", account: "Cuenta", signOut: "Cerrar sesión", available: "DISPONIBLE PARA UNA PAUSA",
  heroEyebrow: "RECARGA TU JORNADA", heroTitle: "Tómate una pausa\ncon intención.", heroText: "Conoce a otro profesional para una conversación breve y anónima lejos del correo.",
  findPartner: "Buscar un compañero", officePulse: "Pulso de oficina", officePulseText: "Comparte en qué trabajas, reconoce a colegas y añade una nota.",
  communitySafety: "Membresía laboral verificada por Google. El contenido puede denunciarse y revisarse.", breakBriefs: "BREVES DE PAUSA", breakBriefsText: "Mira o comparte un momento laboral de 10 segundos →",
  back: "← Volver", accountPrivacy: "Cuenta y privacidad", language: "Idioma", languageHelp: "Elige el idioma que se usará en Breakroom.", terms: "Términos de uso", privacy: "Política de privacidad", deleteAccount: "Eliminar mi cuenta", deleteTitle: "¿Eliminar cuenta?", deleteText: "Esto elimina permanentemente tu perfil y contenido asociado de Breakroom.", cancel: "Cancelar", delete: "Eliminar cuenta",
};

export const translations = { en, hi, es } as const;
