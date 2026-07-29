import { getPool } from "../../../db";
import { isAdminRequest } from "../../admin-auth";

type RuntimeEnv = {
  RESEND_API_KEY?: string;
  ENQUIRY_NOTIFICATION_EMAIL?: string;
  ENQUIRY_FROM_EMAIL?: string;
};

const statuses = ["new", "in_progress", "replied", "closed"] as const;

function runtime(): RuntimeEnv {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ENQUIRY_NOTIFICATION_EMAIL: process.env.ENQUIRY_NOTIFICATION_EMAIL,
    ENQUIRY_FROM_EMAIL: process.env.ENQUIRY_FROM_EMAIL,
  };
}

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

async function sendNotification(
  config: RuntimeEnv,
  enquiry: {
    name: string;
    email: string;
    mobile: string;
    service: string;
    details: string;
  },
) {
  if (
    !config.RESEND_API_KEY ||
    !config.ENQUIRY_NOTIFICATION_EMAIL ||
    !config.ENQUIRY_FROM_EMAIL
  ) {
    return "not_configured";
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.ENQUIRY_FROM_EMAIL,
        to: [config.ENQUIRY_NOTIFICATION_EMAIL],
        reply_to: enquiry.email,
        subject: `New website enquiry: ${enquiry.service} - ${enquiry.name}`,
        html: `<h2>New website enquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(enquiry.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(enquiry.email)}</p>
          <p><strong>Mobile:</strong> ${escapeHtml(enquiry.mobile)}</p>
          <p><strong>Service:</strong> ${escapeHtml(enquiry.service)}</p>
          <p><strong>Details:</strong><br>${escapeHtml(enquiry.details).replace(/\n/g, "<br>")}</p>`,
      }),
    });
    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (clean(body.companyWebsite, 100)) {
      return Response.json({ ok: true }, { status: 201 });
    }

    const enquiry = {
      name: clean(body.name, 120),
      email: clean(body.email, 180).toLowerCase(),
      mobile: clean(body.mobile, 40),
      service: clean(body.service, 120),
      details: clean(body.details, 5000),
    };

    if (
      !enquiry.name ||
      !enquiry.mobile ||
      !enquiry.service ||
      enquiry.details.length < 10 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)
    ) {
      return Response.json(
        {
          ok: false,
          error: "Please complete every field with valid information.",
        },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    const db = getPool();
    await db.query(
      `INSERT INTO enquiries
        (id,name,email,mobile,service,details,status,source_path,email_status,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,'new','/contact','pending',$7,$8)`,
      [
        id,
        enquiry.name,
        enquiry.email,
        enquiry.mobile,
        enquiry.service,
        enquiry.details,
        now,
        now,
      ],
    );

    const emailStatus = await sendNotification(runtime(), enquiry);
    await db.query(
      "UPDATE enquiries SET email_status=$1,updated_at=$2 WHERE id=$3",
      [emailStatus, Date.now(), id],
    );

    return Response.json({ ok: true, id, emailStatus }, { status: 201 });
  } catch (error) {
    console.error("Enquiry submission failed", error);
    return Response.json(
      {
        ok: false,
        error: "Your enquiry could not be submitted. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return Response.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  try {
    const result = await getPool().query(
      `SELECT id,name,email,mobile,service,details,status,
        source_path,email_status,created_at,updated_at
       FROM enquiries ORDER BY created_at DESC LIMIT 500`,
    );
    const enquiries = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      mobile: row.mobile,
      service: row.service,
      details: row.details,
      status: row.status,
      sourcePath: row.source_path,
      emailStatus: row.email_status,
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }));
    return Response.json({ ok: true, enquiries });
  } catch (error) {
    console.error("Enquiry list failed", error);
    return Response.json(
      { ok: false, error: "Enquiries could not be loaded." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) {
    return Response.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = clean(body.id, 100);
    const status = clean(body.status, 40);
    if (!id || !statuses.includes(status as (typeof statuses)[number])) {
      return Response.json(
        { ok: false, error: "Invalid enquiry status." },
        { status: 400 },
      );
    }

    await getPool().query(
      "UPDATE enquiries SET status=$1,updated_at=$2 WHERE id=$3",
      [status, Date.now(), id],
    );
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Enquiry update failed", error);
    return Response.json(
      { ok: false, error: "Enquiry status could not be updated." },
      { status: 500 },
    );
  }
}
