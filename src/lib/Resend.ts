import { Resend } from "resend";

export async function SendEmail(otp: string, recipient: string) {
  const resend = new Resend(process.env.RESEND_SECRET);

  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: recipient,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
    });
    console.log("I am working")
    if (data.data?.id) {
      console.log("Email sent successfully:", data.data.id);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}