import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";

interface ProductItemProps {
  imageUrl: string;
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
  return (
    <TouchableOpacity
      style={[styles.container, { width: itemWidth }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
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
