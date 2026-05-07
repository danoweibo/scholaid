// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendInvite(to: string, token: string, lecturerName: string) {
    await this.resend.emails.send({
      from: 'Scholaid <invites@scholaid.app>',
      to,
      subject: `${lecturerName} invited you to Scholaid`,
      html: `<p>Click to accept: ${process.env.APP_URL}/invites/accept/${token}</p>`,
    });
  }
}
