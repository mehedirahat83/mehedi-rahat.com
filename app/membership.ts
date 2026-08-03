import { getPool } from "@/db";

export type MembershipTier = { id: string; name: string; minimumSpend: number; discountPercent: number; sortOrder: number; active: boolean };

const defaults: MembershipTier[] = [
  { id: "tier-silver", name: "Silver", minimumSpend: 0, discountPercent: 0, sortOrder: 0, active: true },
  { id: "tier-gold", name: "Gold", minimumSpend: 10000, discountPercent: 10, sortOrder: 1, active: true },
  { id: "tier-diamond", name: "Diamond", minimumSpend: 50000, discountPercent: 20, sortOrder: 2, active: true },
  { id: "tier-vip", name: "VIP", minimumSpend: 100000, discountPercent: 30, sortOrder: 3, active: true },
];

export async function membershipTiers() {
  try {
    const result = await getPool().query('SELECT id,name,minimum_spend AS "minimumSpend",discount_percent AS "discountPercent",sort_order AS "sortOrder",active FROM membership_tiers WHERE active=true ORDER BY minimum_spend,sort_order');
    return result.rows.length ? result.rows.map((row) => ({ ...row, minimumSpend: Number(row.minimumSpend), discountPercent: Number(row.discountPercent), active: Boolean(row.active) })) as MembershipTier[] : defaults;
  } catch { return defaults; }
}

export async function membershipFor(spend: number) {
  const tiers = await membershipTiers();
  const current = [...tiers].reverse().find((tier) => spend >= tier.minimumSpend) || tiers[0];
  const next = tiers.find((tier) => tier.minimumSpend > spend);
  const remaining = next ? Math.max(0, next.minimumSpend - spend) : 0;
  return { current, next, remaining, tiers, level: current.name, discount: `${current.discountPercent}% discount`, nextLabel: next ? `৳ ${remaining.toLocaleString("en-US")} to ${next.name}` : "Highest membership level" };
}
