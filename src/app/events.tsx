import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { EventInfoRow } from "@/components/ui/event-info-row";

const EVENTS_DATA = [
  {
    id: "e1",
    status: "Upcoming",
    badgeText: "Upcoming · Sample event",
    dateLabel: "Upcoming · 24 Oct 2026",
    title: "Community clothing drive",
    time: "10:00–14:00 SAST",
    location: "Orlando Community Hall, Soweto",
    image: "https://unsplash.com",
    shortDesc: "Donate clothing or volunteer to sort and prepare bundles.",
    headline: "A morning of practical care.",
    longDesc:
      "Help sort clothing, prepare donation bundles and welcome neighbors. Bring clean, wearable clothing and blankets, or contribute your time.",
  },
  {
    id: "e2",
    status: "Completed",
    badgeText: "Completed · 26 Sep 2026",
    dateLabel: "Completed · 26 Sep 2026",
    title: "Spring community day",
    time: "09:00–13:00 SAST",
    location: "Mofolo Community Garden, Soweto",
    image: "https://unsplash.com",
    shortDesc: "A sample recap of a shared morning in the garden.",
    headline: "Cultivating sustainable roots together.",
    longDesc:
      "Our community garden cleanup was a great success. Thanks to all neighbors who joined us to clear plots and sow seeds for the upcoming season.",
  },
];

export default function EventsScreen() {
  const [filter, setFilter] = useState<"All" | "Upcoming" | "Completed">("All");
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  // Filter items matching layout configuration rules
  const displayedEvents = EVENTS_DATA.filter(
    (ev) => filter === "All" || ev.status === filter,
  );
  const detailedEvent = EVENTS_DATA.find((ev) => ev.id === activeEventId);

  // Deep Dive Detail Screen Variant
  if (detailedEvent) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Navigation Breadcrumb header element */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveEventId(null)}
        >
          <Text style={styles.backButtonText}>← LEPARA ALE FELE MOYA</Text>
        </TouchableOpacity>

        <View style={styles.detailLayoutContent}>
          <View style={styles.blackBadge}>
            <Text style={styles.blackBadgeText}>
              {detailedEvent.badgeText.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.microCategoryLabel}>COMMUNITY EVENT</Text>
          <Text style={styles.detailMainTitle}>{detailedEvent.title}</Text>

          <Image
            source={{ uri: detailedEvent.image }}
            style={styles.heroDetailImage}
            resizeMode="cover"
          />

          {/* Time and Venue block grid rows */}
          <View style={styles.metaBlock}>
            <EventInfoRow
              icon="calendar-outline"
              text={`${detailedEvent.dateLabel.split(" · ")[1]} · ${detailedEvent.time}`}
            />
            <EventInfoRow
              icon="location-outline"
              text={detailedEvent.location}
            />
          </View>

          <View style={styles.separatorLine} />

          {/* Context textual details paragraphs layout */}
          <Text style={styles.detailHeadline}>{detailedEvent.headline}</Text>
          <Text style={styles.detailBodyParagraph}>
            {detailedEvent.longDesc}
          </Text>

          {detailedEvent.status === "Upcoming" ? (
            <>
              <Text style={styles.sectionHeadingLabel}>Ways to help</Text>
              <Text style={styles.bulletItem}>
                <Text style={styles.boldText}>Donate /</Text> Clothing, blankets
                or reusable bags.
              </Text>
              <Text style={styles.bulletItem}>
                <Text style={styles.boldText}>Volunteer /</Text> Clothing
                sorting, bundle packing or the welcome desk.
              </Text>

              {/* Functional CTA Interactive Button blocks */}
              <TouchableOpacity
                style={styles.primaryBlackBtn}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryBlackBtnText}>
                  Volunteer for this event
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryOutlineBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryOutlineBtnText}>
                  Donate to this event
                </Text>
              </TouchableOpacity>

              <Text style={styles.fineprintNotice}>
                Select an event or task and describe your contribution. The team
                will review your request and follow up.
              </Text>
            </>
          ) : (
            <View style={styles.completedBox}>
              <Text style={styles.completedBoxText}>
                This event has concluded. Thank you to everyone involved!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Dashboard Hub List Screen Variant
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hubHeaderContainer}>
        <Text style={styles.microCollectionLabel}>
          COMMUNITY / SAMPLE EVENTS
        </Text>
        <Text style={styles.hubMainHeadingTitle}>Better, together.</Text>
        <Text style={styles.hubDescriptionParagraph}>
          Find an upcoming event or look back at a completed community moment.
        </Text>
      </View>

      {/* Horizontal Interactive Filter pill segment line */}
      <View style={styles.filterTrackRow}>
        {(["All", "Upcoming", "Completed"] as const).map((type) => {
          const isSelected = filter === type;
          const countModifier =
            type === "All" ? ` (${EVENTS_DATA.length})` : "";
          return (
            <TouchableOpacity
              key={type}
              style={[styles.filterPill, isSelected && styles.filterPillActive]}
              onPress={() => setFilter(type)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isSelected && styles.filterPillTextActive,
                ]}
              >
                {type}
                {countModifier}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Structured Card Feed */}
      <View style={styles.feedWrapperList}>
        {displayedEvents.map((item) => (
          <View key={item.id} style={styles.cardContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.cardCoverImage}
              resizeMode="cover"
            />

            <View style={styles.cardContentWrapper}>
              <View
                style={[
                  styles.statusBadgeBlock,
                  item.status === "Completed" && styles.statusBadgeCompleted,
                ]}
              >
                <Text style={styles.statusBadgeText}>{item.dateLabel}</Text>
              </View>

              <Text style={styles.cardMainTitle}>{item.title}</Text>
              <Text style={styles.cardShortMetaRow}>
                {item.time} · {item.location.split(",")[0]}
              </Text>
              <Text style={styles.cardShortDescriptionText}>
                {item.shortDesc}
              </Text>

              <TouchableOpacity
                style={
                  item.status === "Upcoming"
                    ? styles.cardPrimaryBtn
                    : styles.cardOutlineBtn
                }
                onPress={() => setActiveEventId(item.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={
                    item.status === "Upcoming"
                      ? styles.cardPrimaryBtnText
                      : styles.cardOutlineBtnText
                  }
                >
                  {item.status === "Upcoming"
                    ? "View event & get involved"
                    : "Read recap"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  hubHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  microCollectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#737373",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  hubMainHeadingTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  hubDescriptionParagraph: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  filterTrackRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginVertical: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  filterPillActive: {
    backgroundColor: "#0c0c0c",
    borderColor: "#0c0c0c",
  },
  filterPillText: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "500",
  },
  filterPillTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  feedWrapperList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 20,
  },
  cardCoverImage: {
    width: "100%",
    height: 190,
    backgroundColor: "#f6f6f6",
  },
  cardContentWrapper: {
    paddingTop: 16,
  },
  statusBadgeBlock: {
    backgroundColor: "#0c0c0c",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  statusBadgeCompleted: {
    backgroundColor: "#e5e5e5",
  },
  statusBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  cardMainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  cardShortMetaRow: {
    fontSize: 13,
    color: "#737373",
    marginBottom: 12,
  },
  cardShortDescriptionText: {
    fontSize: 14,
    color: "#444444",
    lineHeight: 20,
    marginBottom: 16,
  },
  cardPrimaryBtn: {
    backgroundColor: "#0c0c0c",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  cardPrimaryBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  cardOutlineBtn: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  cardOutlineBtnText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "600",
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#737373",
    letterSpacing: 0.5,
  },
  detailLayoutContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  blackBadge: {
    backgroundColor: "#0c0c0c",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  blackBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  microCategoryLabel: {
    fontSize: 11,
    color: "#737373",
    fontWeight: "600",
    marginBottom: 8,
  },
  detailMainTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 20,
  },
  heroDetailImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#f6f6f6",
    marginBottom: 20,
  },
  metaBlock: {
    marginVertical: 4,
  },
  separatorLine: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 16,
  },
  detailHeadline: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
    lineHeight: 28,
    marginBottom: 14,
  },
  detailBodyParagraph: {
    fontSize: 14,
    color: "#444444",
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionHeadingLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 14,
  },
  bulletItem: {
    fontSize: 14,
    color: "#444444",
    lineHeight: 20,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: "700",
    color: "#000000",
  },
  primaryBlackBtn: {
    backgroundColor: "#0c0c0c",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  primaryBlackBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryOutlineBtn: {
    borderWidth: 1,
    borderColor: "#cccccc",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 16,
  },
  secondaryOutlineBtnText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "600",
  },
  fineprintNotice: {
    fontSize: 11,
    color: "#999999",
    textAlign: "center",
    lineHeight: 16,
  },
  completedBox: {
    backgroundColor: "#f6f6f6",
    padding: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  completedBoxText: {
    color: "#555555",
    fontSize: 13,
    fontWeight: "500",
  },
});
