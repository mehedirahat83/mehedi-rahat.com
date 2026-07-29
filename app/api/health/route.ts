export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "mehedi-rahat.com",
    timestamp: new Date().toISOString(),
  });
}
