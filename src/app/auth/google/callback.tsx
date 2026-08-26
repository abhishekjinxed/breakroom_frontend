import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Brand } from "../../../constants/brand";

export default function GoogleCallback() {
  useEffect(() => {
    router.replace("/");
  }, []);

  return <View style={styles.container}><ActivityIndicator color={Brand.colors.teal} size="large" /></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Brand.colors.canvas },
});
