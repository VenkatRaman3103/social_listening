export interface PlanLimits {
  keywords: number;
  articles: number;
  features: string[];
  price: number;
  name: string;
  description: string;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    keywords: 2,
    articles: 100,
    features: [
      'Basic keyword monitoring',
      'Email notifications',
      'Basic analytics'
    ],
    price: 0,
    name: 'Free',
    description: 'Perfect for getting started'
  },
  pro: {
    keywords: 3,
    articles: 500,
    features: [
      'Advanced keyword monitoring',
      'Real-time notifications',
      'Advanced analytics',
      'Priority support'
    ],
    price: 29,
    name: 'Pro',
    description: 'For growing businesses'
  },
  enterprise: {
    keywords: 5,
    articles: 2000,
    features: [
      'Unlimited keyword monitoring',
      'Custom integrations',
      'Advanced analytics & reporting',
      'Dedicated support',
      'Custom dashboards'
    ],
    price: 99,
    name: 'Enterprise',
    description: 'For large organizations'
  }
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function canAddKeyword(currentKeywords: number, plan: string): boolean {
  const limits = getPlanLimits(plan);
  return currentKeywords < limits.keywords;
}

export function getRemainingKeywords(currentKeywords: number, plan: string): number {
  const limits = getPlanLimits(plan);
  return Math.max(0, limits.keywords - currentKeywords);
}

export function getPlanUpgradeMessage(plan: string): string {
  switch (plan) {
    case 'free':
      return 'Upgrade to Pro to monitor up to 3 keywords';
    case 'pro':
      return 'Upgrade to Enterprise to monitor up to 5 keywords';
    case 'enterprise':
      return 'You have the maximum plan with 5 keywords';
    default:
      return 'Upgrade your plan to monitor more keywords';
  }
}
