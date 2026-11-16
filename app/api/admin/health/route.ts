import { NextResponse } from "next/server";
import { isSmtpConfigured } from "@/lib/server/mailer";

export async function GET() {
  const firebase = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );

  const googleAuth = Boolean(
    firebase && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  );

  const cloudinary = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

  const nodemailer = isSmtpConfigured();
  const passcodeConfigured = Boolean(process.env.ADMIN_ACCESS_PASSWORD);

  return NextResponse.json({
    firebase,
    googleAuth,
    cloudinary,
    nodemailer,
    passcodeConfigured,
    previewPasscodeHint: passcodeConfigured ? null : "kibo2026",
  });
}
