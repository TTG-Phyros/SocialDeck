import { getSessionUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return fail("Non autorise.", 401);
  }

  return ok({ user });
}
