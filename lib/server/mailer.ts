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
  templateType?: "welcome" | "invoice" | "quote";
  ctaLabel?: string;
  ctaUrl?: string;
  tripSteps?: { step: string; detail: string }[];
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

  const badgeLabel =
    input.templateType === "welcome"
      ? "KARIBU TANZANIA · OFFICIAL VIP WELCOME PACK"
      : input.templateType === "invoice"
      ? "OFFICIAL EXPEDITION INVOICE & COST BREAKDOWN"
      : "KIBO & PLAINS · ARUSHA & MOSHI CONCIERGE";

  const summaryHtml =
    input.summaryRows && input.summaryRows.length > 0
      ? `
        <table style="width:100%;border-collapse:collapse;margin:22px 0;background:#0e1c15;border:1px solid #224130;border-radius:14px;overflow:hidden;">
          ${input.summaryRows
            .map(
              (r) => `
                <tr>
                  <td style="padding:11px 16px;border-bottom:1px solid #1a2e23;color:#93ab9e;font-size:12px;font-family:monospace;text-transform:uppercase;letter-spacing:0.6px;">${escapeHtml(r.label)}</td>
                  <td style="padding:11px 16px;border-bottom:1px solid #1a2e23;color:#f3f8f5;font-size:13.5px;font-weight:600;text-align:right;">${escapeHtml(r.value)}</td>
                </tr>`
            )
            .join("")}
        </table>
      `
      : "";

  const stepsHtml =
    input.tripSteps && input.tripSteps.length > 0
      ? `
        <div style="margin:24px 0;padding:18px 20px;background:#0c1812;border:1px solid #244533;border-radius:14px;">
          <div style="font-family:monospace;font-size:10.5px;letter-spacing:1.8px;text-transform:uppercase;color:#e5a853;margin-bottom:12px;">
            Pre-Departure Horizon Checklist
          </div>
          ${input.tripSteps
            .map(
              (st, i) => `
                <div style="margin-bottom:${i === input.tripSteps!.length - 1 ? "0" : "10px"};padding-bottom:${i === input.tripSteps!.length - 1 ? "0" : "10px"};border-bottom:${i === input.tripSteps!.length - 1 ? "none" : "1px solid #1a2f24"};">
                  <div style="color:#ffffff;font-weight:600;font-size:13.5px;">0${i + 1}. ${escapeHtml(st.step)}</div>
                  <div style="color:#9eb5a8;font-size:12.5px;margin-top:2px;">${escapeHtml(st.detail)}</div>
                </div>`
            )
            .join("")}
        </div>
      `
      : "";

  const ctaHtml =
    input.ctaLabel && input.ctaUrl
      ? `
        <div style="margin:26px 0 14px;text-align:center;">
          <a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;background:#e5a853;color:#08100c;text-decoration:none;font-weight:700;font-size:13.5px;padding:13px 28px;border-radius:999px;letter-spacing:0.3px;">
            ${escapeHtml(input.ctaLabel)} &rarr;
          </a>
        </div>
      `
      : "";

  const html = `
    <div style="background:#050b08;padding:34px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e2eee7;">
      <div style="max-width:620px;margin:0 auto;background:#0b1711;border:1px solid #234131;border-radius:22px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.45);">
        <div style="padding:30px 30px 26px;border-bottom:1px solid #1f392c;background:radial-gradient(circle at 90% 10%,rgba(229,168,83,0.22),transparent 42%),linear-gradient(145deg,#112c1f 0%,#08100c 100%);">
          <div style="font-family:monospace;font-size:10.5px;letter-spacing:2.2px;text-transform:uppercase;color:#e5a853;">
            ${badgeLabel}
          </div>
          <h1 style="margin:12px 0 6px;font-size:28px;line-height:1.15;font-weight:600;color:#ffffff;font-family:Georgia,serif;">
            ${escapeHtml(input.headline)}
          </h1>
          <div style="font-size:12px;color:#8eb79f;font-family:monospace;">
            3°04′S · 37°21′E · Uhuru Peak &amp; Northern Tanzania Circuit
          </div>
        </div>
        <div style="padding:30px;font-size:15px;line-height:1.68;color:#d8e6de;">
          ${input.greeting ? `<p style="margin-top:0;font-size:16px;color:#ffffff;font-weight:500;">${escapeHtml(input.greeting)}</p>` : ""}
          ${input.bodyParagraphs.map((p) => `<p style="margin:0 0 14px;">${escapeHtml(p)}</p>`).join("")}
          ${summaryHtml}
          ${stepsHtml}
          ${ctaHtml}
          <div style="margin-top:28px;padding-top:18px;border-top:1px solid #1a2d23;font-size:12.5px;color:#8aa094;line-height:1.6;">
            <strong style="color:#d8e6de;">Direct Arusha Expedition Desk:</strong>
            WhatsApp <a href="https://wa.me/255792867427" style="color:#e5a853;text-decoration:none;">+255 792 867 427</a> ·
            Client Portal: <a href="https://kibo-plains-tanzania.vercel.app/portal" style="color:#62b388;text-decoration:none;">kibo-plains-tanzania.vercel.app/portal</a><br/>
            TANAPA · TALA · KPAP Fair-Wage Certified · Digital suite engineered by Altraware Technology.
          </div>
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
