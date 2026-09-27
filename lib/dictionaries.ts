import type { RetentionReason } from './types';

const enReasons: Record<RetentionReason, string> = {
  price: 'Price',
  product_quality: 'Product quality',
  service_responsiveness: 'Service & responsiveness',
  lack_of_alternatives: 'Lack of market alternatives',
  trust_relationship: 'Trust & relationship',
  not_sure: 'Not sure',
};

const arReasons: Record<RetentionReason, string> = {
  price: 'السعر',
  product_quality: 'جودة المنتج',
  service_responsiveness: 'الخدمة وسرعة الاستجابة',
  lack_of_alternatives: 'قلة البدائل في السوق',
  trust_relationship: 'الثقة والعلاقة',
  not_sure: 'غير متأكد',
};

export const en = {
  reasons: enReasons,

  login: {
    title: 'Sign in to The Fix',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    invalid: 'Incorrect email or password.',
  },

  dashboard: {
    noAccount: 'No account is linked to your login yet. Contact The Fix team.',
    opportunityTitle: 'Estimated monthly opportunity',
    perMonthAcross: (n: number) => 'per month, across ' + n + ' ' + (n === 1 ? 'branch' : 'branches'),
    sourceNote:
      "Right now this figure comes only from pricing recommendations. Competitor tracking is shown for context, but doesn't add to this number yet.",
    retentionLink: 'Retention & pricing',
    competitorsLink: 'Competitors',
    notCalculated: 'Not calculated yet - add repeat customers',
    advisingAgainst: "we're advising against a price increase here",
    tooUnclear: 'retention reasons are too unclear to estimate yet',
    howCalculated: 'How we calculated this',
    howIntro:
      "We add up the latest pricing estimate for each branch. Each branch's estimate is: average order value x repeat customers counted x a suggested price increase. The increase is a modest range based on the main reason those customers keep buying.",
    customers: 'customers',
    mainReason: 'main reason',
    howFootnote:
      "It assumes roughly one order per month per repeat customer and counts repeat customers only. It's a conservative, directional estimate, not a guarantee.",
    accountability: 'Accountability',
    noLogs: 'No recommendations logged this quarter yet.',
    implementedOf: (a: number, b: number) => a + ' of ' + b,
    implementedSuffix: 'recommendations implemented this quarter →',
    lockedNote: 'Available with a human consultation',
    bookConsultation: 'Book a consultation',
    lockedFeatures: [
      {
        title: 'Video & content gap analysis',
        description: "Which formats and topics your competitors win on, and what you're missing.",
      },
      {
        title: 'Budget-tailored growth roadmap',
        description: 'A step-by-step plan sized to what you can actually spend.',
      },
      {
        title: 'Cross-sell & basket analysis',
        description: 'Which products sell together, and how to raise your average order.',
      },
    ],
  },
};

export type Dict = typeof en;

export const ar: Dict = {
  reasons: arReasons,

  login: {
    title: 'تسجيل الدخول إلى The Fix',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signingIn: 'جارٍ تسجيل الدخول...',
    invalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  },

  dashboard: {
    noAccount: 'لا يوجد حساب مرتبط بتسجيل دخولك بعد. تواصل مع فريق The Fix.',
    opportunityTitle: 'الفرصة الشهرية المقدّرة',
    perMonthAcross: (n: number) =>
      n === 1
        ? 'شهرياً، في فرع واحد'
        : n === 2
        ? 'شهرياً، في فرعين'
        : n <= 10
        ? 'شهرياً، في ' + n + ' فروع'
        : 'شهرياً، في ' + n + ' فرعاً',
    sourceNote:
      'يأتي هذا الرقم حالياً من توصيات التسعير فقط. تتبّع المنافسين معروض للاطلاع، لكنه لا يُضاف إلى هذا الرقم بعد.',
    retentionLink: 'الاحتفاظ والتسعير',
    competitorsLink: 'المنافسون',
    notCalculated: 'لم يُحسب بعد - أضف عملاء متكررين',
    advisingAgainst: 'ننصح بعدم رفع الأسعار هنا',
    tooUnclear: 'أسباب عودة العملاء غير واضحة بما يكفي للتقدير بعد',
    howCalculated: 'كيف حسبنا هذا الرقم',
    howIntro:
      'نجمع آخر تقدير تسعير لكل فرع. تقدير كل فرع هو: متوسط قيمة الطلب × عدد العملاء المتكررين × نسبة زيادة سعر مقترحة. هذه الزيادة نطاق معتدل يعتمد على السبب الرئيسي لعودة هؤلاء العملاء.',
    customers: 'عملاء',
    mainReason: 'السبب الرئيسي',
    howFootnote:
      'يفترض هذا التقدير طلباً واحداً تقريباً شهرياً لكل عميل متكرر، ويحتسب العملاء المتكررين فقط. إنه تقدير متحفّظ واتجاهي، وليس ضماناً.',
    accountability: 'متابعة التنفيذ',
    noLogs: 'لم تُسجَّل أي توصيات في هذا الربع بعد.',
    implementedOf: (a: number, b: number) => a + ' من ' + b,
    implementedSuffix: 'توصيات نُفّذت هذا الربع ←',
    lockedNote: 'متاح مع استشارة من فريقنا',
    bookConsultation: 'احجز استشارة',
    lockedFeatures: [
      {
        title: 'تحليل فجوات الفيديو والمحتوى',
        description: 'ما الصيغ والمواضيع التي يتفوّق فيها منافسوك، وما الذي ينقصك.',
      },
      {
        title: 'خطة نمو مصمّمة حسب ميزانيتك',
        description: 'خطة خطوة بخطوة على قدر ما يمكنك إنفاقه فعلاً.',
      },
      {
        title: 'تحليل البيع المتقاطع وسلة المشتريات',
        description: 'ما المنتجات التي تُباع معاً، وكيف ترفع متوسط قيمة الطلب.',
      },
    ],
  },
};

export function getDict(lang: 'en' | 'ar'): Dict {
  return lang === 'ar' ? ar : en;
}