/**
 * UNDERDOG CITY — backend client (Supabase project `underdog-city`).
 *
 * Plain-fetch client: no SDK dependency. The URL and anon key below are
 * public by design — every privilege is enforced server-side by RLS,
 * column-level grants, and SECURITY DEFINER RPCs:
 *   - tenants: safe columns readable (the wall); tenant_key unreadable.
 *   - tenant_contacts (emails): fully private, INSERT via RPC only.
 *   - posts: non-hidden readable; writes only via leave_mark() with a
 *     valid deed_id + tenant_key pair, guarded by rate-limit/link/slur
 *     triggers in the database.
 *   - masters bucket: private; playback URLs only via the `unlock`
 *     edge function (fan-gate, not DRM).
 */

export const SUPABASE_URL = "https://dnvynfthisoctkjayxuc.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudnluZnRoaXNvY3RramF5eHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4OTMxMTgsImV4cCI6MjA5OTQ2OTExOH0.3IJTyHJ7rKsgQXBkVA9bXjZRT_-Bkhm-e-P4LFbyg5k";

const HEADERS: Record<string, string> = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export interface WallEntry {
  tenant_number: number;
  alias: string;
  deed_id: string;
  depth: number;
  created_at: string;
}

export interface WallPost {
  id: string;
  alias: string;
  tenant_number: number;
  body: string;
  created_at: string;
}

export interface ClaimResult {
  tenant_number: number;
  tenant_key: string;
  deed_id: string;
}

export interface UnlockResult {
  released: boolean;
  ttl: number;
  /** slug → short-lived signed URL; contains only tracks whose masters exist. */
  tracks: Record<string, string>;
}

/** Thrown for expected, user-facing failures (dup email, rate limit, etc.). */
export class BackendError extends Error {
  readonly code: string;
  constructor(message: string, code = "backend") {
    super(message);
    this.code = code;
  }
}

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    let message = `request failed (${res.status})`;
    try {
      const err = (await res.json()) as { message?: string; code?: string };
      if (err.message) message = err.message;
      throw new BackendError(message, err.code ?? String(res.status));
    } catch (e) {
      if (e instanceof BackendError) throw e;
      throw new BackendError(message, String(res.status));
    }
  }
  return (await res.json()) as T;
}

/** Claim a tenancy: writes tenant + private email, returns the caller's own credentials. */
export async function claimTenancy(input: {
  alias: string;
  email: string;
  seed: number;
  bitting: number[];
  deedId: string;
  depth: number;
}): Promise<ClaimResult> {
  const rows = await rpc<ClaimResult[]>("claim_tenancy", {
    p_alias: input.alias,
    p_email: input.email,
    p_seed: input.seed,
    p_bitting: input.bitting,
    p_deed_id: input.deedId,
    p_depth: input.depth,
  });
  const row = rows[0];
  if (!row) throw new BackendError("claim returned nothing");
  return row;
}

/** Leave a mark on the wall. Requires the tenant's own deed + key. */
export async function leaveMark(
  deedId: string,
  tenantKey: string,
  body: string,
): Promise<{ id: string; created_at: string }> {
  const rows = await rpc<{ id: string; created_at: string }[]>("leave_mark", {
    p_deed_id: deedId,
    p_tenant_key: tenantKey,
    p_body: body,
  });
  const row = rows[0];
  if (!row) throw new BackendError("mark returned nothing");
  return row;
}

/** Live tenant count for the front door. */
export async function fetchTenantCount(): Promise<number> {
  return rpc<number>("get_tenant_count", {});
}

/** Newest names on the wall. */
export async function fetchWall(limit = 60): Promise<WallEntry[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/public_wall?select=*&limit=${limit}`,
    { headers: HEADERS },
  );
  if (!res.ok) throw new BackendError(`wall unavailable (${res.status})`);
  return (await res.json()) as WallEntry[];
}

/** Recent visible marks. */
export async function fetchPosts(limit = 40): Promise<WallPost[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?select=id,alias,tenant_number,body,created_at&order=created_at.desc&limit=${limit}`,
    { headers: HEADERS },
  );
  if (!res.ok) throw new BackendError(`posts unavailable (${res.status})`);
  return (await res.json()) as WallPost[];
}

/**
 * Request signed playback URLs. Pre-release this requires a claimed key;
 * after 07.31.2026 the function unlocks for everyone.
 */
export async function unlockAlbum(credentials?: {
  deedId: string;
  tenantKey: string;
}): Promise<UnlockResult> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/unlock`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(
      credentials
        ? { deed_id: credentials.deedId, tenant_key: credentials.tenantKey }
        : {},
    ),
  });
  if (res.status === 401) throw new BackendError("locked", "locked");
  if (!res.ok) throw new BackendError(`unlock failed (${res.status})`);
  return (await res.json()) as UnlockResult;
}

/** Fire-and-forget Beehiiv sync; the claim already stored the email safely. */
export function subscribeEmail(email: string): void {
  void fetch(`${SUPABASE_URL}/functions/v1/subscribe`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ email }),
  }).catch(() => {
    /* non-fatal by design */
  });
}
