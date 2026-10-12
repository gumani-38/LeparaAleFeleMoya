import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EventInfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

export function EventInfoRow({ icon, text }: EventInfoRowProps) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color="#555555" style={styles.icon} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
    width: 16,
  },
  text: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
});
