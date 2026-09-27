type Lang = 'en' | 'ar';

const en = {
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  saving: 'Saving...',
  cancel: 'Cancel',
  namePh: 'Competitor name',
  notesPh: 'Notes (optional)',
  nameRequired: "Enter the competitor's name.",
  confirmDelete: (name: string) => 'Delete ' + name + ' and all its logged numbers? This cannot be undone.',
  history: (n: number) => 'History (' + n + ')',
  hideHistory: 'Hide history',
  confirmDeleteEntry: 'Delete this entry?',
  flagged: 'Flagged',
  followers: 'followers',
};

export type ManageDict = typeof en;

const ar: ManageDict = {
  edit: 'تعديل',
  delete: 'حذف',
  save: 'حفظ',
  saving: 'جارٍ الحفظ...',
  cancel: 'إلغاء',
  namePh: 'اسم المنافس',
  notesPh: 'ملاحظات (اختياري)',
  nameRequired: 'أدخل اسم المنافس.',
  confirmDelete: (name: string) => 'حذف ' + name + ' وجميع أرقامه المسجّلة؟ لا يمكن التراجع عن ذلك.',
  history: (n: number) => 'السجل (' + n + ')',
  hideHistory: 'إخفاء السجل',
  confirmDeleteEntry: 'حذف هذا الإدخال؟',
  flagged: 'لافت',
  followers: 'متابع',
};

export function getManageDict(lang: Lang): ManageDict {
  return lang === 'ar' ? ar : en;
}