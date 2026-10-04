import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

const configured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (configured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export const cloudinaryConfigured = configured;
export { cloudinary };

/**
 * Uploads a base64/data-URI or remote URL image buffer to Cloudinary with
 * server-side validation. Throws a descriptive error if Cloudinary isn't
 * configured, so callers (admin product image upload) can show a clear
 * "image hosting not configured" state instead of failing silently.
 */
export async function uploadImage(fileDataUri, { folder = "kiyomi/products" } = {}) {
  if (!configured) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars.");
  }
  return cloudinary.uploader.upload(fileDataUri, {
    folder,
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    max_bytes: 8 * 1024 * 1024, // 8MB cap
  });
}
