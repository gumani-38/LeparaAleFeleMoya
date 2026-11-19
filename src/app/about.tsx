import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const nextSteps = [
  {
    title: "Explore events",
    description: "See what is happening in the community.",
    icon: "calendar-outline" as const,
    route: "/events" as const,
  },
  {
    title: "Make a donation",
    description: "Offer goods or a contribution to an initiative.",
    icon: "heart-outline" as const,
    route: "/donate" as const,
  },
  {
    title: "Volunteer",
    description: "Share your time and skills.",
    icon: "people-outline" as const,
    route: "/volunteer" as const,
  },
  {
    title: "Shop with purpose",
    description: "Browse the everyday collection.",
    icon: "shirt-outline" as const,
    route: "/shop" as const,
  },
];

const communityInitiatives = [
  {
    title: "Clothing donations",
    description: "Sharing garments with people who need practical support.",
    icon: "shirt-outline" as const,
  },
  {
    title: "Sanitary pad drives",
    description: "Helping girls and women access essential period supplies.",
    icon: "heart-outline" as const,
  },
  {
    title: "School talks",
    description: "Encouraging young people through conversations at school.",
    icon: "school-outline" as const,
  },
  {
    title: "Winter feeding",
    description: "Offering food and care during the colder months.",
    icon: "sunny-outline" as const,
  },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <TouchableOpacity
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={18} color="#183f35" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.hero}>
        <View style={styles.heroOrb} />
        <View style={styles.heroHeader}>
          <View style={styles.brandMark}>
            <Ionicons name="heart" size={15} color="#183f35" />
          </View>
          <Text style={styles.heroEyebrow}>ABOUT THE ORGANIZATION</Text>
        </View>

        <Text style={styles.heroTitle}>
          Wear purpose.{"\n"}
          <Text style={styles.heroTitleAccent}>Share possibility.</Text>
        </Text>
        <Text style={styles.heroDescription}>
          Clothing, community, and everyday acts of care.
        </Text>

        <View style={styles.artwork} accessible={false}>
          <View style={styles.artworkRing} />
          <View style={styles.shirtTile}>
            <Ionicons name="shirt" size={50} color="#183f35" />
          </View>
          <View style={styles.peopleTile}>
            <Ionicons name="people" size={28} color="#fffaf1" />
            <Text style={styles.peopleTileText}>COMMUNITY</Text>
          </View>
          <View style={styles.heartTile}>
            <Ionicons name="heart" size={19} color="#183f35" />
          </View>
        </View>
      </View>

      <View style={styles.introSection}>
        <Text style={styles.sectionEyebrow}>LEPARA ALE FELE MOYA</Text>
        <Text style={styles.sectionTitle}>A community that helps people keep going.</Text>
        <Text style={styles.bodyText}>
          Lepara Ale Fele Moya is a community-based upliftment initiative
          supporting people through difficult circumstances with practical help,
          encouragement, and the reminder that they are not alone.
        </Text>
      </View>

      <View style={styles.storySection}>
        <View style={styles.storyCard}>
          <View style={styles.storyIcon}>
            <Ionicons name="location-outline" size={20} color="#183f35" />
          </View>
          <Text style={styles.sectionEyebrow}>WHERE IT BEGAN</Text>
          <Text style={styles.storyTitle}>Rooted in Ga-Rankuwa.</Text>
          <Text style={styles.bodyText}>
            Founded in Ga-Rankuwa, Pretoria, by Wilfred (Willy) Kegomoditswe
            Thathane, the organisation grew from a simple belief: when people
            face hard times, a caring community can help them find hope and
            keep moving forward.
          </Text>
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.missionEyebrow}>THE MISSION</Text>
          <Text style={styles.missionTitle}>
            Encourage people not to give up.
          </Text>
          <Text style={styles.missionText}>
            Every initiative is an invitation to show up for one another,
            volunteer, and build a stronger, more caring community.
          </Text>
        </View>
      </View>

      <View style={styles.initiativesSection}>
        <Text style={styles.sectionEyebrow}>CARE IN ACTION</Text>
        <Text style={styles.sectionTitle}>Small acts. Meaningful support.</Text>
        <Text style={[styles.bodyText, styles.initiativesIntro]}>
          The organisation brings its mission to life through community
          initiatives such as:
        </Text>
        <View style={styles.initiativesList}>
          {communityInitiatives.map((initiative) => (
            <View key={initiative.title} style={styles.initiativeCard}>
              <View style={styles.initiativeIcon}>
                <Ionicons name={initiative.icon} size={20} color="#183f35" />
              </View>
              <View style={styles.initiativeCopy}>
                <Text style={styles.initiativeTitle}>{initiative.title}</Text>
                <Text style={styles.initiativeDescription}>
                  {initiative.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.platformCard}>
        <Ionicons name="people-outline" size={22} color="#e2b27b" />
        <View style={styles.platformCopy}>
          <Text style={styles.platformTitle}>A shared place to get involved.</Text>
          <Text style={styles.platformText}>
            This app brings events, donations, and volunteering together, making
            it easier for the organisation and community to stay connected and
            take part.
          </Text>
        </View>
      </View>

      <View style={styles.stepsSection}>
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionHeadingCopy}>
            <Text style={styles.sectionEyebrow}>GET INVOLVED</Text>
            <Text style={styles.sectionTitle}>Find your way to take part.</Text>
          </View>
          <View style={styles.sectionIcon}>
            <Ionicons name="sparkles-outline" size={20} color="#183f35" />
          </View>
        </View>

        <View style={styles.nextSteps}>
          {nextSteps.map((step, index) => (
            <TouchableOpacity
              key={step.title}
              style={styles.stepCard}
              accessibilityRole="button"
              onPress={() => router.push(step.route)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.stepIcon,
                  index % 2 === 1 && styles.stepIconWarm,
                ]}
              >
                <Ionicons name={step.icon} size={21} color="#183f35" />
              </View>
              <View style={styles.stepCopy}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="#676d68" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footerCard}>
        <Ionicons name="leaf-outline" size={22} color="#e2b27b" />
        <Text style={styles.footerText}>
          Small acts of care can help bring a community closer.
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f6f1",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f6f1",
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 6,
  },
  backButtonText: {
    color: "#183f35",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  hero: {
    minHeight: 382,
    overflow: "hidden",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 12,
    backgroundColor: "#183f35",
  },
  heroOrb: {
    position: "absolute",
    top: 98,
    right: -85,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#245849",
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e5bd8d",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  heroEyebrow: {
    color: "#e9e9dc",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: "#fffaf1",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 37,
    letterSpacing: -0.7,
  },
  heroTitleAccent: {
    color: "#e5bd8d",
  },
  heroDescription: {
    marginTop: 8,
    color: "#d8e0d9",
    fontSize: 13,
    lineHeight: 19,
  },
  artwork: {
    height: 142,
    marginTop: 8,
    position: "relative",
  },
  artworkRing: {
    position: "absolute",
    right: 25,
    top: 7,
    width: 112,
    height: 112,
    borderWidth: 1,
    borderColor: "rgba(255,250,241,0.3)",
    borderRadius: 56,
  },
  shirtTile: {
    position: "absolute",
    right: 44,
    top: 18,
    width: 86,
    height: 86,
    borderRadius: 25,
    backgroundColor: "#e5bd8d",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "7deg" }],
  },
  peopleTile: {
    position: "absolute",
    right: 138,
    bottom: 1,
    width: 98,
    height: 66,
    borderRadius: 18,
    backgroundColor: "#b65e43",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-6deg" }],
  },
  peopleTileText: {
    color: "#fffaf1",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 3,
  },
  heartTile: {
    position: "absolute",
    right: 12,
    bottom: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f7f1e7",
    alignItems: "center",
    justifyContent: "center",
  },
  introSection: {
    paddingHorizontal: 6,
    paddingTop: 28,
    paddingBottom: 26,
  },
  sectionEyebrow: {
    color: "#8a6847",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#1d2923",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 27,
    letterSpacing: -0.4,
  },
  bodyText: {
    color: "#636760",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  storySection: {
    gap: 12,
    marginBottom: 28,
  },
  storyCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ebe9e1",
  },
  storyIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#e5eee7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  storyTitle: {
    color: "#1d2923",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 24,
  },
  missionCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#efe7d9",
  },
  missionEyebrow: {
    color: "#8a6847",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  missionTitle: {
    color: "#1d2923",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  missionText: {
    color: "#636760",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  initiativesSection: {
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  initiativesIntro: {
    marginBottom: 14,
  },
  initiativesList: {
    gap: 9,
  },
  initiativeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ebe9e1",
  },
  initiativeIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#f4e9dc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  initiativeCopy: {
    flex: 1,
  },
  initiativeTitle: {
    color: "#202a24",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  initiativeDescription: {
    color: "#70736d",
    fontSize: 11,
    lineHeight: 16,
  },
  platformCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    marginBottom: 28,
    borderRadius: 15,
    backgroundColor: "#263c31",
  },
  platformCopy: {
    flex: 1,
    marginLeft: 12,
  },
  platformTitle: {
    color: "#fffaf1",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 5,
  },
  platformText: {
    color: "#d8e0d9",
    fontSize: 12,
    lineHeight: 18,
  },
  stepsSection: {
    paddingHorizontal: 2,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionHeadingCopy: {
    flex: 1,
    paddingRight: 12,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e8eadf",
    alignItems: "center",
    justifyContent: "center",
  },
  nextSteps: {
    gap: 10,
  },
  stepCard: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ebe9e1",
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },
  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#e5eee7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepIconWarm: {
    backgroundColor: "#f4e9dc",
  },
  stepCopy: {
    flex: 1,
    marginRight: 8,
  },
  stepTitle: {
    color: "#202a24",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },
  stepDescription: {
    color: "#70736d",
    fontSize: 11,
    lineHeight: 16,
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginTop: 22,
    borderRadius: 15,
    backgroundColor: "#263c31",
  },
  footerText: {
    flex: 1,
    color: "#fffaf1",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
});
