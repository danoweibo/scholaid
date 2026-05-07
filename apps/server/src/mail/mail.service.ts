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

  /**
   * Sends a student enrolment invite from a lecturer.
   * The accept link points to the frontend which handles the accept flow.
   */
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
          <p>Click the button below to accept your invitation. This link expires in 72 hours.</p>
          <a
            href="${acceptUrl}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background: #1a1a1a;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
              margin: 16px 0;
            "
          >
            Accept Invitation
          </a>
          <p style="color: #666; font-size: 13px;">
            If you weren't expecting this invite, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      this.logger.error(`Failed to send invite email to ${to}`, error);
      // Don't throw — the invite row is already created. The lecturer can
      // resend manually. Throwing here would surface a confusing 500 to the
      // lecturer for what is an email provider issue.
    }
  }
}
