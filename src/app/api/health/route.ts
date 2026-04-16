export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    status: "ok",
    now: new Date().toISOString(),
  });
}
