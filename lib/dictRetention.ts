type Lang = 'en' | 'ar';

const en = {
  backToDashboard: '← Back to dashboard',
  pageTitle: 'Retention & pricing',
  unavailable: "This branch isn't available, or you don't have access to it.",
  needAov: (n: number) =>
    'Set an average order value above, then add at least ' + n + ' repeat customers to get a recommendation.',
  noRecYet: (n: number) =>
    'No recommendation yet. Add at least ' + n + ' repeat customers below to generate one.',
  aov: {
    label: 'Average order value',
    edit: 'Edit',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    placeholder: 'e.g. 45',
    invalid: 'Enter a number greater than 0.',
    note: 'Changing this recalculates your pricing recommendation automatically.',
  },
  card: {
    title: 'Pricing recommendation',
    perMonth: '/month potential',
    basedOn: (n: number) => 'Based on ' + n + ' repeat customers, most commonly retained by',
    tieNote: ' (tied with another reason - worth a closer look)',
    show: 'How we calculated this',
    hide: 'Hide',
    aovRow: 'Average order value',
    customersRow: 'Repeat customers counted',
    increaseRow: 'Suggested price increase',
    notApplicable: 'Not applicable - see recommendation above',
    formulaRow: 'Formula',
    formula: 'average order value x repeat customers x price increase',
    assumption:
      "Assumes each repeat customer places roughly one order per month at your branch's average order value, and counts revenue from these repeat customers only. This is a conservative, directional estimate, not a guarantee.",
    texts: {
      mixed:
        'Your customers stay for a mix of reasons, with no single one standing out. We recommend holding prices steady until a clearer pattern appears. Add a few more repeat customers to sharpen the picture.',
      price:
        'We recommend against raising prices until other retention factors (service, trust, or product quality) are strengthened. Right now, price appears to be the main reason these customers stay.',
      notSure:
        "Retention reasons aren't clear enough yet to recommend a pricing move. Gather a bit more detail on why these customers keep buying before adjusting prices.",
      raise: (reason: string) =>
        'You likely have room to raise prices cautiously. ' + reason + ' appears to be the main reason these customers stay, which typically means demand is less sensitive to a modest price increase.',
    },
  },
  list: {
    title: (n: number) => 'Your repeat customers (' + n + ')',
    customer: 'Customer',
    times: 'Times purchased',
    why: 'Why they stay',
    remove: 'Remove',
    removing: 'Removing...',
    confirm: (label: string) => 'Remove ' + label + '? The recommendation will be recalculated.',
  },
  form: {
    title: 'Repeat customers',
    intro: (n: number) =>
      'Add at least ' + n + " repeat customers total. For each one, your best guess at why they keep buying is what matters most - exact numbers aren't necessary.",
    labelPh: 'Customer label (e.g. Customer A)',
    timesPh: 'Times purchased',
    reasonPh: 'Why do they keep buying?',
    add: '+ Add another customer',
    removeRowAria: 'Remove row',
    save: 'Save and calculate',
    saving: 'Saving...',
    needRow: 'Fill in at least one complete row before saving.',
    genericError: 'Something went wrong saving these entries.',
    genFailed: 'Could not generate a recommendation.',
  },
};

export type RetentionDict = typeof en;

const ar: RetentionDict = {
  backToDashboard: '→ العودة إلى لوحة التحكم',
  pageTitle: 'الاحتفاظ والتسعير',
  unavailable: 'هذا الفرع غير متاح، أو ليس لديك صلاحية الوصول إليه.',
  needAov: (n: number) =>
    'حدّد متوسط قيمة الطلب أعلاه، ثم أضف ' + n + ' عملاء متكررين على الأقل للحصول على توصية.',
  noRecYet: (n: number) =>
    'لا توجد توصية بعد. أضف ' + n + ' عملاء متكررين على الأقل أدناه لإنشاء توصية.',
  aov: {
    label: 'متوسط قيمة الطلب',
    edit: 'تعديل',
    save: 'حفظ',
    saving: 'جارٍ الحفظ...',
    cancel: 'إلغاء',
    placeholder: 'مثلاً 45',
    invalid: 'أدخل رقماً أكبر من 0.',
    note: 'تغيير هذه القيمة يعيد حساب توصية التسعير تلقائياً.',
  },
  card: {
    title: 'توصية التسعير',
    perMonth: 'إمكانية شهرية',
    basedOn: (n: number) => 'استناداً إلى ' + n + ' عملاء متكررين، السبب الأكثر شيوعاً لعودتهم:',
    tieNote: ' (متعادل مع سبب آخر - يستحق نظرة أدق)',
    show: 'كيف حسبنا هذا',
    hide: 'إخفاء',
    aovRow: 'متوسط قيمة الطلب',
    customersRow: 'عدد العملاء المتكررين',
    increaseRow: 'نسبة زيادة السعر المقترحة',
    notApplicable: 'لا ينطبق - راجع التوصية أعلاه',
    formulaRow: 'المعادلة',
    formula: 'متوسط قيمة الطلب × العملاء المتكررون × نسبة الزيادة',
    assumption:
      'يفترض أن كل عميل متكرر يطلب مرة واحدة تقريباً شهرياً بمتوسط قيمة الطلب في فرعك، ويحتسب الإيرادات من هؤلاء العملاء فقط. إنه تقدير متحفّظ واتجاهي، وليس ضماناً.',
    texts: {
      mixed:
        'يعود عملاؤك لأسباب متنوعة، دون سبب واحد بارز. ننصح بإبقاء الأسعار كما هي حتى يتضح نمط أوضح. أضف بعض العملاء المتكررين لتوضيح الصورة.',
      price:
        'ننصح بعدم رفع الأسعار قبل تعزيز عوامل الاحتفاظ الأخرى (الخدمة أو الثقة أو جودة المنتج). حالياً، يبدو أن السعر هو السبب الرئيسي لعودة هؤلاء العملاء.',
      notSure:
        'أسباب عودة العملاء ليست واضحة بما يكفي لنوصي بخطوة تسعير. اجمع تفاصيل أكثر حول سبب استمرارهم في الشراء قبل تعديل الأسعار.',
      raise: (reason: string) =>
        'لديك على الأرجح مجال لرفع الأسعار بحذر. يبدو أن «' + reason + '» هو السبب الرئيسي لعودة هؤلاء العملاء، ما يعني عادةً أن الطلب أقل تأثراً بزيادة معتدلة في السعر.',
    },
  },
  list: {
    title: (n: number) => 'عملاؤك المتكررون (' + n + ')',
    customer: 'العميل',
    times: 'عدد مرات الشراء',
    why: 'سبب العودة',
    remove: 'حذف',
    removing: 'جارٍ الحذف...',
    confirm: (label: string) => 'حذف ' + label + '؟ سيُعاد حساب التوصية.',
  },
  form: {
    title: 'العملاء المتكررون',
    intro: (n: number) =>
      'أضف ' + n + ' عملاء متكررين على الأقل إجمالاً. لكل عميل، أهم ما في الأمر هو تقديرك لسبب استمراره في الشراء، ولا حاجة لأرقام دقيقة.',
    labelPh: 'اسم العميل (مثلاً: العميل أ)',
    timesPh: 'مرات الشراء',
    reasonPh: 'لماذا يستمر في الشراء؟',
    add: '+ إضافة عميل آخر',
    removeRowAria: 'حذف الصف',
    save: 'حفظ وحساب',
    saving: 'جارٍ الحفظ...',
    needRow: 'املأ صفاً واحداً كاملاً على الأقل قبل الحفظ.',
    genericError: 'حدث خطأ أثناء حفظ هذه البيانات.',
    genFailed: 'تعذّر إنشاء توصية.',
  },
};

export function getRetentionDict(lang: Lang): RetentionDict {
  return lang === 'ar' ? ar : en;
}