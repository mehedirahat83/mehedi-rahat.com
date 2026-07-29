import type { Pool } from "pg";

type MailKind = "order_received" | "admin_new_order" | "order_status";

type MailInput = {
  db: Pick<Pool, "query">;
  orderId: string;
  kind: MailKind;
  recipient: string;
  subject: string;
  html: string;
};

function runtimeEnv() {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ORDER_FROM_EMAIL: process.env.ORDER_FROM_EMAIL,
  };
}

export async function queueAndSendOrderEmail(input: MailInput) {
  const createdAt = new Date().toISOString();
  const outboxId = crypto.randomUUID();
  await input.db.query(
    `INSERT INTO email_outbox
     (id, order_id, kind, recipient, subject, status, attempts, created_at)
     VALUES ($1, $2, $3, $4, $5, 'queued', 0, $6)`,
    [
      outboxId,
      input.orderId,
      input.kind,
      input.recipient,
      input.subject,
      createdAt,
    ],
  );

  const settings = runtimeEnv();
  if (!settings.RESEND_API_KEY || !settings.ORDER_FROM_EMAIL) {
    await input.db.query(
      "UPDATE email_outbox SET status = 'not_configured', last_error = $1 WHERE id = $2",
      ["Email credentials are not configured.", outboxId],
    );
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
    if (!response.ok) {
      throw new Error(
        result.message || "Email provider rejected the request.",
      );
    }
    await input.db.query(
      `UPDATE email_outbox
       SET status = 'sent', provider_id = $1, attempts = 1, sent_at = $2
       WHERE id = $3`,
      [result.id ?? null, new Date().toISOString(), outboxId],
    );
  } catch (error) {
    await input.db.query(
      `UPDATE email_outbox
       SET status = 'failed', attempts = 1, last_error = $1
       WHERE id = $2`,
      [
        error instanceof Error ? error.message : "Unknown email error",
        outboxId,
      ],
    );
  }
}

export function orderEmailHtml(
  heading: string,
  orderNumber: string,
  message: string,
  total: number,
) {
  const safe = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[char] as string,
    );
  return `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#102033">
    <h2>${safe(heading)}</h2>
    <p>${safe(message)}</p>
    <p><strong>Order:</strong> ${safe(orderNumber)}<br>
    <strong>Total:</strong> ৳${total.toLocaleString("en-US")}</p>
    <p style="color:#607080">Mehedi Rahat · Digital Growth Partner</p>
  </div>`;
}
