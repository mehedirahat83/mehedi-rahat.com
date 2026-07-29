import { env } from "cloudflare:workers";

type D1StatementLike = {
  bind(...values: unknown[]): D1StatementLike;
  run(): Promise<unknown>;
};

type D1DatabaseLike = {
  prepare(sql: string): D1StatementLike;
};

type MailKind = "order_received" | "admin_new_order" | "order_status";

type MailInput = {
  db: D1DatabaseLike;
  orderId: string;
  kind: MailKind;
  recipient: string;
  subject: string;
  html: string;
};

function runtimeEnv() {
  return env as unknown as {
    RESEND_API_KEY?: string;
    ORDER_FROM_EMAIL?: string;
  };
}

export async function queueAndSendOrderEmail(input: MailInput) {
  const createdAt = new Date().toISOString();
  const outboxId = crypto.randomUUID();
  await input.db
    .prepare(
      `INSERT INTO email_outbox
       (id, order_id, kind, recipient, subject, status, attempts, created_at)
       VALUES (?, ?, ?, ?, ?, 'queued', 0, ?)`,
    )
    .bind(outboxId, input.orderId, input.kind, input.recipient, input.subject, createdAt)
    .run();

  const settings = runtimeEnv();
  if (!settings.RESEND_API_KEY || !settings.ORDER_FROM_EMAIL) {
    if (outboxId) {
      await input.db
        .prepare(
          "UPDATE email_outbox SET status = 'not_configured', last_error = ? WHERE id = ?",
        )
        .bind("Email credentials are not configured.", outboxId)
        .run();
    }
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: settings.ORDER_FROM_EMAIL,
        to: [input.recipient],
        subject: input.subject,
        html: input.html,
      }),
    });
    const result = (await response.json()) as { id?: string; message?: string };
    if (!response.ok) throw new Error(result.message || "Email provider rejected the request.");
    if (outboxId) {
      await input.db
        .prepare(
          `UPDATE email_outbox
           SET status = 'sent', provider_id = ?, attempts = 1, sent_at = ?
           WHERE id = ?`,
        )
        .bind(result.id ?? null, new Date().toISOString(), outboxId)
        .run();
    }
  } catch (error) {
    if (outboxId) {
      await input.db
        .prepare(
          `UPDATE email_outbox
           SET status = 'failed', attempts = 1, last_error = ?
           WHERE id = ?`,
        )
        .bind(error instanceof Error ? error.message : "Unknown email error", outboxId)
        .run();
    }
  }
}

export function orderEmailHtml(
  heading: string,
  orderNumber: string,
  message: string,
  total: number,
) {
  const safe = (value: string) =>
    value.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[char] as string);
  return `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#102033">
    <h2>${safe(heading)}</h2>
    <p>${safe(message)}</p>
    <p><strong>Order:</strong> ${safe(orderNumber)}<br>
    <strong>Total:</strong> ৳${total.toLocaleString("en-US")}</p>
    <p style="color:#607080">Mehedi Rahat · Digital Growth Partner</p>
  </div>`;
}
