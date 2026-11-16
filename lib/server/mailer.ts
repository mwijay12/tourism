import nodemailer from "nodemailer";

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}

export interface SendMailInput {
  to: string;
  subject: string;
  headline: string;
  greeting?: string;
  bodyParagraphs: string[];
  summaryRows?: { label: string; value: string }[];
  replyTo?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendExpeditionEmail(input: SendMailInput): Promise<{
  sent: boolean;
  messageId?: string;
  reason?: string;
}> {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      reason: "SMTP_HOST / SMTP_USER / SMTP_PASS not configured yet.",
    };
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const summaryHtml =
    input.summaryRows && input.summaryRows.length > 0
      ? `
        <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#0e1c15;border:1px solid #1f392c;border-radius:12px;">
          ${input.summaryRows
            .map(
              (r) => `
                <tr>
                  <td style="padding:10px 14px;border-bottom:1px solid #1a2e23;color:#8aa094;font-size:12px;font-family:monospace;text-transform:uppercase;">${escapeHtml(r.label)}</td>
                  <td style="padding:10px 14px;border-bottom:1px solid #1a2e23;color:#f3f8f5;font-size:13px;font-weight:600;text-align:right;">${escapeHtml(r.value)}</td>
                </tr>`
            )
            .join("")}
        </table>
      `
      : "";

  const html = `
    <div style="background:#060c09;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2eee7;">
      <div style="max-width:600px;margin:0 auto;background:#0b1711;border:1px solid #1e3528;border-radius:20px;overflow:hidden;">
        <div style="padding:26px 28px;border-bottom:1px solid #1a2c22;background:linear-gradient(135deg,#10291d 0%,#08100c 100%);">
          <div style="font-family:monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#e5a853;">
            Kibo &amp; Plains · Arusha &amp; Moshi, Tanzania
          </div>
          <h1 style="margin:10px 0 0;font-size:26px;font-weight:600;color:#ffffff;font-family:Georgia,serif;">
            ${escapeHtml(input.headline)}
          </h1>
        </div>
        <div style="padding:28px;font-size:15px;line-height:1.65;color:#d6e5dc;">
          ${input.greeting ? `<p style="margin-top:0;">${escapeHtml(input.greeting)}</p>` : ""}
          ${input.bodyParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
          ${summaryHtml}
          <p style="margin-top:24px;font-size:13px;color:#8aa094;">
            Direct WhatsApp Concierge: <a href="https://wa.me/255792867427" style="color:#e5a853;">+255 792 867 427</a><br/>
            Digital Experience crafted by Altraware Technology.
          </p>
        </div>
      </div>
    </div>
  `;

  const from =
    process.env.MAIL_FROM ||
    `"Kibo & Plains Tanzania" <${process.env.SMTP_USER}>`;

  const info = await transporter.sendMail({
    from,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    html,
  });

  return { sent: true, messageId: info.messageId };
}
