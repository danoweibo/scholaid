import { Resend } from "resend";
import type { VerificationEmailOptions } from "@/lib/types";
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "noreply@scholaid.co";
const APP_URL = process.env.BASE_URL ?? "https://scholaid.co";

async function send(
  payload: Parameters<typeof resend.emails.send>[0],
  label: string,
) {
  const { error } = await resend.emails.send(payload);
  if (error) console.error(`[mail] Failed to send "${label}"`, error);
}

export async function sendStudentInvite({
  to,
  token,
  lecturerName,
}: {
  to: string;
  token: string;
  lecturerName: string;
}) {
  const acceptUrl = `${APP_URL}/invites/accept/${token}`;
  await send(
    {
      from: FROM,
      to,
      subject: `${lecturerName} invited you to Scholaid`,
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>You've been invited to Scholaid</h2>
        <p><strong>${lecturerName}</strong> has invited you to join their class.</p>
        <p>This link expires in 72 hours.</p>
        <a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">Accept Invitation</a>
        <p style="color:#666;font-size:13px">If you weren't expecting this, ignore this email.</p>
      </div>`,
    },
    "student-invite",
  );
}

export async function sendLecturerConnectionApproved({
  to,
  lecturerName,
  institutionName,
}: {
  to: string;
  lecturerName: string;
  institutionName: string;
}) {
  await send(
    {
      from: FROM,
      to,
      subject: `Your connection to ${institutionName} has been approved`,
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Connection approved</h2>
        <p>Hi ${lecturerName},</p>
        <p>Your request to connect with <strong>${institutionName}</strong> has been approved.</p>
      </div>`,
    },
    "connection-approved",
  );
}

export async function sendLecturerConnectionInvite({
  to,
  lecturerName,
  institutionName,
  requestId,
}: {
  to: string;
  lecturerName: string;
  institutionName: string;
  requestId: string;
}) {
  const acceptUrl = `${APP_URL}/institutions/requests/${requestId}/accept`;
  await send(
    {
      from: FROM,
      to,
      subject: `${institutionName} wants to connect with you on Scholaid`,
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Institution connection request</h2>
        <p>Hi ${lecturerName},</p>
        <p><strong>${institutionName}</strong> has sent you a connection request.</p>
        <a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">Accept Connection</a>
      </div>`,
    },
    "connection-invite",
  );
}

export async function sendMatricVerificationOutcome({
  to,
  studentName,
  institutionName,
  outcome,
}: {
  to: string;
  studentName: string;
  institutionName: string;
  outcome: "approved" | "rejected";
}) {
  const approved = outcome === "approved";
  await send(
    {
      from: FROM,
      to,
      subject: approved
        ? `Your membership at ${institutionName} has been approved`
        : `Your membership application at ${institutionName} was not approved`,
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>${approved ? "Membership approved" : "Membership not approved"}</h2>
        <p>Hi ${studentName},</p>
        ${
          approved
            ? `<p>Your matric number has been verified. You are now a full member of <strong>${institutionName}</strong>.</p>`
            : `<p>Your submission for <strong>${institutionName}</strong> could not be verified. Please contact the institution.</p>`
        }
      </div>`,
    },
    "matric-outcome",
  );
}

export async function sendStudentUnlinkedNotification({
  to,
  studentName,
  institutionName,
  lecturerName,
}: {
  to: string;
  studentName: string;
  institutionName: string;
  lecturerName: string;
}) {
  await send(
    {
      from: FROM,
      to,
      subject: `Your institution membership at ${institutionName} has changed`,
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Institution membership update</h2>
        <p>Hi ${studentName},</p>
        <p>Your lecturer <strong>${lecturerName}</strong> is no longer connected to <strong>${institutionName}</strong>.</p>
        <p>Your membership has been removed. Please verify your matric number directly with the institution to restore it.</p>
      </div>`,
    },
    "student-unlinked",
  );
}

export async function sendVerificationEmail({
  to,
  name,
  url,
}: VerificationEmailOptions) {
  const firstName = name?.split(" ")[0] ?? "there";

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your Scholaid email address",
    html: buildVerificationHtml({ firstName, url }),
    text: buildVerificationText({ firstName, url }),
  });

  if (error) {
    // Surface the error so better-auth can decide what to do
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

// ── HTML template ────────────────────────────────────────────────────────────

function buildVerificationHtml({
  firstName,
  url,
}: {
  firstName: string;
  url: string;
}) {
  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email – Scholaid</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#18181b;padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                Scholaid
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                Confirm your email address
              </h1>
              <p style="margin:0 0 16px;font-size:15px;color:#52525b;line-height:1.6;">
                Hi ${firstName},
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#52525b;line-height:1.6;">
                Thanks for creating your Scholaid account. Click the button below to verify your email address and get started.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#18181b;">
                    <a
                      href="${url}"
                      target="_blank"
                      style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;"
                    >
                      Verify email address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#a1a1aa;line-height:1.6;">
                This link expires in <strong>24 hours</strong>. If you didn't create a Scholaid account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                Button not working? Paste this link into your browser:<br />
                <a href="${url}" style="color:#52525b;word-break:break-all;">${url}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f4f4f5;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
                © ${new Date().getFullYear()} Scholaid · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Plain-text fallback ───────────────────────────────────────────────────────

function buildVerificationText({
  firstName,
  url,
}: {
  firstName: string;
  url: string;
}) {
  return [
    `Hi ${firstName},`,
    "",
    "Thanks for creating your Scholaid account.",
    "Please verify your email address by visiting the link below:",
    "",
    url,
    "",
    "This link expires in 24 hours.",
    "If you didn't create a Scholaid account, you can safely ignore this email.",
    "",
    "— The Scholaid Team",
  ].join("\n");
}
