import { api } from "./client";

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export async function registerPushDevice(token: string, pushToken: string) {
  await api.post("/api/me/push-devices", { token: pushToken, platform: "android" }, auth(token));
}

export async function unregisterPushDevice(token: string, pushToken: string) {
  await api.delete("/api/me/push-devices", { ...auth(token), data: { token: pushToken } });
}
