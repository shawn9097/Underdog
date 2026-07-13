import type { Metadata } from "next";
import { BRAND } from "@/lib/album";
import { fetchTenantCount } from "@/lib/backend";
import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: `${BRAND.artist} — ${BRAND.album}`,
  description: `${BRAND.artist}: a dark-fantasy music world. The debut album ${BRAND.album} is out ${BRAND.releaseDateDisplay} on ${BRAND.label}. ${BRAND.manifesto}`,
};

// The ledger is live — read it fresh each request, never at build time.
export const dynamic = "force-dynamic";

/**
 * Seed the real tenant count on the server (egress works there) so the
 * number paints instantly and the browser makes no cross-origin call.
 * Guarded + time-boxed: if the ledger is slow or unreachable, we hand the
 * client `null` and it falls back to fetching after mount, then to the
 * honest "the ledger is open" state. Never blocks SSR, never fakes a number.
 */
async function seedTenantCount(): Promise<number | null> {
  try {
    const n = await Promise.race<number | null>([
      fetchTenantCount(),
      new Promise<null>((r) => setTimeout(() => r(null), 2500)),
    ]);
    const num = Number(n);
    return Number.isFinite(num) && num > 0 ? num : null;
  } catch {
    return null;
  }
}

export default async function Page() {
  const initialTenantCount = await seedTenantCount();
  return <HomePage initialTenantCount={initialTenantCount} />;
}
