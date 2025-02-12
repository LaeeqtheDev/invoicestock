import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using server-side environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Optionally retrieve the upload preset from the form data
    const uploadPreset = formData.get("upload_preset")?.toString();

    // Convert Blob to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert the buffer to a Base64-encoded string with MIME type
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Build the options object for the upload
    const options: Record<string, any> = {
      folder: "business_logos", // Destination folder in Cloudinary
      allowed_formats: ["jpg", "png", "svg", "webp"],
    };

    if (uploadPreset) {
      options.upload_preset = uploadPreset;
    }

    // Upload the image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      base64File,
      options,
    );

    return NextResponse.json({ secure_url: uploadResponse.secure_url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
