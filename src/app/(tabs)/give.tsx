import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const waysToHelp = [
  {
    title: "Donate",
    description: "Share goods or make a contribution to support an initiative.",
    icon: "heart-outline" as const,
    route: "/donate" as const,
  },
  {
    title: "Volunteer",
    description: "Offer your time and skills at an upcoming community event.",
    icon: "people-outline" as const,
    route: "/volunteer" as const,
  },
];

export default function GiveScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>GET INVOLVED</Text>
      <Text style={styles.title}>Give in your own way.</Text>
      <Text style={styles.description}>
        Choose how you would like to support community initiatives.
      </Text>

      <View style={styles.options}>
        {waysToHelp.map((option) => (
          <TouchableOpacity
            key={option.title}
            style={styles.optionCard}
            accessibilityRole="button"
            onPress={() => router.push(option.route)}
            activeOpacity={0.85}
          >
            <View style={styles.optionIcon}>
              <Ionicons name={option.icon} size={22} color="#111111" />
            </View>
            <View style={styles.optionCopy}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#777777" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "600",
    color: "#737373",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  optionCard: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
    marginRight: 14,
  },
  optionCopy: {
    flex: 1,
    marginRight: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: "#666666",
    lineHeight: 17,
  },
});
