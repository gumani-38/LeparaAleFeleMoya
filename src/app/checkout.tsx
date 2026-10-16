import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/components/auth-context";
import { useCart } from "@/components/cart-context";
import {
  FeedbackDialog,
  useFeedbackDialog,
} from "@/components/ui/feedback-dialog";
import { FormField } from "@/components/ui/form-field";
import { API_ROUTES, apiRequest, getResponseData } from "@/lib/api";
import {
  validateFields,
  validateName,
  validatePhone,
  validatePostalCode,
  validateText,
} from "@/lib/validation";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PAYMENT_METHODS = ["EFT", "Cash on delivery"] as const;

function createIdempotencyKey(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const { items, subtotal, updateQuantity, updateSize, removeItem, clearCart } =
    useCart();
  const [openSizeLineId, setOpenSizeLineId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>(
    PAYMENT_METHODS[0],
  );
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeliveryValidation, setShowDeliveryValidation] = useState(false);
  const { dialog, showDialog, closeDialog } = useFeedbackDialog();
  const idempotencyRef = useRef<{ request: string; key: string } | null>(null);

  const delivery = items.length > 0 ? 60 : 0;
  const total = subtotal + delivery;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    if (!isAuthenticated || !token) {
      showDialog(
        "Sign in required",
        "Sign in to your account before placing an order.",
        "info",
        [
          { label: "Sign in", onPress: () => router.push("/account") },
          { label: "Not now", variant: "secondary" },
        ],
      );
      return;
    }
    setShowDeliveryValidation(true);
    const validationError = validateFields([
      { value: recipient, validate: validateName("Recipient name") },
      { value: streetAddress, validate: validateText("Street address", 5) },
      { value: city, validate: validateName("City") },
      { value: postalCode, validate: validatePostalCode },
      { value: phone, validate: validatePhone },
    ]);
    if (validationError) {
      showDialog("Check your delivery details", validationError);
      return;
    }
    if (!acceptTerms) {
      showDialog(
        "Confirmation required",
        "Please accept the delivery terms before placing your order.",
      );
      return;
    }
    if (items.some((item) => !Number.isInteger(item.variantId) || item.quantity > 10)) {
      showDialog(
        "Check your bag",
        "One or more items have an invalid size or quantity. Please update your bag and try again.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const orderBody = {
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        recipientName: recipient.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        phone: phone.trim(),
        paymentMethod,
        acceptTerms: true,
      };
      const requestFingerprint = JSON.stringify(orderBody);
      if (idempotencyRef.current?.request !== requestFingerprint) {
        idempotencyRef.current = {
          request: requestFingerprint,
          key: createIdempotencyKey(),
        };
      }
      const response = await apiRequest<unknown>(API_ROUTES.orders, {
        method: "POST",
        token,
        idempotencyKey: idempotencyRef.current.key,
        body: orderBody,
      });
      const data = getResponseData(response);
      const orderReference =
        typeof data === "object" &&
        data !== null &&
        "orderNumber" in data &&
        typeof data.orderNumber === "string"
          ? ` (${data.orderNumber})`
          : "";
      clearCart();
      idempotencyRef.current = null;
      showDialog(
        "Order placed",
        `Your order has been submitted${orderReference}.`,
        "success",
      );
    } catch (error) {
      showDialog(
        "Could not place order",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.brandTitle}>Lepara Ale Fele Moya</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="cart-outline" size={24} color="#111111" />
          </TouchableOpacity>
        </View>

        <Text style={styles.pageIntro}>BAG → DELIVERY → PAYMENT</Text>
        <Text style={styles.heroTitle}>Your bag. Your purpose.</Text>

        <View style={styles.accountBanner}>
          <Text style={styles.accountText}>
            {isAuthenticated
              ? "Signed-in account"
              : "Sign in is required to place your order"}
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyCart}>
            <Ionicons name="bag-outline" size={30} color="#777777" />
            <Text style={styles.emptyCartTitle}>Your bag is empty</Text>
            <Text style={styles.emptyCartText}>
              Add something from the shop to continue.
            </Text>
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={() => router.replace("/shop")}
            >
              <Text style={styles.continueShoppingText}>Continue shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.lineId} style={styles.itemRow}>
              <View style={styles.itemImage} />
              <View style={styles.itemMeta}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDetail}>
                  {item.subtitle.split(" / ")[0]} / {item.size} · R
                  {item.unitPrice.toLocaleString("en-ZA")}
                </Text>

                <View style={styles.quantityRow}>
                  <Text style={styles.productDetail}>Quantity</Text>
                  <View style={styles.counterWrap}>
                    <TouchableOpacity
                      style={styles.counterButton}
                      accessibilityLabel={`Decrease ${item.name} quantity`}
                      onPress={() =>
                        updateQuantity(item.lineId, Math.max(1, item.quantity - 1))
                      }
                    >
                      <Text style={styles.counterButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.counterButton}
                      accessibilityLabel={`Increase ${item.name} quantity`}
                      onPress={() =>
                        updateQuantity(item.lineId, Math.min(10, item.quantity + 1))
                      }
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() =>
                      setOpenSizeLineId((current) =>
                        current === item.lineId ? null : item.lineId,
                      )
                    }
                  >
                    <Text style={styles.linkText}>Edit size</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.name} from bag`}
                    onPress={() => removeItem(item.lineId)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#111111" />
                  </TouchableOpacity>
                </View>

                {openSizeLineId === item.lineId ? (
                  <View style={styles.sizeOptionsWrap}>
                    {item.variants
                      .filter((variant) => variant.availability.toLowerCase() === "in stock")
                      .map((variant) => variant.size)
                      .map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.sizeOption,
                          item.size === option && styles.sizeOptionSelected,
                        ]}
                        onPress={() => {
                          updateSize(item.lineId, option);
                          setOpenSizeLineId(null);
                        }}
                      >
                        <Text
                          style={[
                            styles.sizeOptionText,
                            item.size === option &&
                              styles.sizeOptionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          ))
        )}

        <View style={styles.sectionDivider} />

        <Text style={styles.sectionTitle}>01 / Delivery</Text>

        <View style={styles.fieldGroup}>
          <FormField
            label="Recipient *"
            value={recipient}
            onChangeText={setRecipient}
            validate={validateName("Recipient name")}
            showValidation={showDeliveryValidation}
            autoCapitalize="words"
            autoComplete="name"
            placeholder="Full name"
            maxLength={80}
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldGroup}>
          <FormField
            label="Street address *"
            value={streetAddress}
            onChangeText={setStreetAddress}
            validate={validateText("Street address", 5)}
            showValidation={showDeliveryValidation}
            autoCapitalize="words"
            autoComplete="street-address"
            placeholder="Street address"
            maxLength={160}
            returnKeyType="next"
          />
        </View>

        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <FormField
              label="City *"
              value={city}
              onChangeText={setCity}
              validate={validateName("City")}
              showValidation={showDeliveryValidation}
              autoCapitalize="words"
              placeholder="City"
              maxLength={80}
              returnKeyType="next"
            />
          </View>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <FormField
              label="Postal code *"
              value={postalCode}
              onChangeText={setPostalCode}
              validate={validatePostalCode}
              showValidation={showDeliveryValidation}
              keyboardType="number-pad"
              autoComplete="postal-code"
              placeholder="e.g. 1801"
              maxLength={4}
              returnKeyType="next"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <FormField
            label="Phone *"
            value={phone}
            onChangeText={setPhone}
            validate={validatePhone}
            showValidation={showDeliveryValidation}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="082 123 4567 or +27 82 123 4567"
            maxLength={16}
            returnKeyType="done"
          />
        </View>

        <Text style={styles.sectionTitle}>02 / Payment</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Payment method</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ expanded: showPaymentOptions }}
            onPress={() => setShowPaymentOptions((expanded) => !expanded)}
          >
            <Text style={styles.dropdownText}>
              {paymentMethod === "EFT" ? "EFT bank transfer" : paymentMethod}
            </Text>
            <Ionicons
              name={showPaymentOptions ? "chevron-up" : "chevron-down"}
              size={18}
              color="#111111"
            />
          </TouchableOpacity>
          {showPaymentOptions ? (
            <View style={styles.paymentOptions}>
              {PAYMENT_METHODS.map((method) => {
                const selected = paymentMethod === method;
                return (
                  <TouchableOpacity
                    key={method}
                    style={styles.paymentOption}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setPaymentMethod(method);
                      setShowPaymentOptions(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        selected && styles.paymentOptionSelected,
                      ]}
                    >
                      {method === "EFT" ? "EFT bank transfer" : method}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark" size={18} color="#111111" />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        <Text style={styles.paymentMethodNote}>
          {paymentMethod === "EFT"
            ? "Bank transfer instructions will be provided after the order is submitted."
            : "Pay the delivery driver when your order arrives."}
        </Text>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>R{subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>R{delivery}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>R{total}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.termsRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptTerms }}
          onPress={() => setAcceptTerms((accepted) => !accepted)}
        >
          <View style={[styles.checkBox, acceptTerms && styles.checkedBox]}>
            {acceptTerms ? (
              <Ionicons name="checkmark" size={14} color="#ffffff" />
            ) : null}
          </View>
          <Text style={styles.termsText}>I agree to the Terms and illustrative delivery policy.</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={[
          styles.primaryButton,
          (items.length === 0 || isSubmitting) && styles.disabledPrimaryButton,
        ]}
        activeOpacity={0.9}
        disabled={items.length === 0 || isSubmitting}
        onPress={handlePlaceOrder}
        >
        <Text style={styles.primaryButtonText}>
          {isSubmitting ? "Submitting order..." : `Place order — R${total}`}
        </Text>
        </TouchableOpacity>

        <Text style={styles.noteText}>
          Final prices and delivery charges are confirmed by the server when your order is placed.
        </Text>
      </ScrollView>
      <FeedbackDialog dialog={dialog} onClose={closeDialog} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pageIntro: {
    fontSize: 10,
    fontWeight: "600",
    color: "#7a7a7a",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "800",
    letterSpacing: -1.3,
    color: "#111111",
    marginBottom: 22,
  },
  accountBanner: {
    backgroundColor: "#efefef",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  accountText: {
    fontSize: 14,
    color: "#111111",
    fontWeight: "500",
  },
  emptyCart: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
  emptyCartTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "700",
    color: "#111111",
  },
  emptyCartText: {
    marginTop: 5,
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
  },
  continueShoppingButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: "#111111",
  },
  continueShoppingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 12,
  },
  itemImage: {
    width: 104,
    height: 104,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 14,
  },
  itemMeta: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 6,
  },
  productDetail: {
    fontSize: 15,
    color: "#111111",
    marginBottom: 4,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  counterWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 8,
    overflow: "hidden",
  },
  counterButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
  },
  counterButtonText: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "500",
  },
  quantityValue: {
    minWidth: 34,
    textAlign: "center",
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111111",
  },
  sizeOptionsWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  sizeOption: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#dedede",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  sizeOptionSelected: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },
  sizeOptionText: {
    color: "#333333",
    fontSize: 12,
    fontWeight: "600",
  },
  sizeOptionTextSelected: {
    color: "#ffffff",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#eaeaea",
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 18,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  rowFields: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#111111",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#111111",
  },
  paymentOptions: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  paymentOption: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  paymentOptionSelected: {
    fontWeight: "700",
  },
  paymentMethodNote: {
    marginTop: -4,
    marginBottom: 14,
    color: "#666666",
    fontSize: 13,
    lineHeight: 18,
  },
  summaryBox: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginTop: 12,
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalRow: {
    marginBottom: 0,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#d9d9d9",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#111111",
  },
  summaryValue: {
    fontSize: 16,
    color: "#111111",
    fontWeight: "700",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#111111",
    backgroundColor: "#ffffff",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#111111",
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#111111",
  },
  primaryButton: {
    backgroundColor: "#111111",
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  disabledPrimaryButton: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  noteText: {
    textAlign: "center",
    fontSize: 12,
    color: "#666666",
    lineHeight: 18,
    marginBottom: 12,
  },
});
