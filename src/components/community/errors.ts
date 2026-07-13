/**
 * Translate raw backend failures into the city's own voice.
 *
 * Every string the server can throw was mapped by hand against the live
 * Supabase RPCs (claim_tenancy / leave_mark). Network failures are kept
 * distinct so the UI can offer an honest retry instead of pretending the
 * mark was lost.
 */
import { BackendError } from "@/lib/backend";

export type MarkErrorKind =
  | "link"
  | "slur"
  | "rate"
  | "key"
  | "length"
  | "network"
  | "unknown";

export type ClaimErrorKind = "dup" | "network" | "unknown";

/** Is this a "couldn't reach the city" failure rather than a rule rejection? */
function isNetwork(err: unknown): boolean {
  if (err instanceof BackendError) {
    // Rule rejections carry Postgres codes (P0001 / 23xxx). Transport and
    // gateway failures surface as numeric HTTP status codes.
    return /^\d{3}$/.test(err.code) || err.code === "backend";
  }
  return true; // TypeError: Failed to fetch, aborts, etc.
}

/** Describe a leave_mark() failure in-world. */
export function describeMarkError(err: unknown): { message: string; kind: MarkErrorKind } {
  const raw = err instanceof Error ? err.message.toLowerCase() : "";
  if (raw.includes("link")) return { message: "No links on the wall.", kind: "link" };
  if (raw.includes("does not fly"))
    return { message: "That does not fly down here.", kind: "slur" };
  if (raw.includes("rate limit"))
    return {
      message: "The wall needs time to dry — three marks an hour.",
      kind: "rate",
    };
  if (raw.includes("invalid key"))
    return { message: "That key doesn't fit this lock.", kind: "key" };
  if (raw.includes("body_check") || raw.includes("check constraint") || raw.includes("280"))
    return { message: "Too long for the wall — 280 marks at most.", kind: "length" };
  if (isNetwork(err))
    return {
      message: "The wall's out of reach. Your mark is safe — try again.",
      kind: "network",
    };
  return { message: "The wall refused that one. Try again.", kind: "unknown" };
}

/** Describe a claim_tenancy() failure in-world. */
export function describeClaimError(err: unknown): { message: string; kind: ClaimErrorKind } {
  const raw = err instanceof Error ? err.message.toLowerCase() : "";
  if (raw.includes("already holds a key") || raw.includes("duplicate"))
    return { message: "This name is already on the ledger.", kind: "dup" };
  if (isNetwork(err))
    return {
      message: "Couldn't reach the city ledger. Your name is safe — sign again.",
      kind: "network",
    };
  return { message: "The ledger refused the signing. Try again.", kind: "unknown" };
}
