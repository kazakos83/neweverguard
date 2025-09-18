// app/lib/sendgrid.ts
import sgMail from "@sendgrid/mail";

// Ensure your SendGrid API key is set in Netlify environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

if (!SENDGRID_API_KEY) {
  throw new Error("Missing SENDGRID_API_KEY environment variable");
}

if (!FROM_EMAIL) {
  throw new Error("Missing SENDGRID_FROM_EMAIL environment variable");
}

sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * sendEmail
 * @param to - recipient email
 * @param subject - email subject
 * @param text - plain text content
 * @param html - optional HTML content
 */
export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  const msg = {
    to,
    from: FROM_EMAIL,
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("SendGrid error:", error);
    throw error;
  }
};
