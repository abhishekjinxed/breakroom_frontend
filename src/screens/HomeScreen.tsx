import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Hey 👋</Text>

        <Text style={styles.username}>@{user?.anonymousUsername}</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>What are you up to?</Text>

        <Text style={styles.subtitle}>Find someone who's bored too.</Text>

        <TouchableOpacity style={styles.boredButton}>
          <Text style={styles.boredEmoji}>😴</Text>

          <Text style={styles.boredText}>Getting Bored</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F8F8FA",
  },

  greeting: {
    fontSize: 18,
    color: "#777",
  },

  username: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
    marginBottom: 40,
  },

  boredButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },

  boredEmoji: {
    fontSize: 45,
  },

  boredText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },
});
