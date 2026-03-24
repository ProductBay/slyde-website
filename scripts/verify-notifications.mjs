import "dotenv/config";

const checks = [
  {
    key: "RESEND_API_KEY",
    ok: Boolean(process.env.RESEND_API_KEY?.trim()),
    message: "Resend API key present",
  },
  {
    key: "RESEND_FROM_EMAIL",
    ok: Boolean(process.env.RESEND_FROM_EMAIL?.trim()),
    message: "From email present",
  },
  {
    key: "TWILIO_ACCOUNT_SID",
    ok: Boolean(process.env.TWILIO_ACCOUNT_SID?.trim()),
    message: "Twilio account SID present",
  },
  {
    key: "TWILIO_AUTH_TOKEN",
    ok: Boolean(process.env.TWILIO_AUTH_TOKEN?.trim()),
    message: "Twilio auth token present",
  },
  {
    key: "TWILIO_WHATSAPP_FROM",
    ok: Boolean(process.env.TWILIO_WHATSAPP_FROM?.trim()),
    message: "Twilio WhatsApp sender present",
  },
  {
    key: "SLYDE_WEBSITE_BASE_URL",
    ok: Boolean(process.env.SLYDE_WEBSITE_BASE_URL?.trim()),
    message: "Website base URL present",
  },
];

const emailReady = checks.find((check) => check.key === "RESEND_API_KEY")?.ok && checks.find((check) => check.key === "RESEND_FROM_EMAIL")?.ok;
const whatsappReady =
  checks.find((check) => check.key === "TWILIO_ACCOUNT_SID")?.ok &&
  checks.find((check) => check.key === "TWILIO_AUTH_TOKEN")?.ok &&
  checks.find((check) => check.key === "TWILIO_WHATSAPP_FROM")?.ok;

const result = {
  ok: Boolean(emailReady),
  channels: {
    email: {
      configured: Boolean(emailReady),
      provider: emailReady ? "resend" : "email_stub",
    },
    whatsapp: {
      configured: Boolean(whatsappReady),
      provider: whatsappReady ? "twilio_whatsapp" : "whatsapp_stub",
    },
    sms: {
      configured: false,
      provider: "sms_stub",
    },
  },
  checks,
};

console.log(JSON.stringify(result, null, 2));

if (!result.channels.email.configured) {
  process.exit(1);
}
