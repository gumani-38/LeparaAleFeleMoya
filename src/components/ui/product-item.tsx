import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";

interface ProductItemProps {
  imageUrl: string | null;
  name: string;
  price: string;
  subtitle: string;
  onPress?: () => void;
}

const { width } = Dimensions.get("window");
const itemWidth = (width - 52) / 2;

export function ProductItem({
  imageUrl,
  name,
  price,
  subtitle,
  onPress,
}: ProductItemProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = imageUrl !== null && failedImageUrl !== imageUrl;
  const categoryIcon = subtitle.toLowerCase().includes("canvas")
    ? "bag-handle-outline"
    : subtitle.toLowerCase().includes("cotton")
      ? "shirt-outline"
      : "pricetag-outline";

  return (
    <TouchableOpacity
      style={[styles.container, { width: itemWidth }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {showImage && imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailedImageUrl(imageUrl)}
          accessibilityLabel={`${name} product photo`}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name={categoryIcon} size={42} color="#8a8a8a" />
          <Text style={styles.placeholderText}>Photo coming soon</Text>
        </View>
      )}
      <View style={styles.textRow}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.price}>{price}</Text>
      </View>
      <Text style={styles.subtitle} numberOfLines={1}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: 190,
    backgroundColor: "#f6f6f6",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    marginTop: 8,
    color: "#777777",
    fontSize: 11,
  },
  textRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    flex: 1,
    paddingRight: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  subtitle: {
    fontSize: 12,
    color: "#888888",
    marginTop: 6,
  },
});
