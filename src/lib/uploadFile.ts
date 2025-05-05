import { uploadOnCloudinary } from "./Cloudinary";

export async function UploadFile(
  file: File | File[]
): Promise<string[] | null> {
  try {
    const fileUpload = Array.isArray(file) ? file : [file];
    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10 MB

    for (const e of fileUpload) {
      if (!allowedTypes.includes(e.type)) {
        return null;
      }
      if (e.size > maxSize) {
        return null;
      }
    }
    const uploading = fileUpload.map(async (e: File) => {
      const arrayBuffer = await e.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = e.type;
      const base64 = buffer.toString("base64");
      const dataURI = `data:${mimeType};base64,${base64}`;
      return uploadOnCloudinary(dataURI);
    });
    const uploaded = await Promise.all(uploading);
    const urlArray = uploaded.map((obj) => obj!.url);
    return urlArray;
  } catch (error) {
    console.log(error);
    return null;
  }
}