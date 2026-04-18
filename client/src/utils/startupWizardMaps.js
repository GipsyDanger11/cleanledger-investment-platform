/** Mirrors server/utils/registrationMappers.js for the startup registration wizard. */

export function mapWizardCategoryToStartupEnum(sectorLabel) {
  const s = (sectorLabel || '').toLowerCase();
  if (/fintech|fin-tech|bank|payment|lending/.test(s)) return 'FinTech';
  if (/health|med|bio|clinic|pharma/.test(s)) return 'HealthTech';
  if (/edu|learn|school|course/.test(s)) return 'EdTech';
  if (/agri|farm|crop|harvest/.test(s)) return 'AgriTech';
  if (
    /clean|solar|wind|water|carbon|environment|hydrogen|sustain|energy|thermal|green|esg|iot/.test(s)
  ) {
    return 'CleanTech';
  }
  if (/saas|software|b2b\s*saas/.test(s)) return 'SaaS';
  if (/commerce|retail|e-?com|marketplace/.test(s)) return 'E-Commerce';
  return 'Other';
}

const TIMELINE_TO_MODEL = {
  '6_months': '6 months',
  '12_months': '12 months',
  '18_months': '18 months',
  '24_months': '24 months',
  '36_months': '36 months',
};

export function mapFundingTimeline(timelineKey) {
  if (!timelineKey || typeof timelineKey !== 'string') return '12 months';
  return TIMELINE_TO_MODEL[timelineKey.trim()] || '12 months';
}
