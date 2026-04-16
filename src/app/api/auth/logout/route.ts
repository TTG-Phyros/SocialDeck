import { clearSessionCookie } from "@/lib/auth";
import { ok } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  await clearSessionCookie();
  return ok({ loggedOut: true });
}
