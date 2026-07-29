import {
  adminSessionCookie,
  clearAdminSessionCookie,
  createAdminSession,
  isAdminLoginConfigured,
  isAdminRequest,
} from "../../../admin-auth";

export async function GET(request: Request) {
  return Response.json({
    authenticated: await isAdminRequest(request),
    configured: isAdminLoginConfigured(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  if (!body?.email || !body.password) {
    return Response.json(
      { ok: false, message: "Email and password are required." },
      { status: 400 },
    );
  }

  const token = await createAdminSession(body.email, body.password);
  if (!token) {
    return Response.json(
      { ok: false, message: "The email or password is incorrect." },
      { status: 401 },
    );
  }

  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": adminSessionCookie(token) } },
  );
}

export async function DELETE() {
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": clearAdminSessionCookie() } },
  );
}
