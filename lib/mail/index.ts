import { Resend } from "resend";

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
