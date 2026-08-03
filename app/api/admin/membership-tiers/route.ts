import { isAdminRequest } from "@/app/admin-auth";
import { membershipTiers } from "@/app/membership";
import { getPool } from "@/db";

type Input = { id?: unknown; name?: unknown; minimumSpend?: unknown; discountPercent?: unknown; sortOrder?: unknown; active?: unknown };
const clean = (item: Input, index: number) => ({
  id: typeof item.id === "string" && /^[a-z0-9-]{3,80}$/i.test(item.id) ? item.id : `tier-${crypto.randomUUID()}`,
  name: typeof item.name === "string" ? item.name.trim().slice(0, 50) : "",
  minimumSpend: Number(item.minimumSpend), discountPercent: Number(item.discountPercent), sortOrder: index, active: item.active !== false,
});
export async function GET(request: Request) { if (!(await isAdminRequest(request))) return Response.json({ ok:false,error:"Unauthorized." },{status:401}); return Response.json({ ok:true, tiers:await membershipTiers() }); }
export async function PUT(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ ok:false,error:"Unauthorized." },{status:401});
  const body = await request.json().catch(() => null) as { tiers?: Input[] } | null;
  const tiers = Array.isArray(body?.tiers) ? body.tiers.map(clean) : [];
  if (!tiers.length || !tiers.some((tier) => tier.active) || tiers.some((tier) => !tier.name || !Number.isInteger(tier.minimumSpend) || tier.minimumSpend < 0 || !Number.isInteger(tier.discountPercent) || tier.discountPercent < 0 || tier.discountPercent > 100)) return Response.json({ ok:false,error:"Add at least one active tier with valid name, spend and discount." },{status:400});
  const activeSpend = tiers.filter((tier) => tier.active).map((tier) => tier.minimumSpend);
  if (new Set(activeSpend).size !== activeSpend.length || new Set(tiers.map((tier) => tier.name.toLowerCase())).size !== tiers.length) return Response.json({ ok:false,error:"Tier names and active minimum spend amounts must be unique." },{status:400});
  const pool = getPool(); const client = await pool.connect();
  try { await client.query("BEGIN"); await client.query("DELETE FROM membership_tiers"); for (const tier of tiers) await client.query("INSERT INTO membership_tiers (id,name,minimum_spend,discount_percent,sort_order,active,updated_at) VALUES ($1,$2,$3,$4,$5,$6,now())",[tier.id,tier.name,tier.minimumSpend,tier.discountPercent,tier.sortOrder,tier.active]); await client.query("COMMIT"); }
  catch { await client.query("ROLLBACK"); return Response.json({ ok:false,error:"Could not save membership tiers." },{status:500}); } finally { client.release(); }
  return Response.json({ ok:true, tiers:await membershipTiers() });
}
