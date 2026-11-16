import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const ALLOWED_FOLDERS = new Set([
  "kibo-plains/expeditions",
  "kibo-plains/parks",
  "kibo-plains/kilimanjaro",
  "kibo-plains/fleet",
]);

function configureCloudinary(): boolean {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) return false;

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });
  return true;
}

export async function GET() {
  if (!configureCloudinary()) {
    return NextResponse.json({
      ok: true,
      configured: false,
      assets: [],
      message: "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to list live Cloudinary media.",
    });
  }

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "kibo-plains",
      max_results: 40,
      direction: "desc",
    });

    const assets = (result.resources || []).map(
      (r: {
        public_id: string;
        secure_url: string;
        asset_folder?: string;
        width?: number;
        height?: number;
        format?: string;
        created_at?: string;
      }) => ({
        publicId: r.public_id,
        url: r.secure_url,
        folder: r.asset_folder || "kibo-plains",
        label: r.public_id.split("/").pop() || r.public_id,
        width: r.width,
        height: r.height,
        format: r.format,
        source: "cloudinary" as const,
        createdAt: r.created_at || new Date().toISOString(),
      })
    );

    return NextResponse.json({ ok: true, configured: true, assets });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error:
          err instanceof Error
            ? err.message
            : "Unable to query Cloudinary media resources.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!configureCloudinary()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error:
          "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured yet.",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const requestedFolder = String(
      formData.get("folder") || "kibo-plains/expeditions"
    );
    const folder = ALLOWED_FOLDERS.has(requestedFolder)
      ? requestedFolder
      : "kibo-plains/expeditions";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Please attach an image file." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "Only image uploads (JPG, PNG, WebP) are supported." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "Image exceeds the 10 MB upload limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise<{
      public_id: string;
      secure_url: string;
      width: number;
      height: number;
      format: string;
      created_at: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ fetch_format: "auto", quality: "auto:good" }],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed"));
          } else {
            resolve(result);
          }
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      ok: true,
      configured: true,
      asset: {
        publicId: uploaded.public_id,
        url: uploaded.secure_url,
        folder,
        label: file.name.replace(/\.[^.]+$/, ""),
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        source: "cloudinary",
        createdAt: uploaded.created_at,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Upload failed.",
      },
      { status: 500 }
    );
  }
}
