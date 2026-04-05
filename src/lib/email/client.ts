import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const FROM_EMAIL = "Trust the Local <noreply@trustthelocal.it>";
const SUPPORT_EMAIL = "support@trustthelocal.it";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    replyTo: replyTo || SUPPORT_EMAIL,
  });

  if (error) {
    console.error("[Email] Failed to send:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}
