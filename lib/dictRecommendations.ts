import type { RecommendationSource, RecommendationStatus } from './types';

type Lang = 'en' | 'ar';

const en = {
  backToDashboard: '← Back to dashboard',
  title: 'Recommendation log',
  intro: "Every recommendation we've given you, and where it stands. Update the status as you go.",
  noLogs: 'No recommendations logged this quarter yet.',
  implementedOf: (a: number, b: number) => a + ' of ' + b,
  implementedSuffix: 'recommendations implemented this quarter',
  given: (date: string) => 'Given ' + date,
  couldNotSave: 'Could not save',
  sources: {
    feature_1: 'Competitor tracking',
    feature_2: 'Pricing',
    consultation: 'Consultation',
  } as Record<RecommendationSource, string>,
  statuses: {
    not_started: 'Not started',
    in_progress: 'In progress',
    implemented: 'Implemented',
    deferred: 'Deferred',
  } as Record<RecommendationStatus, string>,
};

export type RecommendationsDict = typeof en;

const ar: RecommendationsDict = {
  backToDashboard: '→ العودة إلى لوحة التحكم',
  title: 'سجل التوصيات',
  intro: 'كل توصية قدّمناها لك، وأين وصلت. حدّث الحالة مع تقدّمك.',
  noLogs: 'لم تُسجَّل أي توصيات في هذا الربع بعد.',
  implementedOf: (a: number, b: number) => a + ' من ' + b,
  implementedSuffix: 'توصيات نُفّذت هذا الربع',
  given: (date: string) => 'قُدّمت في ' + date,
  couldNotSave: 'تعذّر الحفظ',
  sources: {
    feature_1: 'تتبّع المنافسين',
    feature_2: 'التسعير',
    consultation: 'استشارة',
  },
  statuses: {
    not_started: 'لم تبدأ',
    in_progress: 'قيد التنفيذ',
    implemented: 'نُفّذت',
    deferred: 'مؤجّلة',
  },
};

export function getRecommendationsDict(lang: Lang): RecommendationsDict {
  return lang === 'ar' ? ar : en;
}