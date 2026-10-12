import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

interface HomeEventProps {
  tag: string;
  title: string;
  meta: string;
  buttonText: string;
  onPress: () => void;
}

export function HomeEvent({
  tag,
  title,
  meta,
  buttonText,
  onPress,
}: HomeEventProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tagBadge}>
        <Text style={styles.tagText}>{tag}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>{meta}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: "#ffffff",
  },
  tagBadge: {
    backgroundColor: "#0c0c0c",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  tagText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  meta: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
  },
  button: {
    borderWidth: 1,
    borderColor: "#cccccc",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "600",
  },
});
