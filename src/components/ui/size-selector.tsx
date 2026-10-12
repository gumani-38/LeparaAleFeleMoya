import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
}: SizeSelectorProps) {
  return (
    <View style={styles.container}>
      {sizes.map((size) => {
        const isSelected = selectedSize === size;
        return (
          <TouchableOpacity
            key={size}
            style={[styles.box, isSelected && styles.boxSelected]}
            onPress={() => onSelectSize(size)}
            activeOpacity={0.8}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>
              {size}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  box: {
    minWidth: 44,
    height: 38,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
  },
  boxSelected: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000000",
  },
  textSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
