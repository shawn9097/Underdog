import type { Metadata } from "next";
import CommunityRoot from "@/components/community/CommunityRoot";
import { BRAND } from "@/lib/album";
import {
  fetchPosts,
  fetchTenantCount,
  fetchWall,
  type WallEntry,
  type WallPost,
} from "@/lib/backend";

export const metadata: Metadata = {
  title: "The Community",
  description: `${BRAND.emailHook} Claim your key, take your number, and put your name on the wall of Underdog City. Tenants unlock ${BRAND.album} on-site before ${BRAND.releaseDateDisplay}.`,
  openGraph: {
    title: `The Community — ${BRAND.artist}`,
    description: `${BRAND.emailHook} We all rule down here.`,
    type: "website",
  },
};

/**
 * The wall is seeded on the server so the roster, the marks, and the tenant
 * count arrive with the first byte — no client fetch fires on a passive page
 * load, and the reader never sees an empty flash. Interactions (claim, mark)
 * still talk to the backend from the client, where failures fall back into
 * honest in-world states.
 */
export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

async function seedWall(): Promise<{
  wall: WallEntry[];
  posts: WallPost[];
  count: number | null;
  seedError: boolean;
}> {
  try {
    const [wall, posts, count] = await Promise.all([
      withTimeout(fetchWall(), 3500),
      withTimeout(fetchPosts(), 3500).catch(() => [] as WallPost[]),
      withTimeout(fetchTenantCount(), 3500).catch(() => null),
    ]);
    return { wall, posts, count, seedError: false };
  } catch {
    // The wall roster itself was unreachable — surface an honest fallback.
    return { wall: [], posts: [], count: null, seedError: true };
  }
}

export default async function Page() {
  const { wall, posts, count, seedError } = await seedWall();
  return (
    <CommunityRoot
      initialWall={wall}
      initialPosts={posts}
      initialCount={count}
      seedError={seedError}
    />
  );
}
