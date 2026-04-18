/**
 * Maps registration wizard values to persisted model shapes.
 */

const INVESTMENT_RANGE_TICKETS = {
  under_50k: { minTicket: 0, maxTicket: 50_000 },
  '50k_250k': { minTicket: 50_000, maxTicket: 250_000 },
  '250k_1m': { minTicket: 250_000, maxTicket: 1_000_000 },
  '1m_5m': { minTicket: 1_000_000, maxTicket: 5_000_000 },
  over_5m: { minTicket: 5_000_000, maxTicket: 50_000_000 },
};

const TIMELINE_TO_MODEL = {
  '6_months': '6 months',
  '12_months': '12 months',
  '18_months': '18 months',
  '24_months': '24 months',
  '36_months': '36 months',
};

function ticketsFromInvestmentRange(rangeKey) {
  if (!rangeKey || typeof rangeKey !== 'string') return {};
  return INVESTMENT_RANGE_TICKETS[rangeKey.trim()] || {};
}

/** Map free-text sector label to Startup.category enum. */
function mapWizardCategoryToStartupEnum(sectorLabel) {
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

function mapFundingTimeline(timelineKey) {
  if (!timelineKey || typeof timelineKey !== 'string') return '12 months';
  return TIMELINE_TO_MODEL[timelineKey.trim()] || '12 months';
}

function parseJsonArray(maybe) {
  if (maybe == null) return [];
  if (Array.isArray(maybe)) return maybe;
  if (typeof maybe === 'string') {
    try {
      const p = JSON.parse(maybe);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

function sanitizeTeamMembersForUser(arr) {
  return parseJsonArray(arr)
    .filter((t) => t && String(t.name || '').trim())
    .map((t) => ({
      name: String(t.name).trim(),
      role: (t.role && String(t.role).trim()) || '',
      linkedIn: (t.linkedIn && String(t.linkedIn).trim()) || '',
    }));
}

function sanitizeMilestonesForUser(arr) {
  return parseJsonArray(arr)
    .filter((m) => m && String(m.title || '').trim())
    .map((m) => ({
      title: String(m.title).trim(),
      targetDate: m.targetDate ? new Date(m.targetDate) : undefined,
      description: (m.description && String(m.description)) || '',
    }));
}

function sanitizeTeamMembersForStartup(arr) {
  return sanitizeTeamMembersForUser(arr).map((t) => ({
    name: t.name,
    role: t.role || undefined,
    linkedIn: t.linkedIn || undefined,
  }));
}

function sanitizeMilestonesForStartup(arr) {
  return parseJsonArray(arr)
    .filter((m) => m && String(m.title || '').trim())
    .map((m) => ({
      title: String(m.title).trim(),
      description: (m.description && String(m.description).trim()) || '',
      targetDate: m.targetDate ? new Date(m.targetDate) : undefined,
      successCriteria: (m.successCriteria && String(m.successCriteria).trim()) || '',
      tranchePct: Math.min(100, Math.max(0, Number(m.tranchePct) || 0)),
      status: 'pending',
    }));
}

module.exports = {
  ticketsFromInvestmentRange,
  mapWizardCategoryToStartupEnum,
  mapFundingTimeline,
  sanitizeTeamMembersForUser,
  sanitizeMilestonesForUser,
  sanitizeTeamMembersForStartup,
  sanitizeMilestonesForStartup,
  parseJsonArray,
};
