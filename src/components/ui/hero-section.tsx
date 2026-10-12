import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

interface HeroSectionProps {
  label: string;
  title: string;
  description: string;
  buttonText: string;
  onButtonPress: () => void;
}

export function HeroSection({
  label,
  title,
  description,
  buttonText,
  onButtonPress,
}: HeroSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onButtonPress}
        activeOpacity={0.9}
      >
        <Text style={styles.buttonText}>{buttonText} ↗</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: "#ffffff",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#555555",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#000000",
    lineHeight: 44,
    letterSpacing: -1,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#0c0c0c",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});
