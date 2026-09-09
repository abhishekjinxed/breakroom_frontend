import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForAndroidPushNotifications() {
  if (Platform.OS !== "android" || !Device.isDevice) return null;

  // Android 13 only presents the notification permission prompt after a
  // channel exists, so create the channel before requesting the Expo token.
  await Notifications.setNotificationChannelAsync("breakroom", {
    name: "Breakroom updates",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 120, 200],
    lightColor: "#A76134",
    sound: "default",
  });

  let status = (await Notifications.getPermissionsAsync()).status;
  if (status !== "granted") status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

export function notificationRoute(notification: Notifications.Notification) {
  const url = notification.request.content.data?.url;
  return typeof url === "string" && url.startsWith("/") ? url : "/notifications";
}
