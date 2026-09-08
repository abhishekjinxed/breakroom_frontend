import * as ImagePicker from "expo-image-picker";

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function pickAndUploadMedia(maxVideoDuration = 60, videoOnly = false, onProgress?: (value: number) => void, imageOnly = false) {
  if (!cloudName || !uploadPreset) throw new Error("Cloudinary is not configured.");
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: videoOnly ? ["videos"] : imageOnly ? ["images"] : ["images", "videos"], quality: 0.8, videoMaxDuration: maxVideoDuration });
  if (result.canceled) return null;
  const asset = result.assets[0];
  let file: Blob;
  try {
    const response = await fetch(asset.uri);
    if (!response.ok) throw new Error(`Selected file could not be read (${response.status}).`);
    file = await response.blob();
    if (!file.size) throw new Error("The selected file is empty.");
  } catch (error: any) {
    throw new Error(error?.message || "Couldn't read that file. Please choose a different photo.");
  }
  const body = new FormData();
  body.append("file", file, asset.fileName ?? `work-pulse.${asset.type === "video" ? "mp4" : "jpg"}`);
  body.append("upload_preset", uploadPreset);
  const resourceType = asset.type === "video" ? "video" : "image";
  const data = await new Promise<any>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
    request.timeout = 120000;
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress?.(event.loaded / event.total); };
    request.onload = () => {
      let response: any = null;
      try { response = request.responseText ? JSON.parse(request.responseText) : null; } catch { /* Preserve a useful fallback error below. */ }
      if (request.status >= 200 && request.status < 300 && response?.secure_url) return resolve(response);
      reject(new Error(response?.error?.message || `Cloudinary upload failed (${request.status || "network error"}).`));
    };
    request.onerror = () => reject(new Error("Cloudinary upload could not reach the server. Check your connection and try again."));
    request.ontimeout = () => reject(new Error("Cloudinary upload timed out. Please try a smaller photo."));
    request.send(body);
  });
  const originalUrl = data.secure_url as string;
  // Cloudinary serves the first ten seconds only, even when a longer source was selected.
  const mediaUrl = asset.type === "video" && maxVideoDuration === 10
    ? originalUrl.replace("/video/upload/", "/video/upload/so_0,eo_10/")
    : originalUrl;
  return { mediaUrl, mediaType: asset.type === "video" ? "VIDEO" as const : "IMAGE" as const };
}
