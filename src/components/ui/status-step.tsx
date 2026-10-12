import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatusStepProps {
  title: string;
  subtitle: string;
  isCompleted: boolean;
  isLast?: boolean;
}

export function StatusStep({
  title,
  subtitle,
  isCompleted,
  isLast = false,
}: StatusStepProps) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.leftColumn}>
        <View
          style={[
            styles.circle,
            isCompleted ? styles.circleCompleted : styles.circlePending,
          ]}
        />
        {!isLast && <View style={styles.verticalLine} />}
      </View>
      <View style={styles.rightColumn}>
        <Text style={[styles.statusTitle, !isCompleted && styles.textPending]}>
          {title}
        </Text>
        <Text style={styles.statusSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: "row",
    height: 64,
  },
  leftColumn: {
    alignItems: "center",
    marginRight: 16,
    width: 16,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  circleCompleted: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  circlePending: {
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
  },
  verticalLine: {
    width: 1,
    flex: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 4,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  textPending: {
    color: "#737373",
    fontWeight: "500",
  },
  statusSubtitle: {
    fontSize: 12,
    color: "#737373",
    marginTop: 2,
  },
});
