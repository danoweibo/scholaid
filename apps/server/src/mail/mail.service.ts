import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly appUrl: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.getOrThrow<string>('RESEND_API_KEY'));
    this.from = this.config.getOrThrow<string>('RESEND_FROM');
    this.appUrl = this.config.getOrThrow<string>('APP_URL');
  }

  async sendStudentInvite({
    to,
    token,
    lecturerName,
  }: {
    to: string;
    token: string;
    lecturerName: string;
  }): Promise<void> {
    const acceptUrl = `${this.appUrl}/invites/accept/${token}`;

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `${lecturerName} invited you to Scholaid`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>You've been invited to Scholaid</h2>
          <p><strong>${lecturerName}</strong> has invited you to join their class on Scholaid.</p>
          <p>Click the button below to accept. This link expires in 72 hours.</p>
          <a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">
            Accept Invitation
          </a>
          <p style="color:#666;font-size:13px;">If you weren't expecting this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send invite email to ${to}`, error);
    }
  }

  async sendLecturerConnectionApproved({
    to,
    lecturerName,
    institutionName,
  }: {
    to: string;
    lecturerName: string;
    institutionName: string;
  }): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Your connection to ${institutionName} has been approved`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Connection approved</h2>
          <p>Hi ${lecturerName},</p>
          <p>Your request to connect with <strong>${institutionName}</strong> has been approved. You are now a verified lecturer under this institution.</p>
        </div>
      `,
    });
    if (error)
      this.logger.error(`Failed to send connection approval to ${to}`, error);
  }

  async sendLecturerConnectionInvite({
    to,
    lecturerName,
    institutionName,
    requestId,
  }: {
    to: string;
    lecturerName: string;
    institutionName: string;
    requestId: string;
  }): Promise<void> {
    const acceptUrl = `${this.appUrl}/institutions/requests/${requestId}/accept`;

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `${institutionName} wants to connect with you on Scholaid`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Institution connection request</h2>
          <p>Hi ${lecturerName},</p>
          <p><strong>${institutionName}</strong> has sent you a connection request on Scholaid.</p>
          <p>If you accept, you will become a verified lecturer under this institution.</p>
          <a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">
            Accept Connection
          </a>
          <p style="color:#666;font-size:13px;">If you weren't expecting this, you can safely ignore this email.</p>
        </div>
      `,
    });
    if (error)
      this.logger.error(`Failed to send connection invite to ${to}`, error);
  }

  async sendStudentUnlinkedNotification({
    to,
    studentName,
    institutionName,
    lecturerName,
  }: {
    to: string;
    studentName: string;
    institutionName: string;
    lecturerName: string;
  }): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Your institution membership at ${institutionName} has changed`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Institution membership update</h2>
          <p>Hi ${studentName},</p>
          <p>Your lecturer <strong>${lecturerName}</strong> is no longer connected to <strong>${institutionName}</strong>, and you were exclusively enrolled under them.</p>
          <p>As a result, your membership with ${institutionName} has been removed. To restore it, you will need to verify your matric number directly with the institution.</p>
          <p>If you have questions, please contact ${institutionName} directly.</p>
        </div>
      `,
    });
    if (error)
      this.logger.error(`Failed to send unlink notification to ${to}`, error);
  }
}
