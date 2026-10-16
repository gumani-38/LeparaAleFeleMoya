import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { HeroSection } from "@/components/ui/hero-section";
import { HomeEvent } from "@/components/ui/home-event";
import { ProductItem } from "@/components/ui/product-item";
import { fetchShopProducts, type ShopProduct } from "@/lib/products";

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const result = await fetchShopProducts();
        if (isCurrent) setProducts(result);
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load products. Please try again.",
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadProducts();
    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Main Hero Content Layout */}
      <HeroSection
        label="React Native / Community Concept"
        title={`Wear purpose.\nShare\npossibility.`}
        description="Clothing, community and everyday acts of care. Find your way to get involved."
        buttonText="Shop for a purpose"
        onButtonPress={() => router.push("/shop")}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Everyday essentials</Text>
        <Text style={styles.sectionLink} onPress={() => router.push("/shop")}>
          Shop all ↗
        </Text>
      </View>

      <View style={styles.grid}>
        {isLoading ? (
          <ActivityIndicator style={styles.loading} color="#111111" />
        ) : loadError ? (
          <View style={styles.loadMessage}>
            <Text style={styles.loadMessageText}>{loadError}</Text>
            <TouchableOpacity onPress={() => setRetryCount((count) => count + 1)}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : products.length > 0 ? (
          products.slice(0, 2).map((product) => (
            <ProductItem
              key={product.id}
              imageUrl={product.imageUrl}
              name={product.name}
              price={product.price}
              subtitle={product.subtitle}
              onPress={() => router.push("/shop")}
            />
          ))
        ) : (
          <Text style={styles.loadMessageText}>No products are available right now.</Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* 5. Highlight Event Block */}
      <HomeEvent
        tag="Upcoming · Sample event"
        title="Community clothing drive"
        meta="24 Oct · 10:00–14:00 · Soweto"
        buttonText="Explore the event"
        onPress={() => router.push("/events")}
      />

      <Text style={styles.footerText}>
        Product prices and availability are provided by Lepara Ale Fele Moya.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000000",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  loading: {
    marginVertical: 32,
  },
  loadMessage: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 24,
  },
  loadMessageText: {
    color: "#777777",
    fontSize: 14,
    textAlign: "center",
  },
  retryText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginHorizontal: 20,
    marginVertical: 12,
  },
  footerText: {
    fontSize: 11,
    color: "#999999",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 32,
    marginTop: 8,
  },
});
