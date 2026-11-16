import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: "Cloudinary keys missing in environment.",
      },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const folder = String(body.folder || "kibo-plains/expeditions");
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    apiSecret
  );

  return NextResponse.json({
    ok: true,
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  });
}
