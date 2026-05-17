import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  return resend.emails.send({
    from: 'Krostio <noreply@email.suprbuild.com>',
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Krostio',
    html: `<html><body style="font-family: 'Sofia Sans', system-ui, sans-serif; background: #eeece7; padding: 40px;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 22px; padding: 40px;">
        <h1 style="font-weight: 500; letter-spacing: -0.02em; font-size: 28px; color: #17171c;">Welcome to Krostio, ${userName}!</h1>
        <p style="color: #17171c/70; line-height: 1.6;">Your financial identity platform is ready. Connect your first gig platform to start building your Krost Score.</p>
        <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/onboarding" 
           style="display: inline-block; background: #17171c; color: #eeece7; padding: 14px 32px; border-radius: 32px; text-decoration: none; font-weight: 500; margin-top: 24px;">
          Get Started
        </a>
      </div>
    </body></html>`,
  });
}

export async function sendReportSharedEmail(recipientEmail: string, shareUrl: string, senderName: string) {
  return sendEmail({
    to: recipientEmail,
    subject: `${senderName} shared their Krost Report with you`,
    html: `<html><body style="font-family: 'Sofia Sans', system-ui, sans-serif; background: #eeece7; padding: 40px;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 22px; padding: 40px;">
        <h1 style="font-weight: 500; letter-spacing: -0.02em; font-size: 28px; color: #17171c;">Income Verification Report Shared With You</h1>
        <p style="color: #17171c/70; line-height: 1.6;">${senderName} has shared their Krost Income Verification Report with you.</p>
        <a href="${shareUrl}" 
           style="display: inline-block; background: #17171c; color: #eeece7; padding: 14px 32px; border-radius: 32px; text-decoration: none; font-weight: 500; margin-top: 24px;">
          View Report
        </a>
        <p style="color: #17171c/40; font-size: 12px; margin-top: 24px;">This link will expire as configured by the sender.</p>
      </div>
    </body></html>`,
  });
}
