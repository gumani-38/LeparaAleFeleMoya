import { DigitInput } from "@/components/ui/digit-input";
import { FormField } from "@/components/ui/form-field";
import { StatusStep } from "@/components/ui/status-step";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FormState = "SIGN_IN" | "SIGN_UP" | "VERIFY_OTP";

export default function AccountScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<FormState>("SIGN_UP");
  const [activeSubTab, setActiveSubTab] = useState<
    "Orders" | "Profile" | "Security"
  >("Orders");

  // Registration fields
  const [firstName, setFirstName] = useState("Naledi");
  const [lastName, setLastName] = useState("Mokoena");
  const [emailAddress, setEmailAddress] = useState(
    "naledi.mokoena@example.com",
  );
  const [mobileNum, setMobileNum] = useState("+27 71 234 5678");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", "", "", ""]);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleCreateAccount = () => {
    if (
      !firstName ||
      !lastName ||
      !emailAddress ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    setCurrentFlow("VERIFY_OTP");
  };

  const handleVerifyComplete = () => {
    Alert.alert(
      "Account Verified",
      "Welcome to the Lepara Ale Fele Moya community!",
    );
    setIsAuthenticated(true);
  };

  const handleSignIn = () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentFlow("SIGN_IN");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {isAuthenticated ? renderAuthenticatedDashboard() : renderAuthGates()}
    </ScrollView>
  );

  function renderAuthenticatedDashboard() {
    return (
      <View style={styles.authWrapper}>
        <View style={styles.headerBlock}>
          <Text style={styles.microLabel}>
            ACCOUNT / {firstName.toUpperCase()} {lastName.toUpperCase()}
          </Text>
          <Text style={styles.mainHeaderTitle}>
            {activeSubTab === "Orders" && "My orders."}
            {activeSubTab === "Profile" && "Profile info."}
            {activeSubTab === "Security" && "Security."}
          </Text>
        </View>

        <View style={styles.subTabRowTrack}>
          {["Orders", "Profile", "Security"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.subTabBtn,
                activeSubTab === tab && styles.subTabBtnActive,
              ]}
              onPress={() => setActiveSubTab(tab as any)}
            >
              <Text
                style={[
                  styles.subTabBtnText,
                  activeSubTab === tab && styles.subTabBtnTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeSubTab === "Orders" && (
          <View style={styles.ordersContentFeed}>
            <View style={styles.trackingCard}>
              <Text style={styles.orderIdText}>#LAFM-1008</Text>
              <Text style={styles.orderDateMeta}>
                09 Oct 2026 · R310 · 1 item
              </Text>
              <Text style={styles.expectedDeliveryHeadline}>
                Expected 13 October
              </Text>
              <Text style={styles.courierMetaSubtext}>
                Demo courier · LAFM1008
              </Text>

              <StatusStep
                title="Order confirmed"
                subtitle="09 Oct 2026 · 10:24"
                isCompleted
              />
              <StatusStep
                title="Packed with care"
                subtitle="10 Oct 2026 · 08:40"
                isCompleted
              />
              <StatusStep
                title="On the way"
                subtitle="10 Oct 2026 · 14:10"
                isCompleted
              />
              <StatusStep
                title="Delivered"
                subtitle="Expected 13 Oct 2026"
                isCompleted={false}
                isLast
              />

              <View style={styles.productSummarySectionRow}>
                <Image
                  source={{ uri: "https://unsplash.com" }}
                  style={styles.imagePlaceholderMock}
                />
                <View>
                  <Text style={styles.productNameBold}>Community tee</Text>
                  <Text style={styles.productSpecsText}>
                    White / M / Qty 1 - R250
                  </Text>
                  <Text style={styles.productSpecsText}>
                    Delivery R60 · Paid total R310
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.outlineTrackBtn}>
                <Text style={styles.outlineTrackBtnText}>
                  Track with courier ↗
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeSubTab === "Profile" && (
          <View style={styles.formPaddingContainer}>
            <FormField
              label="First name *"
              value={firstName}
              onChangeText={setFirstName}
            />
            <FormField
              label="Last name *"
              value={lastName}
              onChangeText={setLastName}
            />
            <FormField
              label="Email address *"
              value={emailAddress}
              onChangeText={setEmailAddress}
            />
            <FormField
              label="Mobile number *"
              value={mobileNum}
              onChangeText={setMobileNum}
            />
          </View>
        )}

        {activeSubTab === "Security" && (
          <View style={styles.formPaddingContainer}>
            <FormField label="Current password *" secureTextEntry />
            <FormField label="New password *" secureTextEntry />
            <FormField label="Confirm new password *" secureTextEntry />
          </View>
        )}

        <View style={styles.accountActionSection}>
          <TouchableOpacity
            style={styles.signOutLinkRow}
            onPress={handleSignOut}
          >
            <Ionicons
              name="log-out-outline"
              size={18}
              color="#000"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.signOutText}>Log out of account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderAuthGates() {
    if (currentFlow === "SIGN_UP") {
      return (
        <View style={styles.contentWrapper}>
          <Text style={styles.mainHeaderTitle}>Join the community.</Text>
          <FormField
            label="First name *"
            value={firstName}
            onChangeText={setFirstName}
          />
          <FormField
            label="Last name *"
            value={lastName}
            onChangeText={setLastName}
          />
          <FormField
            label="Email address *"
            value={emailAddress}
            onChangeText={setEmailAddress}
          />
          <FormField
            label="Mobile number *"
            value={mobileNum}
            onChangeText={setMobileNum}
          />
          <FormField
            label="Password *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <FormField
            label="Confirm password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryBlackBtn}
            onPress={handleCreateAccount}
          >
            <Text style={styles.primaryBlackBtnText}>
              Create account & send code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCurrentFlow("SIGN_IN")}>
            <Text style={styles.toggleNormalText}>
              Already have an account?{" "}
              <Text style={styles.toggleBoldAction}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentFlow === "VERIFY_OTP") {
      return (
        <View style={styles.contentWrapper}>
          <Text style={styles.mainHeaderTitle}>Check your inbox.</Text>
          <Text style={styles.subtextParagraph}>
            Enter the 6-digit code sent to your email.
          </Text>
          <DigitInput code={otpCode} setCode={setOtpCode} />
          <TouchableOpacity
            style={styles.primaryBlackBtn}
            onPress={handleVerifyComplete}
          >
            <Text style={styles.primaryBlackBtnText}>Verify & continue</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentFlow === "SIGN_IN") {
      return (
        <View style={styles.contentWrapper}>
          <Text style={styles.mainHeaderTitle}>Welcome back.</Text>
          <Text style={styles.subtextParagraph}>
            Sign in to manage your orders and profile.
          </Text>

          <FormField
            label="Email address *"
            value={loginEmail}
            onChangeText={setLoginEmail}
            keyboardType="email-address"
          />
          <FormField
            label="Password *"
            value={loginPassword}
            onChangeText={setLoginPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryBlackBtn}
            onPress={handleSignIn}
          >
            <Text style={styles.primaryBlackBtnText}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCurrentFlow("SIGN_UP")}>
            <Text style={styles.toggleNormalText}>
              Don’t have an account?{" "}
              <Text style={styles.toggleBoldAction}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  }
}

// ========================================================
// PART 4: SYSTEM DESIGN STYLESHEET
// ========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  contentWrapper: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  mainHeaderTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 14,
  },
  subtextParagraph: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 20,
  },
  primaryBlackBtn: {
    backgroundColor: "#000000",
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  primaryBlackBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  toggleNormalText: { fontSize: 13, color: "#000000" },
  toggleBoldAction: { fontWeight: "700", textDecorationLine: "underline" },
  authWrapper: { flex: 1 },
  headerBlock: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 10 },
  microLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#737373",
    marginBottom: 8,
  },
  subTabRowTrack: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginVertical: 14,
  },
  subTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  subTabBtnActive: { backgroundColor: "#000000", borderColor: "#000000" },
  subTabBtnText: { fontSize: 13, color: "#000000", fontWeight: "500" },
  subTabBtnTextActive: { color: "#ffffff", fontWeight: "600" },
  ordersContentFeed: { paddingHorizontal: 20, paddingBottom: 10 },
  trackingCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  orderIdText: { fontSize: 15, fontWeight: "700", color: "#000000" },
  orderDateMeta: { fontSize: 12, color: "#737373", marginTop: 2 },
  expectedDeliveryHeadline: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000000",
    marginVertical: 8,
  },
  courierMetaSubtext: { fontSize: 13, color: "#737373", marginBottom: 16 },
  productSummarySectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  imagePlaceholderMock: {
    width: 60,
    height: 60,
    backgroundColor: "#eaeaea",
    borderRadius: 4,
    marginRight: 14,
  },
  productNameBold: { fontSize: 14, fontWeight: "700", color: "#000000" },
  productSpecsText: { fontSize: 12, color: "#737373", marginTop: 2 },
  outlineTrackBtn: {
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  outlineTrackBtnText: { fontSize: 13, fontWeight: "600", color: "#000000" },
  formPaddingContainer: { paddingHorizontal: 20, paddingTop: 8 },
  accountActionSection: {
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 16,
  },
  signOutLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    textDecorationLine: "underline",
  },
});
