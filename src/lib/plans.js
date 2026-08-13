export const formatIdr = (amount) =>
  amount
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(amount)
    : "Price unavailable";

const yearlySavingsPercent = (prices) => {
  const { monthlyAmount, yearlyAmount } = prices;
  if (!monthlyAmount || !yearlyAmount) return null;
  const percent = Math.round(
    (1 - yearlyAmount / (monthlyAmount * 12)) * 100
  );
  return percent > 0 ? percent : null;
};

export const PLANS = [
  {
    id: "trial",
    name: "Free Trial",
    price: () => "Free",
    period: (prices) => `for ${prices.trialDays ?? 14} days`,
    badge: () => "No payment required",
    submitLabel: "Start Free Trial",
    benefits: [
      "AI ticket classification & priority engine",
      "Duplicate & similar ticket detection",
      "Ticket management for all roles",
      "Live monitoring dashboard",
      "Email support",
    ],
  },
  {
    id: "monthly",
    name: "Monthly",
    price: (prices) => formatIdr(prices.monthlyAmount),
    period: () => "/month",
    badge: () => null,
    submitLabel: "Continue to Payment",
    benefits: [
      "Everything in Free Trial",
      "SLA management & escalation rules",
      "Performance & analytics reports",
      "Unlimited tickets & all team roles",
      "Custom priority, status & tiers",
      "Priority email support",
      "Scheduled data export",
    ],
  },
  {
    id: "yearly",
    name: "Yearly",
    price: (prices) => formatIdr(prices.yearlyAmount),
    period: () => "/year",
    badge: (prices) => {
      const percent = yearlySavingsPercent(prices);
      return percent ? `Save ${percent}%` : "Best value";
    },
    submitLabel: "Continue to Payment",
    featured: true,
    benefits: [
      "Everything in Monthly",
      "Lowest price per month",
      "Priority email support",
      "Best value for growing teams",
    ],
  },
];
