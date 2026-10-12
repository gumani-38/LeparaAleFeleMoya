import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useCart } from "@/components/cart-context";

interface CustomIconProps {
  name: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
}

// 1. Reusable Pixel-Matched Pill Component
function TabPillItem({ name, label, focused }: CustomIconProps) {
  return (
    <View
      style={[styles.pillContainer, focused && styles.pillActiveBackground]}
    >
      <Ionicons name={name} size={22} color={focused ? "#000000" : "#737373"} />
      <Text
        style={[
          styles.labelText,
          focused ? styles.labelActive : styles.labelInactive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AppTabs() {
  const { itemCount } = useCart();
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false, // Hides the default layout labels so our text matches our custom pill boxes
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#737373",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e5e5",
          height: Platform.OS === "ios" ? 92 : 76,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 24 : 12,
        },
        headerStyle: {
          backgroundColor: "#ffffff",
          shadowColor: "transparent",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e5e5",
        },
        headerTitleStyle: {
          fontFamily: "System",
          fontWeight: "700",
          fontSize: 18,
          color: "#000000",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Lepara Ale Fele Moya",
          tabBarIcon: ({ focused }) => (
            <TabPillItem
              name={focused ? "home" : "home-outline"}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          headerTitle: "Lepara Ale Fele Moya",
          tabBarIcon: ({ focused }) => (
            <View style={{ position: "relative" }}>
              <TabPillItem
                name={focused ? "shirt" : "shirt-outline"}
                label="Shop"
                focused={focused}
              />
              {itemCount > 0 ? (
                <View
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 3,
                    backgroundColor: "red",
                    borderRadius: 8,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                    minWidth: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}
                  >
                    {itemCount}
                  </Text>
                </View>
              ) : null}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          headerTitle: "Lepara Ale Fele Moya",
          tabBarIcon: ({ focused }) => (
            <TabPillItem
              name={focused ? "calendar" : "calendar-outline"}
              label="Events"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="give"
        options={{
          title: "Give",
          headerTitle: "Lepara Ale Fele Moya",
          tabBarIcon: ({ focused }) => (
            <TabPillItem
              name={focused ? "heart" : "heart-outline"}
              label="Give"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          headerTitle: "Lepara Ale Fele Moya",
          tabBarIcon: ({ focused }) => (
            <TabPillItem
              name={focused ? "person" : "person-outline"}
              label="Account"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 68,
    height: 56,
    borderRadius: 14,
    backgroundColor: "transparent",
    marginTop: Platform.OS === "ios" ? 14 : 4,
  },
  pillActiveBackground: {
    backgroundColor: "#eaeaea", // Precise light-gray pill backdrop fill from your Figma layout
  },
  labelText: {
    fontFamily: "System",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },
  labelActive: {
    color: "#000000",
  },
  labelInactive: {
    color: "#737373",
  },
});
