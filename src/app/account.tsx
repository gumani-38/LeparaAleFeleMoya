import { useAuth } from "@/components/auth-context";
import { DigitInput } from "@/components/ui/digit-input";
import {
  FeedbackDialog,
  useFeedbackDialog,
} from "@/components/ui/feedback-dialog";
import { FormField } from "@/components/ui/form-field";
import {
  API_ROUTES,
  ApiError,
  apiRequest,
  getAccessToken,
  getResponseUser,
} from "@/lib/api";
import {
  validateEmail,
  validateFields,
  validateName,
  validatePassword,
  validatePhone,
  validateRequired,
} from "@/lib/validation";
import { fetchCustomerOrders, type OrderSummary } from "@/lib/orders";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FormState = "SIGN_IN" | "SIGN_UP" | "VERIFY_OTP";
type ValidationContext =
  | "registration"
  | "login"
  | "profile"
  | "security"
  | null;

function formatOrderDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function maskEmail(value: string): string {
  const [localPart, domain] = value.split("@");
  if (!localPart || !domain) return value;
  return `${localPart.slice(0, 1)}${"•".repeat(Math.max(3, Math.min(localPart.length - 1, 6)))}@${domain}`;
}

export default function AccountScreen() {
  const { token, isAuthenticated, isAuthLoading, setSession, signOut } =
    useAuth();
  const [currentFlow, setCurrentFlow] = useState<FormState>("SIGN_UP");
  const [activeSubTab, setActiveSubTab] = useState<
    "Orders" | "Profile" | "Security"
  >("Orders");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [verificationSecondsLeft, setVerificationSecondsLeft] = useState(600);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(60);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileRetryCount, setProfileRetryCount] = useState(0);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isLoadingMoreOrders, setIsLoadingMoreOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersRetryCount, setOrdersRetryCount] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [validationContext, setValidationContext] =
    useState<ValidationContext>(null);
  const { dialog, showDialog, closeDialog } = useFeedbackDialog();

  useEffect(() => {
    if (currentFlow !== "VERIFY_OTP") return;
    const timer = setInterval(() => {
      setVerificationSecondsLeft((seconds) => Math.max(0, seconds - 1));
      setResendSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentFlow]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [mobileNum, setMobileNum] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    if (!token || isAuthLoading) return;
    let isCurrent = true;

    const loadProfile = async () => {
      setIsProfileLoading(true);
      setProfileError(null);
      try {
        const response = await apiRequest<unknown>(API_ROUTES.updateProfile, {
          token,
        });
        const user = getResponseUser(response);
        if (!user) {
          throw new Error("The profile response did not contain account details.");
        }

        if (isCurrent) {
          setFirstName(readUserField(user, "firstName", "first_name"));
          setLastName(readUserField(user, "lastName", "last_name"));
          setEmailAddress(readUserField(user, "email"));
          setMobileNum(readUserField(user, "mobile", "phone", "phoneNumber"));
        }
      } catch (error) {
        if (isCurrent) {
          if (error instanceof ApiError && error.status === 401) {
            try {
              await signOut();
              setFirstName("");
              setLastName("");
              setEmailAddress("");
              setMobileNum("");
              setLoginPassword("");
              setCurrentFlow("SIGN_IN");
              setProfileError(null);
              showDialog(
                "Session expired",
                "Please sign in again to access your account.",
                "info",
              );
            } catch (signOutError) {
              setProfileError(
                signOutError instanceof Error
                  ? `Your session expired, but it could not be cleared: ${signOutError.message}`
                  : "Your session expired, but it could not be cleared. Please try again.",
              );
            }
          } else {
            setProfileError(
              error instanceof Error
                ? error.message
                : "Could not load your profile. Please try again.",
            );
          }
        }
      } finally {
        if (isCurrent) setIsProfileLoading(false);
      }
    };

    void loadProfile();
    return () => {
      isCurrent = false;
    };
  }, [isAuthLoading, profileRetryCount, showDialog, signOut, token]);

  useEffect(() => {
    if (!token || isAuthLoading || !isAuthenticated) return;

    let isCurrent = true;
    const loadOrders = async () => {
      setIsOrdersLoading(true);
      setOrdersError(null);
      try {
        const result = await fetchCustomerOrders(token, 1);
        if (isCurrent) {
          setOrders(result.orders);
          setOrderPage(1);
          setOrderTotalPages(result.totalPages);
        }
      } catch (error) {
        if (isCurrent) {
          setOrdersError(
            error instanceof Error
              ? error.message
              : "Could not load your order history. Please try again.",
          );
        }
      } finally {
        if (isCurrent) setIsOrdersLoading(false);
      }
    };

    void loadOrders();
    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated, isAuthLoading, ordersRetryCount, token]);

  const handleLoadMoreOrders = async () => {
    if (!token || isLoadingMoreOrders || orderPage >= orderTotalPages) return;
    const nextPage = orderPage + 1;
    setIsLoadingMoreOrders(true);
    setOrdersError(null);
    try {
      const result = await fetchCustomerOrders(token, nextPage);
      setOrders((current) => [...current, ...result.orders]);
      setOrderPage(nextPage);
      setOrderTotalPages(result.totalPages);
    } catch (error) {
      setOrdersError(
        error instanceof Error
          ? error.message
          : "Could not load more orders. Please try again.",
      );
    } finally {
      setIsLoadingMoreOrders(false);
    }
  };

  const handleCreateAccount = async () => {
    const normalizedEmail = emailAddress.trim().toLowerCase();
    setValidationContext("registration");
    const validationError = validateFields([
      { value: firstName, validate: validateName("First name") },
      { value: lastName, validate: validateName("Last name") },
      { value: normalizedEmail, validate: validateEmail },
      { value: mobileNum, validate: validatePhone },
      { value: password, validate: validatePassword },
      {
        value: password,
        validate: (value) =>
          value.length > 64
            ? "Password must be 64 characters or fewer."
            : /[A-Za-z]/.test(value) && /\d/.test(value)
              ? undefined
              : "Password must contain at least one letter and one number.",
      },
      {
        value: confirmPassword,
        validate: (value) =>
          validateRequired("Confirm password")(value) ??
          (value === password ? undefined : "Passwords do not match."),
      },
    ]);
    if (validationError) {
      showDialog("Check your details", validationError);
      return;
    }
    if (!acceptTerms) {
      showDialog(
        "Acceptance required",
        "Please accept the terms and privacy policy to create an account.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest(API_ROUTES.register, {
        method: "POST",
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          mobile: mobileNum.trim(),
          password,
          confirmPassword,
          acceptTerms: true,
        },
      });
      setEmailAddress(normalizedEmail);
      setOtpCode(["", "", "", "", "", ""]);
      setVerificationSecondsLeft(600);
      setResendSecondsLeft(60);
      setCurrentFlow("VERIFY_OTP");
      showDialog(
        "Check your email",
        "Enter the verification code we sent.",
        "success",
      );
    } catch (error) {
      showDialog(
        "Registration failed",
        error instanceof Error ? error.message : "Please try again.",
      );
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerificationCode = async () => {
    if (resendSecondsLeft > 0 || isResendingCode) return;
    setIsResendingCode(true);
    try {
      await apiRequest(API_ROUTES.resendCode, {
        method: "POST",
        body: { email: emailAddress.trim().toLowerCase() },
      });
      setOtpCode(["", "", "", "", "", ""]);
      setVerificationSecondsLeft(600);
      setResendSecondsLeft(60);
      showDialog(
        "Code requested",
        "If this email address needs a code, a new one is on its way.",
        "success",
      );
    } catch (error) {
      showDialog(
        "Could not resend code",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsResendingCode(false);
    }
  };

  const handleVerifyComplete = async () => {
    const code = otpCode.join("");
    if (!/^\d{6}$/.test(code)) {
      showDialog(
        "Enter your code",
        "The verification code must have 6 digits.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest<unknown>(API_ROUTES.verifyEmail, {
        method: "POST",
        body: { email: emailAddress.trim().toLowerCase(), code },
      });
      const accessToken = getAccessToken(response);
      if (accessToken) {
        await setSession(accessToken);
        showDialog(
          "Account verified",
          "Welcome to the Lepara Ale Fele Moya community!",
          "success",
        );
      } else {
        showDialog("Email verified", "Sign in to continue.", "success");
        setCurrentFlow("SIGN_IN");
      }
    } catch (error) {
      showDialog(
        "Verification failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async () => {
    const normalizedEmail = loginEmail.trim().toLowerCase();
    setValidationContext("login");
    const validationError = validateFields([
      { value: normalizedEmail, validate: validateEmail },
      { value: loginPassword, validate: validateRequired("Password") },
    ]);
    if (validationError) {
      showDialog("Check your details", validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest<unknown>(API_ROUTES.login, {
        method: "POST",
        body: { email: normalizedEmail, password: loginPassword },
      });
      const accessToken = getAccessToken(response);
      if (!accessToken) {
        throw new Error("The login response did not include an access token.");
      }

      const user = getResponseUser(response);
      if (user) {
        setFirstName(readUserField(user, "firstName", "first_name"));
        setLastName(readUserField(user, "lastName", "last_name"));
        setEmailAddress(readUserField(user, "email"));
        setMobileNum(readUserField(user, "phone", "mobile", "phoneNumber"));
      } else {
        setEmailAddress(normalizedEmail);
      }
      await setSession(accessToken);
    } catch (error) {
      showDialog(
        "Sign in failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) return;
    const normalizedEmail = emailAddress.trim().toLowerCase();
    setValidationContext("profile");
    const validationError = validateFields([
      { value: firstName, validate: validateName("First name") },
      { value: lastName, validate: validateName("Last name") },
      { value: normalizedEmail, validate: validateEmail },
      { value: mobileNum, validate: validatePhone },
    ]);
    if (validationError) {
      showDialog("Check your profile", validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest(API_ROUTES.updateProfile, {
        method: "PATCH",
        token,
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          mobile: mobileNum.trim(),
        },
      });
      showDialog(
        "Profile updated",
        "Your profile changes have been saved.",
        "success",
      );
    } catch (error) {
      showDialog(
        "Could not update profile",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!token) return;
    setValidationContext("security");
    const validationError = validateFields([
      {
        value: currentPassword,
        validate: validateRequired("Current password"),
      },
      { value: newPassword, validate: validatePassword },
      {
        value: confirmNewPassword,
        validate: (value) =>
          validateRequired("Confirm new password")(value) ??
          (value === newPassword ? undefined : "Passwords do not match."),
      },
    ]);
    if (validationError) {
      showDialog("Check your password", validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest(API_ROUTES.changePassword, {
        method: "PATCH",
        token,
        body: { currentPassword, newPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      showDialog(
        "Password updated",
        "Your password has been changed.",
        "success",
      );
    } catch (error) {
      showDialog(
        "Could not change password",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setLoginPassword("");
      setFirstName("");
      setLastName("");
      setEmailAddress("");
      setMobileNum("");
      setCurrentFlow("SIGN_IN");
    } catch (error) {
      showDialog(
        "Could not sign out",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {isAuthLoading
          ? null
          : isAuthenticated
            ? renderAuthenticatedDashboard()
            : renderAuthGates()}
      </ScrollView>
      <FeedbackDialog dialog={dialog} onClose={closeDialog} />
    </>
  );

  function renderAuthenticatedDashboard() {
    return (
      <View style={styles.authWrapper}>
        <View style={styles.headerBlock}>
          <Text style={styles.microLabel}>
            ACCOUNT /{" "}
            {[firstName, lastName].filter(Boolean).join(" ").toUpperCase()}
          </Text>
          <Text style={styles.mainHeaderTitle}>
            {activeSubTab === "Orders" && "My orders."}
            {activeSubTab === "Profile" && "Profile info."}
            {activeSubTab === "Security" && "Security."}
          </Text>
        </View>

        <View style={styles.subTabRowTrack}>
          {(["Orders", "Profile", "Security"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.subTabBtn,
                activeSubTab === tab && styles.subTabBtnActive,
              ]}
              onPress={() => setActiveSubTab(tab)}
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
            <View style={styles.ordersSectionHeader}>
              <Text style={styles.ordersSectionTitle}>Order history</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Refresh order history"
                onPress={() => setOrdersRetryCount((count) => count + 1)}
                disabled={isOrdersLoading}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={isOrdersLoading ? "#aaaaaa" : "#111111"}
                />
              </TouchableOpacity>
            </View>
            {isOrdersLoading ? (
              <ActivityIndicator
                style={styles.ordersStatus}
                color="#111111"
                accessibilityLabel="Loading order history"
              />
            ) : ordersError ? (
              <View style={styles.ordersStatus}>
                <Text style={styles.ordersErrorText}>{ordersError}</Text>
                <TouchableOpacity
                  onPress={() => setOrdersRetryCount((count) => count + 1)}
                >
                  <Text style={styles.ordersRetryText}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : orders.length === 0 ? (
              <Text style={styles.productSpecsText}>
                You haven’t placed any orders yet.
              </Text>
            ) : (
              <>
                {orders.map((order) => (
                  <View key={order.orderNumber} style={styles.orderCard}>
                    <View style={styles.orderHeaderRow}>
                      <View style={styles.orderHeading}>
                        <Text style={styles.orderIdText}>{order.orderNumber}</Text>
                        <Text style={styles.orderDateMeta}>
                          {formatOrderDate(order.placedAt)}
                        </Text>
                      </View>
                      <Text style={styles.orderStatusBadge}>
                        {order.statusLabel}
                      </Text>
                    </View>
                    {order.firstItem ? (
                      <View style={styles.orderItemSummary}>
                        <Text style={styles.orderItemName}>
                          {order.firstItem.name}
                        </Text>
                        <Text style={styles.productSpecsText}>
                          {order.firstItem.size} · {order.itemCount}{" "}
                          {order.itemCount === 1 ? "item" : "items"}
                          {order.itemCount > 1 ? " in this order" : ""}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.orderFooterRow}>
                      <Text style={styles.productSpecsText}>
                        {order.paymentMethodLabel}
                      </Text>
                      <Text style={styles.orderTotalText}>{order.total}</Text>
                    </View>
                  </View>
                ))}
                {ordersError ? (
                  <Text style={styles.ordersErrorText}>{ordersError}</Text>
                ) : null}
                {orderPage < orderTotalPages ? (
                  <TouchableOpacity
                    style={styles.ordersMoreButton}
                    onPress={handleLoadMoreOrders}
                    disabled={isLoadingMoreOrders}
                  >
                    {isLoadingMoreOrders ? (
                      <ActivityIndicator color="#111111" />
                    ) : (
                      <Text style={styles.ordersRetryText}>Load more orders</Text>
                    )}
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </View>
        )}

        {activeSubTab === "Profile" && (
          <View style={styles.formPaddingContainer}>
            {isProfileLoading ? (
              <ActivityIndicator
                style={styles.profileStatus}
                color="#111111"
              />
            ) : profileError ? (
              <View style={styles.profileStatus}>
                <Text style={styles.profileErrorText}>{profileError}</Text>
                <TouchableOpacity
                  onPress={() =>
                    setProfileRetryCount((count) => count + 1)
                  }
                >
                  <Text style={styles.profileRetryText}>Try again</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <FormField
              label="First name *"
              value={firstName}
              onChangeText={setFirstName}
              editable={!isProfileLoading && !profileError}
              validate={validateName("First name")}
              showValidation={validationContext === "profile"}
              autoCapitalize="words"
              maxLength={80}
            />
            <FormField
              label="Last name *"
              value={lastName}
              onChangeText={setLastName}
              editable={!isProfileLoading && !profileError}
              validate={validateName("Last name")}
              showValidation={validationContext === "profile"}
              autoCapitalize="words"
              maxLength={80}
            />
            <FormField
              label="Email address *"
              value={emailAddress}
              onChangeText={setEmailAddress}
              editable={!isProfileLoading && !profileError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              validate={validateEmail}
              showValidation={validationContext === "profile"}
              autoComplete="email"
              placeholder="name@example.com"
              maxLength={254}
            />
            <FormField
              label="Mobile number *"
              value={mobileNum}
              onChangeText={setMobileNum}
              editable={!isProfileLoading && !profileError}
              validate={validatePhone}
              showValidation={validationContext === "profile"}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="082 123 4567 or +27 82 123 4567"
              maxLength={16}
            />
            <TouchableOpacity
              style={styles.primaryBlackBtn}
              disabled={isSubmitting || isProfileLoading || Boolean(profileError)}
              onPress={handleSaveProfile}
            >
              <Text style={styles.primaryBlackBtnText}>
                {isSubmitting ? "Saving..." : "Save profile"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeSubTab === "Security" && (
          <View style={styles.formPaddingContainer}>
            <FormField
              label="Current password *"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              validate={validateRequired("Current password")}
              showValidation={validationContext === "security"}
              secureTextEntry
            />
            <FormField
              label="New password *"
              value={newPassword}
              onChangeText={setNewPassword}
              validate={validatePassword}
              showValidation={validationContext === "security"}
              secureTextEntry
              maxLength={128}
            />
            <FormField
              label="Confirm new password *"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              validate={(value) =>
                validateRequired("Confirm new password")(value) ??
                (value === newPassword ? undefined : "Passwords do not match.")
              }
              showValidation={validationContext === "security"}
              secureTextEntry
              maxLength={128}
            />
            <TouchableOpacity
              style={styles.primaryBlackBtn}
              disabled={isSubmitting}
              onPress={handleChangePassword}
            >
              <Text style={styles.primaryBlackBtnText}>
                {isSubmitting ? "Saving..." : "Change password"}
              </Text>
            </TouchableOpacity>
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
            validate={validateName("First name")}
            showValidation={validationContext === "registration"}
            autoCapitalize="words"
            autoComplete="given-name"
            placeholder="e.g. Naledi"
            maxLength={80}
          />
          <FormField
            label="Last name *"
            value={lastName}
            onChangeText={setLastName}
            validate={validateName("Last name")}
            showValidation={validationContext === "registration"}
            autoCapitalize="words"
            autoComplete="family-name"
            placeholder="e.g. Mokoena"
            maxLength={80}
          />
          <FormField
            label="Email address *"
            value={emailAddress}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            validate={validateEmail}
            showValidation={validationContext === "registration"}
            autoComplete="email"
            placeholder="name@example.com"
            maxLength={254}
          />
          <FormField
            label="Mobile number *"
            value={mobileNum}
            onChangeText={setMobileNum}
            validate={validatePhone}
            showValidation={validationContext === "registration"}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="082 123 4567 or +27 82 123 4567"
            maxLength={16}
          />
          <FormField
            label="Password *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            validate={validatePassword}
            showValidation={validationContext === "registration"}
            autoComplete="new-password"
            maxLength={128}
          />
          <FormField
            label="Confirm password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            validate={(value) =>
              validateRequired("Confirm password")(value) ??
              (value === password ? undefined : "Passwords do not match.")
            }
            showValidation={validationContext === "registration"}
            autoComplete="new-password"
            maxLength={128}
          />

          <TouchableOpacity
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptTerms }}
            style={styles.termsRow}
            onPress={() => setAcceptTerms((accepted) => !accepted)}
          >
            <View
              style={[
                styles.termsCheckbox,
                acceptTerms && styles.termsCheckboxChecked,
              ]}
            >
              {acceptTerms ? (
                <Ionicons name="checkmark" size={15} color="#ffffff" />
              ) : null}
            </View>
            <Text style={styles.termsText}>
              I accept the terms and privacy policy.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBlackBtn}
            disabled={isSubmitting}
            onPress={handleCreateAccount}
          >
            <Text style={styles.primaryBlackBtnText}>
              {isSubmitting
                ? "Creating account..."
                : "Create account & send code"}
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
        <View style={styles.verifyContent}>
          <Ionicons
            name="shield-checkmark-outline"
            size={38}
            color="#111111"
            style={styles.verifyShield}
          />
          <Text style={styles.verifyStepLabel}>ACCOUNT SETUP · STEP 2 OF 2</Text>
          <Text style={styles.verifyTitle}>Check your inbox.</Text>
          <View style={styles.verifyStatus}>
            <Ionicons name="checkmark" size={13} color="#111111" />
            <Text style={styles.verifyStatusText}>
              Account created · Email unverified
            </Text>
          </View>
          <Text style={styles.verifyDescription}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={styles.verifyEmail}>{maskEmail(emailAddress)}</Text> to
            complete your account setup.
          </Text>
          <Text style={styles.verifyFieldLabel}>Email verification code *</Text>
          <DigitInput code={otpCode} setCode={setOtpCode} />
          <Text style={styles.verifyCodeStatus}>
            {otpCode.every(Boolean)
              ? "Code entered · Ready to verify"
              : `${otpCode.filter(Boolean).length} of 6 digits entered`}
          </Text>
          <Text style={styles.verifyExpiry}>
            {verificationSecondsLeft > 0
              ? `Expires in ${formatCountdown(verificationSecondsLeft)}`
              : "This code has expired. Request a new code to continue."}
          </Text>
          <TouchableOpacity
            style={[styles.primaryBlackBtn, styles.verifyButton]}
            disabled={isSubmitting}
            onPress={handleVerifyComplete}
          >
            <Text style={styles.primaryBlackBtnText}>
              {isSubmitting ? "Verifying..." : "Verify & continue"}
            </Text>
          </TouchableOpacity>
          <View style={styles.resendRow}>
            <Text style={styles.verifyBodyText}>Didn&apos;t receive it?</Text>
            <TouchableOpacity
              onPress={handleResendVerificationCode}
              disabled={resendSecondsLeft > 0 || isResendingCode}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.resendAction,
                  (resendSecondsLeft > 0 || isResendingCode) &&
                    styles.resendActionDisabled,
                ]}
              >
                {isResendingCode
                  ? "Sending..."
                  : resendSecondsLeft > 0
                    ? `Resend in ${formatCountdown(resendSecondsLeft)}`
                    : "Resend code"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.verifyHelper}>
            Check spam or request a new code. Your old code will no longer work.
          </Text>
          <View style={styles.verifyDivider} />
          <TouchableOpacity
            style={styles.changeEmailButton}
            onPress={() => setCurrentFlow("SIGN_UP")}
          >
            <Ionicons name="arrow-back" size={15} color="#111111" />
            <Text style={styles.changeEmailText}>Change email address</Text>
          </TouchableOpacity>
          <Text style={styles.verifyFooterNote}>
            Verification codes are sent to your email and expire after 10 minutes.
          </Text>
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
            autoCapitalize="none"
            autoCorrect={false}
            validate={validateEmail}
            showValidation={validationContext === "login"}
            autoComplete="email"
            placeholder="name@example.com"
            maxLength={254}
          />
          <FormField
            label="Password *"
            value={loginPassword}
            onChangeText={setLoginPassword}
            secureTextEntry
            autoCapitalize="none"
            validate={validateRequired("Password")}
            showValidation={validationContext === "login"}
            autoComplete="current-password"
            maxLength={128}
          />

          <TouchableOpacity
            style={styles.primaryBlackBtn}
            disabled={isSubmitting}
            onPress={handleSignIn}
          >
            <Text style={styles.primaryBlackBtnText}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Text>
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

function readUserField(
  user: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = user[key];
    if (typeof value === "string") return value;
  }
  return "";
}

// ========================================================
// PART 4: SYSTEM DESIGN STYLESHEET
// ========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  contentWrapper: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  verifyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  verifyShield: { marginBottom: 25 },
  verifyStepLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#737373",
    marginBottom: 10,
  },
  verifyTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: "#111111",
    marginBottom: 22,
  },
  verifyStatus: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 26,
  },
  verifyStatusText: {
    fontSize: 11,
    color: "#111111",
    fontWeight: "600",
    marginLeft: 4,
  },
  verifyDescription: {
    fontSize: 15,
    lineHeight: 23,
    color: "#222222",
    marginBottom: 24,
  },
  verifyEmail: { fontWeight: "600", color: "#111111" },
  verifyFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111111",
  },
  verifyCodeStatus: {
    fontSize: 12,
    color: "#737373",
    marginTop: 1,
  },
  verifyExpiry: { fontSize: 11, color: "#737373", marginTop: 18 },
  verifyButton: { marginTop: 25, marginBottom: 20 },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  verifyBodyText: { fontSize: 13, color: "#222222" },
  resendAction: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
    textDecorationLine: "underline",
  },
  resendActionDisabled: { color: "#777777", textDecorationLine: "none" },
  verifyHelper: {
    fontSize: 12,
    lineHeight: 18,
    color: "#737373",
    marginBottom: 24,
  },
  verifyDivider: {
    height: 1,
    backgroundColor: "#dddddd",
    marginBottom: 23,
  },
  changeEmailButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 4,
    marginBottom: 26,
  },
  changeEmailText: {
    fontSize: 13,
    color: "#111111",
    marginLeft: 5,
  },
  verifyFooterNote: { fontSize: 11, color: "#737373" },
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
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  termsCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#888888",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  termsCheckboxChecked: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#333333",
  },
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
  ordersSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 8,
  },
  ordersSectionTitle: { fontSize: 16, fontWeight: "700", color: "#111111" },
  ordersStatus: { paddingVertical: 24, alignItems: "center" },
  ordersErrorText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#b42318",
    textAlign: "center",
  },
  ordersRetryText: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  orderCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  orderHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  orderHeading: { flexShrink: 1, paddingRight: 10 },
  orderStatusBadge: {
    color: "#111111",
    backgroundColor: "#eaeaea",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: "600",
    overflow: "hidden",
  },
  orderItemSummary: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e9e9e9",
    marginBottom: 12,
  },
  orderItemName: { fontSize: 14, fontWeight: "600", color: "#111111" },
  orderFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotalText: { fontSize: 15, fontWeight: "700", color: "#111111" },
  ordersMoreButton: {
    borderWidth: 1,
    borderColor: "#111111",
    borderRadius: 6,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 20,
  },
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
  profileStatus: {
    marginBottom: 16,
  },
  profileErrorText: {
    color: "#b42318",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  profileRetryText: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
    textDecorationLine: "underline",
  },
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
