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

const pageTranslations = {
  en: { inbox: "Inbox", alerts: "Alerts", notifications: "Notifications", notificationSubtitle: "Updates from your desk and private conversations.", allCaughtUp: "All caught up", notificationsEmpty: "New Paper Planes, Desk Note comments, and conversation updates will appear here.", inboxSubtitle: "Private conversations from accepted Paper Planes.", inboxLoadFailed: "Inbox could not load", tryAgain: "Try again", noConversations: "No conversations yet", inboxEmpty: "Accept a Paper Plane from your desk to begin a private chat.", connectedSayHello: "You are connected — say hello.", manageConversation: "Manage conversation", managePrivateConversation: "Manage this private conversation.", deleteConversation: "Delete conversation", blockUser: "Block user", reportUser: "Report user", working: "Working…", deskNotes: "DESK NOTES", deskNotesTitle: "A little note from your desk.", deskNotesSubtitle: "Share a short public thought with the Breakroom. Keep it kind and work-safe.", notePrompt: "What are you thinking about?", pinning: "Pinning…", pinNote: "Pin note", deskTicker: "Desk ticker", noDeskNotes: "No Desk Notes yet. Add the first one.", applaud: "Applaud", applauded: "Applauded", report: "Report", block: "Block", reply: "Reply", yourReply: "Your reply", quickReply: "Reply with a quick thank-you", addComment: "Add a comment", send: "Send", deleteItem: "Delete", deleteNote: "Delete Desk Note?", paperPlane: "PAPER PLANE", from: "From", planeHint: "Accept to open a private conversation in your Inbox.", letItPass: "Let it pass", acceptPlane: "Accept plane", backToDesk: "Back to desk" },
  hi: { inbox: "इनबॉक्स", alerts: "सूचनाएँ", notifications: "सूचनाएँ", notificationSubtitle: "आपकी डेस्क और निजी बातचीत से अपडेट।", allCaughtUp: "सब पढ़ लिया", notificationsEmpty: "नए पेपर प्लेन, डेस्क नोट टिप्पणियाँ और बातचीत अपडेट यहाँ दिखेंगे।", inboxSubtitle: "स्वीकृत पेपर प्लेन से निजी बातचीत।", inboxLoadFailed: "इनबॉक्स लोड नहीं हो सका", tryAgain: "फिर कोशिश करें", noConversations: "अभी कोई बातचीत नहीं", inboxEmpty: "निजी चैट शुरू करने के लिए अपनी डेस्क से पेपर प्लेन स्वीकार करें।", connectedSayHello: "आप जुड़ गए हैं — नमस्ते कहें।", manageConversation: "बातचीत प्रबंधित करें", managePrivateConversation: "इस निजी बातचीत को प्रबंधित करें।", deleteConversation: "बातचीत हटाएँ", blockUser: "उपयोगकर्ता ब्लॉक करें", reportUser: "उपयोगकर्ता की रिपोर्ट करें", working: "काम हो रहा है…", deskNotes: "डेस्क नोट्स", deskNotesTitle: "आपकी डेस्क से एक छोटा नोट।", deskNotesSubtitle: "Breakroom के साथ एक छोटा सार्वजनिक विचार साझा करें। इसे विनम्र और कार्यस्थल के लिए सुरक्षित रखें।", notePrompt: "आप क्या सोच रहे हैं?", pinning: "पिन किया जा रहा है…", pinNote: "नोट पिन करें", deskTicker: "डेस्क टिकर", noDeskNotes: "अभी कोई डेस्क नोट नहीं। पहला जोड़ें।", applaud: "सराहना", applauded: "सराहना की", report: "रिपोर्ट", block: "ब्लॉक", reply: "जवाब", yourReply: "आपका जवाब", quickReply: "एक छोटा धन्यवाद जवाब लिखें", addComment: "टिप्पणी जोड़ें", send: "भेजें", deleteItem: "हटाएँ", deleteNote: "डेस्क नोट हटाएँ?", paperPlane: "पेपर प्लेन", from: "से", planeHint: "अपने इनबॉक्स में निजी बातचीत खोलने के लिए स्वीकार करें।", letItPass: "जाने दें", acceptPlane: "प्लेन स्वीकार करें", backToDesk: "डेस्क पर वापस" },
  es: { inbox: "Bandeja", alerts: "Alertas", notifications: "Notificaciones", notificationSubtitle: "Actualizaciones de tu escritorio y conversaciones privadas.", allCaughtUp: "Todo al día", notificationsEmpty: "Aquí aparecerán nuevos aviones de papel, comentarios y actualizaciones de conversaciones.", inboxSubtitle: "Conversaciones privadas de aviones de papel aceptados.", inboxLoadFailed: "No se pudo cargar la bandeja", tryAgain: "Intentar de nuevo", noConversations: "Aún no hay conversaciones", inboxEmpty: "Acepta un avión de papel desde tu escritorio para iniciar un chat privado.", connectedSayHello: "Están conectados; saluda.", manageConversation: "Gestionar conversación", managePrivateConversation: "Gestiona esta conversación privada.", deleteConversation: "Eliminar conversación", blockUser: "Bloquear usuario", reportUser: "Denunciar usuario", working: "Procesando…", deskNotes: "NOTAS DE ESCRITORIO", deskNotesTitle: "Una pequeña nota desde tu escritorio.", deskNotesSubtitle: "Comparte una idea pública breve con Breakroom. Sé amable y apropiado para el trabajo.", notePrompt: "¿En qué estás pensando?", pinning: "Fijando…", pinNote: "Fijar nota", deskTicker: "Ticker del escritorio", noDeskNotes: "Aún no hay notas. Añade la primera.", applaud: "Reconocer", applauded: "Reconocido", report: "Denunciar", block: "Bloquear", reply: "Responder", yourReply: "Tu respuesta", quickReply: "Responde con un breve agradecimiento", addComment: "Añadir comentario", send: "Enviar", deleteItem: "Eliminar", deleteNote: "¿Eliminar nota de escritorio?", paperPlane: "AVIÓN DE PAPEL", from: "De", planeHint: "Acepta para abrir una conversación privada en tu bandeja.", letItPass: "Dejar pasar", acceptPlane: "Aceptar avión", backToDesk: "Volver al escritorio" },
  fr: { inbox: "Boîte de réception", alerts: "Alertes", notifications: "Notifications", notificationSubtitle: "Mises à jour de votre bureau et de vos conversations privées.", allCaughtUp: "Tout est à jour", notificationsEmpty: "Les nouveaux avions en papier, commentaires et mises à jour de conversation apparaîtront ici.", inboxSubtitle: "Conversations privées issues d’avions en papier acceptés.", inboxLoadFailed: "Impossible de charger la boîte de réception", tryAgain: "Réessayer", noConversations: "Pas encore de conversation", inboxEmpty: "Acceptez un avion en papier depuis votre bureau pour commencer une discussion privée.", connectedSayHello: "Vous êtes connectés — dites bonjour.", manageConversation: "Gérer la conversation", managePrivateConversation: "Gérez cette conversation privée.", deleteConversation: "Supprimer la conversation", blockUser: "Bloquer l’utilisateur", reportUser: "Signaler l’utilisateur", working: "En cours…", deskNotes: "NOTES DE BUREAU", deskNotesTitle: "Un petit mot depuis votre bureau.", deskNotesSubtitle: "Partagez une courte pensée publique avec Breakroom. Restez bienveillant et professionnel.", notePrompt: "À quoi pensez-vous ?", pinning: "Épinglage…", pinNote: "Épingler la note", deskTicker: "Fil du bureau", noDeskNotes: "Pas encore de note. Ajoutez la première.", applaud: "Applaudir", applauded: "Applaudi", report: "Signaler", block: "Bloquer", reply: "Répondre", yourReply: "Votre réponse", quickReply: "Répondez par un bref remerciement", addComment: "Ajouter un commentaire", send: "Envoyer", deleteItem: "Supprimer", deleteNote: "Supprimer la note de bureau ?", paperPlane: "AVION EN PAPIER", from: "De", planeHint: "Acceptez pour ouvrir une conversation privée dans votre boîte de réception.", letItPass: "Laisser passer", acceptPlane: "Accepter l’avion", backToDesk: "Retour au bureau" },
  de: { inbox: "Posteingang", alerts: "Hinweise", notifications: "Benachrichtigungen", notificationSubtitle: "Updates von Ihrem Schreibtisch und aus privaten Gesprächen.", allCaughtUp: "Alles erledigt", notificationsEmpty: "Neue Papierflieger, Kommentare und Gesprächsupdates erscheinen hier.", inboxSubtitle: "Private Gespräche aus angenommenen Papierfliegern.", inboxLoadFailed: "Posteingang konnte nicht geladen werden", tryAgain: "Erneut versuchen", noConversations: "Noch keine Gespräche", inboxEmpty: "Nehmen Sie einen Papierflieger an Ihrem Schreibtisch an, um einen privaten Chat zu beginnen.", connectedSayHello: "Sie sind verbunden — sagen Sie Hallo.", manageConversation: "Gespräch verwalten", managePrivateConversation: "Dieses private Gespräch verwalten.", deleteConversation: "Gespräch löschen", blockUser: "Nutzer blockieren", reportUser: "Nutzer melden", working: "Wird verarbeitet…", deskNotes: "SCHREIBTISCHNOTIZEN", deskNotesTitle: "Eine kleine Notiz von Ihrem Schreibtisch.", deskNotesSubtitle: "Teilen Sie einen kurzen öffentlichen Gedanken mit Breakroom. Bleiben Sie freundlich und professionell.", notePrompt: "Woran denken Sie?", pinning: "Wird angeheftet…", pinNote: "Notiz anheften", deskTicker: "Schreibtisch-Ticker", noDeskNotes: "Noch keine Schreibtischnotizen. Fügen Sie die erste hinzu.", applaud: "Würdigen", applauded: "Gewürdigt", report: "Melden", block: "Blockieren", reply: "Antworten", yourReply: "Ihre Antwort", quickReply: "Mit einem kurzen Danke antworten", addComment: "Kommentar hinzufügen", send: "Senden", deleteItem: "Löschen", deleteNote: "Schreibtischnotiz löschen?", paperPlane: "PAPIERFLIEGER", from: "Von", planeHint: "Annehmen, um ein privates Gespräch im Posteingang zu öffnen.", letItPass: "Vorbeiziehen lassen", acceptPlane: "Flieger annehmen", backToDesk: "Zurück zum Schreibtisch" },
  pt: { inbox: "Caixa de entrada", alerts: "Alertas", notifications: "Notificações", notificationSubtitle: "Atualizações da sua mesa e conversas privadas.", allCaughtUp: "Tudo em dia", notificationsEmpty: "Novos aviões de papel, comentários e atualizações de conversas aparecerão aqui.", inboxSubtitle: "Conversas privadas de aviões de papel aceitos.", inboxLoadFailed: "Não foi possível carregar a caixa de entrada", tryAgain: "Tentar novamente", noConversations: "Ainda não há conversas", inboxEmpty: "Aceite um avião de papel na sua mesa para iniciar um chat privado.", connectedSayHello: "Vocês estão conectados — diga olá.", manageConversation: "Gerenciar conversa", managePrivateConversation: "Gerencie esta conversa privada.", deleteConversation: "Excluir conversa", blockUser: "Bloquear usuário", reportUser: "Denunciar usuário", working: "Processando…", deskNotes: "NOTAS DA MESA", deskNotesTitle: "Um pequeno recado da sua mesa.", deskNotesSubtitle: "Compartilhe um pensamento público curto no Breakroom. Seja gentil e profissional.", notePrompt: "Em que você está pensando?", pinning: "Fixando…", pinNote: "Fixar nota", deskTicker: "Mural da mesa", noDeskNotes: "Ainda não há notas. Adicione a primeira.", applaud: "Aplaudir", applauded: "Aplaudido", report: "Denunciar", block: "Bloquear", reply: "Responder", yourReply: "Sua resposta", quickReply: "Responda com um breve agradecimento", addComment: "Adicionar comentário", send: "Enviar", deleteNote: "Excluir nota da mesa?", paperPlane: "AVIÃO DE PAPEL", from: "De", planeHint: "Aceite para abrir uma conversa privada na sua caixa de entrada.", letItPass: "Deixar passar", acceptPlane: "Aceitar avião", backToDesk: "Voltar à mesa" },
  ar: { inbox: "البريد الوارد", alerts: "التنبيهات", notifications: "الإشعارات", notificationSubtitle: "تحديثات من مكتبك ومحادثاتك الخاصة.", allCaughtUp: "تمت القراءة", notificationsEmpty: "ستظهر هنا الطائرات الورقية الجديدة والتعليقات وتحديثات المحادثات.", inboxSubtitle: "محادثات خاصة من طائرات ورقية مقبولة.", inboxLoadFailed: "تعذر تحميل البريد الوارد", tryAgain: "حاول مرة أخرى", noConversations: "لا توجد محادثات بعد", inboxEmpty: "اقبل طائرة ورقية من مكتبك لبدء دردشة خاصة.", connectedSayHello: "أنتما متصلان — قل مرحبًا.", manageConversation: "إدارة المحادثة", managePrivateConversation: "أدر هذه المحادثة الخاصة.", deleteConversation: "حذف المحادثة", blockUser: "حظر المستخدم", reportUser: "الإبلاغ عن مستخدم", working: "جارٍ التنفيذ…", deskNotes: "ملاحظات المكتب", deskNotesTitle: "ملاحظة صغيرة من مكتبك.", deskNotesSubtitle: "شارك فكرة عامة قصيرة مع Breakroom. اجعلها لطيفة وآمنة للعمل.", notePrompt: "بماذا تفكر؟", pinning: "جارٍ التثبيت…", pinNote: "تثبيت الملاحظة", deskTicker: "شريط المكتب", noDeskNotes: "لا توجد ملاحظات بعد. أضف الأولى.", applaud: "تقدير", applauded: "تم التقدير", report: "إبلاغ", block: "حظر", reply: "رد", yourReply: "ردك", quickReply: "رد بشكر سريع", addComment: "أضف تعليقًا", send: "إرسال", deleteNote: "حذف ملاحظة المكتب؟", paperPlane: "طائرة ورقية", from: "من", planeHint: "اقبل لفتح محادثة خاصة في بريدك الوارد.", letItPass: "دعها تمر", acceptPlane: "قبول الطائرة", backToDesk: "العودة للمكتب" },
  ja: { inbox: "受信トレイ", alerts: "通知", notifications: "通知", notificationSubtitle: "デスクとプライベート会話の更新です。", allCaughtUp: "すべて確認済み", notificationsEmpty: "新しい紙飛行機、デスクノートのコメント、会話の更新がここに表示されます。", inboxSubtitle: "承認した紙飛行機からのプライベート会話。", inboxLoadFailed: "受信トレイを読み込めませんでした", tryAgain: "再試行", noConversations: "まだ会話はありません", inboxEmpty: "デスクで紙飛行機を承認すると、プライベートチャットを始められます。", connectedSayHello: "つながりました — 挨拶しましょう。", manageConversation: "会話を管理", managePrivateConversation: "このプライベート会話を管理します。", deleteConversation: "会話を削除", blockUser: "ユーザーをブロック", reportUser: "ユーザーを報告", working: "処理中…", deskNotes: "デスクノート", deskNotesTitle: "あなたのデスクから小さなメモ。", deskNotesSubtitle: "Breakroom に短い公開メモを共有しましょう。親切で仕事にふさわしい内容にしてください。", notePrompt: "何を考えていますか？", pinning: "固定中…", pinNote: "メモを固定", deskTicker: "デスクティッカー", noDeskNotes: "デスクノートはまだありません。最初のノートを追加しましょう。", applaud: "称賛", applauded: "称賛済み", report: "報告", block: "ブロック", reply: "返信", yourReply: "あなたの返信", quickReply: "短いお礼を返信", addComment: "コメントを追加", send: "送信", deleteNote: "デスクノートを削除しますか？", paperPlane: "紙飛行機", from: "送信者", planeHint: "承認すると受信トレイでプライベート会話を開けます。", letItPass: "見送る", acceptPlane: "飛行機を承認", backToDesk: "デスクに戻る" },
  ta: { inbox: "இன்பாக்ஸ்", alerts: "அறிவிப்புகள்", notifications: "அறிவிப்புகள்", notificationSubtitle: "உங்கள் மேசை மற்றும் தனிப்பட்ட உரையாடல்களின் புதுப்பிப்புகள்.", allCaughtUp: "அனைத்தும் பார்த்துவிட்டீர்கள்", notificationsEmpty: "புதிய காகித விமானங்கள், டெஸ்க் நோட் கருத்துகள் மற்றும் உரையாடல் புதுப்பிப்புகள் இங்கே வரும்.", inboxSubtitle: "ஏற்றுக்கொண்ட காகித விமானங்களிலிருந்து தனிப்பட்ட உரையாடல்கள்.", inboxLoadFailed: "இன்பாக்ஸை ஏற்ற முடியவில்லை", tryAgain: "மீண்டும் முயற்சிக்கவும்", noConversations: "இன்னும் உரையாடல்கள் இல்லை", inboxEmpty: "தனிப்பட்ட அரட்டையைத் தொடங்க உங்கள் மேசையிலுள்ள காகித விமானத்தை ஏற்கவும்.", connectedSayHello: "நீங்கள் இணைக்கப்பட்டுள்ளீர்கள் — வணக்கம் சொல்லுங்கள்.", manageConversation: "உரையாடலை நிர்வகிக்கவும்", managePrivateConversation: "இந்த தனிப்பட்ட உரையாடலை நிர்வகிக்கவும்.", deleteConversation: "உரையாடலை நீக்கவும்", blockUser: "பயனரைத் தடுக்கவும்", reportUser: "பயனரைப் புகாரளிக்கவும்", working: "செயல்படுத்தப்படுகிறது…", deskNotes: "டெஸ்க் குறிப்புகள்", deskNotesTitle: "உங்கள் மேசையிலிருந்து ஒரு சிறிய குறிப்பு.", deskNotesSubtitle: "Breakroom உடன் ஒரு குறுகிய பொது எண்ணத்தைப் பகிருங்கள். அன்பாகவும் பணியிடத்திற்கு ஏற்றதாகவும் வைத்திருங்கள்.", notePrompt: "நீங்கள் என்ன நினைக்கிறீர்கள்?", pinning: "பின் செய்யப்படுகிறது…", pinNote: "குறிப்பைப் பின் செய்யவும்", deskTicker: "டெஸ்க் டிக்கர்", noDeskNotes: "இன்னும் டெஸ்க் குறிப்புகள் இல்லை. முதல் குறிப்பைச் சேர்க்கவும்.", applaud: "பாராட்டு", applauded: "பாராட்டப்பட்டது", report: "புகாரளி", block: "தடு", reply: "பதிலளி", yourReply: "உங்கள் பதில்", quickReply: "சிறிய நன்றியுடன் பதிலளிக்கவும்", addComment: "கருத்தைச் சேர்க்கவும்", send: "அனுப்பு", deleteNote: "டெஸ்க் குறிப்பை நீக்கவா?", paperPlane: "காகித விமானம்", from: "அனுப்பியவர்", planeHint: "உங்கள் இன்பாக்ஸில் தனிப்பட்ட உரையாடலைத் திறக்க ஏற்கவும்.", letItPass: "கடக்க விடுங்கள்", acceptPlane: "விமானத்தை ஏற்கவும்", backToDesk: "மேசைக்குத் திரும்பவும்" },
  id: { inbox: "Kotak masuk", alerts: "Pemberitahuan", notifications: "Pemberitahuan", notificationSubtitle: "Pembaruan dari meja dan percakapan pribadi Anda.", allCaughtUp: "Semua sudah dibaca", notificationsEmpty: "Pesawat kertas baru, komentar Catatan Meja, dan pembaruan percakapan akan muncul di sini.", inboxSubtitle: "Percakapan pribadi dari pesawat kertas yang diterima.", inboxLoadFailed: "Kotak masuk tidak dapat dimuat", tryAgain: "Coba lagi", noConversations: "Belum ada percakapan", inboxEmpty: "Terima pesawat kertas di meja Anda untuk memulai chat pribadi.", connectedSayHello: "Anda terhubung — sapa mereka.", manageConversation: "Kelola percakapan", managePrivateConversation: "Kelola percakapan pribadi ini.", deleteConversation: "Hapus percakapan", blockUser: "Blokir pengguna", reportUser: "Laporkan pengguna", working: "Memproses…", deskNotes: "CATATAN MEJA", deskNotesTitle: "Catatan kecil dari meja Anda.", deskNotesSubtitle: "Bagikan pemikiran publik singkat dengan Breakroom. Tetap ramah dan aman untuk kerja.", notePrompt: "Apa yang Anda pikirkan?", pinning: "Menyematkan…", pinNote: "Sematkan catatan", deskTicker: "Ticker meja", noDeskNotes: "Belum ada Catatan Meja. Tambahkan yang pertama.", applaud: "Apresiasi", applauded: "Diapresiasi", report: "Laporkan", block: "Blokir", reply: "Balas", yourReply: "Balasan Anda", quickReply: "Balas dengan ucapan terima kasih singkat", addComment: "Tambah komentar", send: "Kirim", deleteNote: "Hapus Catatan Meja?", paperPlane: "PESAWAT KERTAS", from: "Dari", planeHint: "Terima untuk membuka percakapan pribadi di kotak masuk Anda.", letItPass: "Biarkan lewat", acceptPlane: "Terima pesawat", backToDesk: "Kembali ke meja" },
} as const;

export const translations = {
  en: { ...en, ...pageTranslations.en }, hi: { ...hi, ...pageTranslations.hi }, es: { ...es, ...pageTranslations.es }, fr: { ...fr, ...pageTranslations.fr }, de: { ...de, ...pageTranslations.de }, pt: { ...pt, ...pageTranslations.pt, deleteItem: "Excluir" }, ar: { ...ar, ...pageTranslations.ar, deleteItem: "حذف" }, ja: { ...ja, ...pageTranslations.ja, deleteItem: "削除" }, ta: { ...ta, ...pageTranslations.ta, deleteItem: "நீக்கு" }, id: { ...id, ...pageTranslations.id, deleteItem: "Hapus" },
} as const;
