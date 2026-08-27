export const supportedLanguages = ["en", "hi", "es", "fr", "de", "pt", "ar", "ja", "ta", "id"] as const;

export type LanguageCode = (typeof supportedLanguages)[number];
export type TranslationKey = keyof typeof translations.en;

export const languageNames: Record<LanguageCode, string> = {
  en: "English",
  hi: "हिन्दी",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ar: "العربية",
  ja: "日本語",
  ta: "தமிழ்",
  id: "Bahasa Indonesia",
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

const fr: typeof en = {
  home: "Accueil", pulse: "Pouls", briefs: "Brèves", connect: "Se connecter", loading: "Préparation en cours...",
  loginTitle: "Une meilleure pause au travail.", loginText: "Connectez-vous avec Google pour rejoindre votre communauté professionnelle.", continueGoogle: "Continuer avec Google",
  greeting: "Ravi de vous revoir,", account: "Compte", signOut: "Se déconnecter", available: "DISPONIBLE POUR UNE PAUSE",
  heroEyebrow: "RECHARGEZ VOTRE JOURNÉE", heroTitle: "Prenez une pause\nqui compte.", heroText: "Rencontrez un autre professionnel pour une conversation rapide et anonyme loin de votre boîte mail.",
  findPartner: "Trouver un partenaire", officePulse: "Pouls du bureau", officePulseText: "Partagez votre activité, appréciez vos collègues et ajoutez une note.",
  communitySafety: "Communauté professionnelle vérifiée par Google. Le contenu peut être signalé et examiné.", breakBriefs: "BRÈVES DE PAUSE", breakBriefsText: "Regardez ou partagez un moment de travail de 10 secondes →",
  back: "← Retour", accountPrivacy: "Compte et confidentialité", language: "Langue", languageHelp: "Choisissez la langue utilisée dans Breakroom.", terms: "Conditions d’utilisation", privacy: "Politique de confidentialité", deleteAccount: "Supprimer mon compte", deleteTitle: "Supprimer le compte ?", deleteText: "Cette action supprime définitivement votre profil et son contenu Breakroom.", cancel: "Annuler", delete: "Supprimer le compte",
};

const de: typeof en = {
  home: "Start", pulse: "Puls", briefs: "Kurzinfos", connect: "Verbinden", loading: "Alles wird vorbereitet...",
  loginTitle: "Eine bessere Arbeitspause.", loginText: "Melden Sie sich mit Google an, um Ihrer Arbeitsgemeinschaft beizutreten.", continueGoogle: "Mit Google fortfahren",
  greeting: "Schön, Sie zu sehen,", account: "Konto", signOut: "Abmelden", available: "BEREIT FÜR EINE PAUSE",
  heroEyebrow: "NEUE ENERGIE FÜR DEN ARBEITSTAG", heroTitle: "Machen Sie eine\nbewusste Pause.", heroText: "Treffen Sie einen anderen Profi für ein kurzes, anonymes Gespräch abseits des Posteingangs.",
  findPartner: "Pausenpartner finden", officePulse: "Büro-Puls", officePulseText: "Teilen Sie Ihre Arbeit, würdigen Sie Kollegen und fügen Sie eine Notiz hinzu.",
  communitySafety: "Google-verifizierte Arbeitsgemeinschaft. Inhalte können gemeldet und geprüft werden.", breakBriefs: "PAUSEN-KURZINFOS", breakBriefsText: "Einen 10-Sekunden-Arbeitsmoment ansehen oder teilen →",
  back: "← Zurück", accountPrivacy: "Konto und Datenschutz", language: "Sprache", languageHelp: "Wählen Sie die Sprache für Breakroom.", terms: "Nutzungsbedingungen", privacy: "Datenschutzerklärung", deleteAccount: "Mein Konto löschen", deleteTitle: "Konto löschen?", deleteText: "Dadurch werden Ihr Breakroom-Profil und zugehörige Inhalte dauerhaft gelöscht.", cancel: "Abbrechen", delete: "Konto löschen",
};

const pt: typeof en = {
  home: "Início", pulse: "Pulso", briefs: "Resumos", connect: "Conectar", loading: "Preparando tudo...",
  loginTitle: "Uma pausa melhor no trabalho.", loginText: "Entre com sua conta do Google para participar da comunidade de trabalho.", continueGoogle: "Continuar com Google",
  greeting: "Que bom ver você,", account: "Conta", signOut: "Sair", available: "DISPONÍVEL PARA UMA PAUSA",
  heroEyebrow: "RECUPERE SUA ENERGIA", heroTitle: "Faça uma pausa\ncom propósito.", heroText: "Encontre outro profissional para uma conversa rápida e anônima longe da caixa de entrada.",
  findPartner: "Encontrar parceiro", officePulse: "Pulso do escritório", officePulseText: "Compartilhe seu trabalho, reconheça colegas e adicione uma nota.",
  communitySafety: "Comunidade profissional verificada pelo Google. O conteúdo pode ser denunciado e revisado.", breakBriefs: "RESUMOS DE PAUSA", breakBriefsText: "Veja ou compartilhe um momento de trabalho de 10 segundos →",
  back: "← Voltar", accountPrivacy: "Conta e privacidade", language: "Idioma", languageHelp: "Escolha o idioma usado no Breakroom.", terms: "Termos de uso", privacy: "Política de privacidade", deleteAccount: "Excluir minha conta", deleteTitle: "Excluir conta?", deleteText: "Isto remove permanentemente seu perfil e conteúdo associado do Breakroom.", cancel: "Cancelar", delete: "Excluir conta",
};

const ar: typeof en = {
  home: "الرئيسية", pulse: "نبض", briefs: "لمحات", connect: "تواصل", loading: "جارٍ تجهيز كل شيء...",
  loginTitle: "استراحة أفضل في يوم العمل.", loginText: "سجّل الدخول بحساب Google للانضمام إلى مجتمع مكان العمل.", continueGoogle: "المتابعة باستخدام Google",
  greeting: "سعداء برؤيتك،", account: "الحساب", signOut: "تسجيل الخروج", available: "متاح لاستراحة",
  heroEyebrow: "جدّد طاقتك في يوم العمل", heroTitle: "خذ استراحة\nهادفة.", heroText: "تواصل مع محترف آخر لإجراء محادثة سريعة ومجهولة بعيدًا عن البريد الوارد.",
  findPartner: "اعثر على شريك استراحة", officePulse: "نبض المكتب", officePulseText: "شارك ما تعمل عليه، وقدّر الزملاء، وأضف ملاحظة.",
  communitySafety: "مجتمع عمل موثّق من Google. يمكن الإبلاغ عن المحتوى ومراجعته.", breakBriefs: "لمحات الاستراحة", breakBriefsText: "شاهد أو شارك لحظة عمل مدتها 10 ثوانٍ ←",
  back: "رجوع →", accountPrivacy: "الحساب والخصوصية", language: "اللغة", languageHelp: "اختر اللغة المستخدمة في Breakroom.", terms: "شروط الاستخدام", privacy: "سياسة الخصوصية", deleteAccount: "حذف حسابي", deleteTitle: "حذف الحساب؟", deleteText: "سيؤدي هذا إلى إزالة ملفك الشخصي ومحتوى Breakroom المرتبط به نهائيًا.", cancel: "إلغاء", delete: "حذف الحساب",
};

const ja: typeof en = {
  home: "ホーム", pulse: "パルス", briefs: "ブリーフ", connect: "つながる", loading: "準備しています...",
  loginTitle: "より良い仕事の休憩を。", loginText: "Google アカウントでログインして、職場コミュニティに参加しましょう。", continueGoogle: "Google で続ける",
  greeting: "おかえりなさい、", account: "アカウント", signOut: "ログアウト", available: "休憩できます",
  heroEyebrow: "仕事の一日に、リフレッシュを", heroTitle: "忙しさから少し\n意識的に離れよう。", heroText: "受信トレイから離れて、ほかのプロフェッショナルと短く匿名で話しましょう。",
  findPartner: "休憩相手を探す", officePulse: "オフィスパルス", officePulseText: "取り組みを共有し、同僚をたたえ、コメントを追加できます。",
  communitySafety: "Google 認証済みの職場コミュニティ。コンテンツは報告・審査できます。", breakBriefs: "ブレーク・ブリーフ", breakBriefsText: "10 秒の仕事の瞬間を見たり共有したりする →",
  back: "← 戻る", accountPrivacy: "アカウントとプライバシー", language: "言語", languageHelp: "Breakroom で使用する言語を選択します。", terms: "利用規約", privacy: "プライバシーポリシー", deleteAccount: "アカウントを削除", deleteTitle: "アカウントを削除しますか？", deleteText: "Breakroom のプロフィールと関連コンテンツが完全に削除されます。", cancel: "キャンセル", delete: "アカウントを削除",
};

const ta: typeof en = {
  home: "முகப்பு", pulse: "பல்ஸ்", briefs: "சுருக்கங்கள்", connect: "இணையுங்கள்", loading: "தயாராகிறது...",
  loginTitle: "வேலை நாளுக்கான சிறந்த இடைவேளை.", loginText: "உங்கள் பணியிட சமூகத்தில் சேர Google கணக்கில் உள்நுழையவும்.", continueGoogle: "Google மூலம் தொடரவும்",
  greeting: "உங்களை மீண்டும் பார்ப்பதில் மகிழ்ச்சி,", account: "கணக்கு", signOut: "வெளியேறு", available: "இடைவேளைக்குத் தயாராக உள்ளீர்கள்",
  heroEyebrow: "உங்கள் வேலைநாளை புதுப்பிக்கவும்", heroTitle: "பரபரப்பில் இருந்து\nசிந்தித்துச் சிறிது ஓய்வெடுங்கள்.", heroText: "இன்பாக்ஸிலிருந்து விலகி, மற்றொரு தொழில்முறையருடன் விரைவான அநாமதேய உரையாடலைத் தொடங்குங்கள்.",
  findPartner: "இடைவேளை நண்பரைத் தேடுங்கள்", officePulse: "அலுவலக பல்ஸ்", officePulseText: "நீங்கள் செய்வதைப் பகிருங்கள், சக ஊழியர்களைப் பாராட்டுங்கள், குறிப்பைச் சேருங்கள்.",
  communitySafety: "Google-சரிபார்க்கப்பட்ட பணியிட சமூகம். உள்ளடக்கத்தைப் புகாரளித்து மதிப்பாய்வு செய்யலாம்.", breakBriefs: "இடைவேளை சுருக்கங்கள்", breakBriefsText: "10-வினாடி வேலைநாள் தருணத்தைப் பாருங்கள் அல்லது பகிருங்கள் →",
  back: "← பின்செல்", accountPrivacy: "கணக்கு மற்றும் தனியுரிமை", language: "மொழி", languageHelp: "Breakroom-ல் பயன்படுத்த வேண்டிய மொழியைத் தேர்வு செய்யவும்.", terms: "பயன்பாட்டு விதிமுறைகள்", privacy: "தனியுரிமைக் கொள்கை", deleteAccount: "என் கணக்கை நீக்கவும்", deleteTitle: "கணக்கை நீக்கவா?", deleteText: "இது உங்கள் Breakroom சுயவிவரத்தையும் தொடர்புடைய உள்ளடக்கத்தையும் நிரந்தரமாக நீக்கும்.", cancel: "ரத்துசெய்", delete: "கணக்கை நீக்கவும்",
};

const id: typeof en = {
  home: "Beranda", pulse: "Pulse", briefs: "Ringkasan", connect: "Terhubung", loading: "Menyiapkan semuanya...",
  loginTitle: "Waktu istirahat kerja yang lebih baik.", loginText: "Masuk dengan akun Google Anda untuk bergabung dengan komunitas tempat kerja.", continueGoogle: "Lanjutkan dengan Google",
  greeting: "Senang bertemu lagi,", account: "Akun", signOut: "Keluar", available: "TERSEDIA UNTUK ISTIRAHAT",
  heroEyebrow: "SEGARKAN HARI KERJA ANDA", heroTitle: "Ambil jeda yang\nbermakna.", heroText: "Temui profesional lain untuk percakapan singkat dan anonim jauh dari kotak masuk.",
  findPartner: "Cari teman istirahat", officePulse: "Pulse kantor", officePulseText: "Bagikan pekerjaan Anda, beri apresiasi kepada rekan, dan tambahkan catatan.",
  communitySafety: "Komunitas tempat kerja terverifikasi Google. Konten dapat dilaporkan dan ditinjau.", breakBriefs: "RINGKASAN ISTIRAHAT", breakBriefsText: "Tonton atau bagikan momen kerja 10 detik →",
  back: "← Kembali", accountPrivacy: "Akun dan privasi", language: "Bahasa", languageHelp: "Pilih bahasa yang digunakan di Breakroom.", terms: "Ketentuan penggunaan", privacy: "Kebijakan privasi", deleteAccount: "Hapus akun saya", deleteTitle: "Hapus akun?", deleteText: "Ini akan menghapus profil Breakroom dan konten terkait Anda secara permanen.", cancel: "Batal", delete: "Hapus akun",
};

export const translations = { en, hi, es, fr, de, pt, ar, ja, ta, id } as const;
