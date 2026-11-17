export async function uploadOrOptimizeImage(
  file: File,
  folder: string
): Promise<{ url: string; source: "cloudinary" | "local"; width?: number; height?: number }> {
  // 1. Try real Cloudinary upload endpoint first if configured on server
  try {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/cloudinary/upload", {
      method: "POST",
      body: fd,
    });
    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.asset?.url) {
        return {
          url: json.asset.url,
          source: "cloudinary",
          width: json.asset.width,
          height: json.asset.height,
        };
      }
    }
  } catch {
    // fall through to optimized browser fallback
  }

  // 2. Smart client-side WebP/JPEG compression so admin replace works immediately without keys
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Invalid image file."));
    img.src = dataUrl;
  });

  const maxDim = folder.includes("brand") ? 640 : 1280;
  const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
  const w = Math.max(1, Math.round((img.width || 800) * scale));
  const h = Math.max(1, Math.round((img.height || 600) * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { url: dataUrl, source: "local", width: w, height: h };

  ctx.drawImage(img, 0, 0, w, h);
  // Preserve PNG transparency for brand logos; use compressed JPEG for photography
  const isLogoOrPng = folder.includes("brand") || file.type === "image/png";
  const outputUrl = isLogoOrPng
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", 0.82);

  return {
    url: outputUrl,
    source: "local",
    width: w,
    height: h,
  };
}
