// utils/sendEmail.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
  try {
    const response = await resend.emails.send({
      from: "MedTrack <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("📧 Resend API Response:", response);
    return response;
  } catch (error) {
    console.error("❌ Resend email error:", error);
    throw error;
  }
}

module.exports = sendEmail;
