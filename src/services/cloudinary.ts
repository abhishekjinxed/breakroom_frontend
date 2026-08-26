import * as ImagePicker from "expo-image-picker";

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function pickAndUploadMedia(maxVideoDuration = 60, videoOnly = false, onProgress?: (value: number) => void) {
  if (!cloudName || !uploadPreset) throw new Error("Cloudinary is not configured.");
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: videoOnly ? ["videos"] : ["images", "videos"], quality: 0.8, videoMaxDuration: maxVideoDuration });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (
    asset.type === "video" &&
    maxVideoDuration === 10 &&
    typeof asset.duration === "number" &&
    asset.duration > 10_000
  ) {
    throw new Error("Break Brief videos must be 10 seconds or shorter.");
  }
  const file = await fetch(asset.uri).then((response) => response.blob());
  const body = new FormData();
  body.append("file", file, asset.fileName ?? `work-pulse.${asset.type === "video" ? "mp4" : "jpg"}`);
  body.append("upload_preset", uploadPreset);
  const resourceType = asset.type === "video" ? "video" : "image";
  const data = await new Promise<any>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress?.(event.loaded / event.total); };
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve(JSON.parse(request.responseText)) : reject(new Error("Media upload failed."));
    request.onerror = () => reject(new Error("Media upload failed."));
    request.send(body);
  });
  return { mediaUrl: data.secure_url as string, mediaType: asset.type === "video" ? "VIDEO" as const : "IMAGE" as const };
}
