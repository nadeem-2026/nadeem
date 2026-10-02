import { getSupabaseAdmin } from "@/lib/auth/admin";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNotification({
  userId,
  title,
  body,
  link,
  email
}: {
  userId: string;
  title: string;
  body: string;
  link?: string;
  email?: string;
}) {
  // 1. In-App Notification (Database)
  const { error } = await getSupabaseAdmin().from("notifications").insert({
    user_id: userId,
    title,
    body,
    link,
  });

  if (error) {
    console.error("Failed to insert notification:", error);
  }

  // 2. Email Notification (if requested)
  if (email && process.env.SMTP_USER) {
    const htmlBody = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>${title}</h2>
        <p>${body}</p>
        ${link ? `<a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${link}" style="display:inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">عرض التفاصيل / View Details</a>` : ''}
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Nadeem" <${process.env.SMTP_USER}>`,
        to: email,
        subject: title,
        html: htmlBody,
      });
    } catch (mailError) {
      console.error("Failed to send email notification:", mailError);
    }
  }
}
