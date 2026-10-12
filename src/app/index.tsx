import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

// Import our custom components
import { HeroSection } from "@/components/ui/hero-section";
import { HomeEvent } from "@/components/ui/home-event";
import { ProductItem } from "@/components/ui/product-item";

export default function HomeScreen() {
  const router = useRouter();

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

      {/* 2. Full-Width Core Centerpiece Graphic */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: "https://unsplash.com" }} // Replace with your local black-and-white asset
          style={styles.bannerImage}
        />
      </View>

      {/* 3. Mid-Section Title Bar */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Everyday essentials</Text>
        <Text style={styles.sectionLink} onPress={() => router.push("/shop")}>
          Shop all ↗
        </Text>
      </View>

      {/* 4. Multi-Card Dynamic Component Grid Layout */}
      <View style={styles.grid}>
        <ProductItem
          imageUrl="https://unsplash.com"
          name="Community tee"
          price="R250"
          subtitle="White / Cotton / XS–XXL"
          onPress={() => router.push("/shop")}
        />
        <ProductItem
          imageUrl="https://unsplash.com"
          name="Everyday hoodie"
          price="R550"
          subtitle="Black / Cotton blend / S–XXL"
          onPress={() => router.push("/shop")}
        />
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
        Design concept · All products and events are sample data.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  bannerImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f6f6f6",
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
