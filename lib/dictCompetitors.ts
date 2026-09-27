type Lang = 'en' | 'ar';

const en = {
  backToDashboard: '← Back to dashboard',
  unavailable: "This branch isn't available, or you don't have access to it.",
  title: 'Competitor tracking',
  intro:
    "All figures here are entered manually by you or our team and refreshed when updated - nothing is pulled live from social platforms. Competitor tracking is qualitative and doesn't feed into your estimated monthly opportunity.",
  colFollowers: 'Followers',
  colFrequency: 'Posting frequency',
  colNotes: 'Pricing / campaign notes',
  colUpdated: 'Last updated',
  you: (name: string) => 'You - ' + name,
  flagged: 'Flagged change',
  yourNumbers: 'Your numbers',
  updateYourNumbers: 'Update your numbers',
  logNewNumbers: 'Log new numbers',
  add: {
    title: 'Add a competitor',
    hint: 'Add the competitors you actually compete with - we never pick them for you.',
    namePh: 'Competitor name',
    notesPh: 'Notes (optional)',
    nameRequired: "Enter the competitor's name.",
    adding: 'Adding...',
    addBtn: 'Add competitor',
  },
  log: {
    followersPh: 'Follower count',
    frequencyPh: 'Posting frequency (e.g. 3 posts/week)',
    ownNotesPh: 'Notes (optional)',
    compNotesPh: 'Pricing or campaign notes (optional)',
    flag: 'Flag this as a notable change',
    needOne: 'Fill in at least one field.',
    saving: 'Saving...',
    save: 'Save',
    cancel: 'Cancel',
  },
  copy: {
    trackedAll: 'Tracked on all your branches',
    copying: 'Copying...',
    copyTo: (n: number) => 'Copy to other branches (' + n + ')',
  },
};

export type CompetitorsDict = typeof en;

const ar: CompetitorsDict = {
  backToDashboard: '→ العودة إلى لوحة التحكم',
  unavailable: 'هذا الفرع غير متاح، أو ليس لديك صلاحية الوصول إليه.',
  title: 'تتبّع المنافسين',
  intro:
    'جميع الأرقام هنا يُدخلها فريقك أو فريقنا يدوياً وتُحدَّث عند كل تحديث - لا شيء يُسحب مباشرة من منصات التواصل. تتبّع المنافسين نوعي ولا يدخل في حساب فرصتك الشهرية المقدّرة.',
  colFollowers: 'المتابعون',
  colFrequency: 'وتيرة النشر',
  colNotes: 'ملاحظات التسعير / الحملات',
  colUpdated: 'آخر تحديث',
  you: (name: string) => 'أنت - ' + name,
  flagged: 'تغيير لافت',
  yourNumbers: 'أرقامك',
  updateYourNumbers: 'حدّث أرقامك',
  logNewNumbers: 'سجّل أرقاماً جديدة',
  add: {
    title: 'إضافة منافس',
    hint: 'أضف المنافسين الذين تنافسهم فعلاً - نحن لا نختارهم عنك.',
    namePh: 'اسم المنافس',
    notesPh: 'ملاحظات (اختياري)',
    nameRequired: 'أدخل اسم المنافس.',
    adding: 'جارٍ الإضافة...',
    addBtn: 'إضافة منافس',
  },
  log: {
    followersPh: 'عدد المتابعين',
    frequencyPh: 'وتيرة النشر (مثلاً: 3 منشورات أسبوعياً)',
    ownNotesPh: 'ملاحظات (اختياري)',
    compNotesPh: 'ملاحظات التسعير أو الحملات (اختياري)',
    flag: 'اعتبر هذا تغييراً لافتاً',
    needOne: 'املأ حقلاً واحداً على الأقل.',
    saving: 'جارٍ الحفظ...',
    save: 'حفظ',
    cancel: 'إلغاء',
  },
  copy: {
    trackedAll: 'متتبَّع في جميع فروعك',
    copying: 'جارٍ النسخ...',
    copyTo: (n: number) => 'نسخ إلى الفروع الأخرى (' + n + ')',
  },
};

export function getCompetitorsDict(lang: Lang): CompetitorsDict {
  return lang === 'ar' ? ar : en;
}