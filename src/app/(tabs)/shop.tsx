import { ProductItem } from "@/components/ui/product-item";
import { SizeSelector } from "@/components/ui/size-selector";
import { useCart } from "@/components/cart-context";
import { fetchShopProducts, type ShopProduct } from "@/lib/products";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ShopScreen() {
  const router = useRouter();
  const { addItem, items, itemCount, subtotal } = useCart();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(
    null,
  );
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

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

  const selectedCartItem = selectedProduct
    ? items.find(
        (item) => item.id === selectedProduct.id && item.size === selectedSize,
      )
    : undefined;
  const selectedVariant = selectedProduct?.variants.find(
    (variant) => variant.size === selectedSize,
  );
  const selectedVariantInStock =
    selectedVariant?.availability.toLowerCase() === "in stock";

  const quickCheckoutTotal = `R${subtotal.toLocaleString("en-ZA")}`;
  const quickCheckoutLabel =
    itemCount === 0
      ? "Your bag is empty"
      : `${itemCount} item${itemCount === 1 ? "" : "s"} in bag`;

  // Filter computation logic
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const filteredProducts = products.filter((product) => {
    const searchText = search.trim().toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText) ||
      product.subtitle.toLowerCase().includes(searchText);
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openProduct = (product: ShopProduct) => {
    setQuantity(1);
    setSelectedSize(product.sizes[0] ?? "");
    setSelectedProduct(product);
  };

  const checkoutShortcut = (
    <TouchableOpacity
      style={[
        styles.checkoutShortcut,
        itemCount === 0 && styles.checkoutShortcutDisabled,
      ]}
      activeOpacity={0.9}
      disabled={itemCount === 0}
      onPress={() => router.push("/checkout")}
    >
      <View style={styles.checkoutShortcutCopy}>
        <Text style={styles.checkoutShortcutMeta}>Quick checkout</Text>
        <Text style={styles.checkoutShortcutText}>Checkout</Text>
      </View>
      <Text style={styles.checkoutShortcutTotal}>{quickCheckoutLabel}</Text>
      <Text style={styles.checkoutShortcutPrice}>
        {itemCount > 0 ? quickCheckoutTotal : ""}
      </Text>
    </TouchableOpacity>
  );

  if (selectedProduct) {
    return (
      <View style={styles.pageWrapper}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBreadcrumb}
            onPress={() => setSelectedProduct(null)}
          >
            <Text style={styles.breadcrumbText}>
              ← SHOP / {selectedProduct.category.toUpperCase()} / DETAIL
            </Text>
          </TouchableOpacity>

          <View style={styles.detailImageContainer}>
            <ProductItem
              imageUrl={selectedProduct.imageUrl}
              name={selectedProduct.name}
              price={selectedProduct.price}
              subtitle={selectedProduct.subtitle}
            />
          </View>

          <View style={styles.detailContent}>
            <Text style={styles.bodyDescription}>
              A comfortable everyday staple, connected to a shared purpose.
            </Text>

            <View style={styles.sizeHeaderRow}>
              <Text style={styles.sectionLabelTitle}>Size</Text>
              <Text style={styles.sizeGuideText}>Size guide ↗</Text>
            </View>

            <SizeSelector
              sizes={selectedProduct.sizes}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
            />

            <Text style={styles.availabilityText}>
              {selectedProduct.inStock ? "In stock" : "Sold out"}
            </Text>

            {/* Counter Grid Panel */}
            <View style={styles.quantityContainer}>
              <Text style={styles.qtyLabel}>Quantity</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.counterBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterVal}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.bagButton,
                selectedCartItem && styles.bagButtonAdded,
              ]}
              activeOpacity={0.9}
              disabled={
                Boolean(selectedCartItem) ||
                !selectedProduct.inStock ||
                !selectedVariantInStock
              }
              onPress={() => {
                addItem(
                  {
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    unitPrice: selectedProduct.priceCents / 100,
                    subtitle: selectedProduct.subtitle,
                    category: selectedProduct.category,
                    imageUrl: selectedProduct.imageUrl ?? "",
                    variants: selectedProduct.variants,
                  },
                  selectedSize,
                  quantity,
                );
              }}
            >
              <Text
                style={[
                  styles.bagButtonText,
                  selectedCartItem && styles.bagButtonTextAdded,
                ]}
              >
                {!selectedProduct.inStock
                  ? "Sold out"
                  : selectedCartItem
                  ? `In bag · ${selectedCartItem.quantity}`
                  : `Add to bag — ${selectedProduct.price}`}
              </Text>
            </TouchableOpacity>

            <Text style={styles.noticeText}>
              A verified account is required at checkout.
            </Text>
            <View style={styles.separatorLine} />
            <Text style={styles.careInstructions}>
              Care: Machine wash cold. Line dry.
            </Text>
            <Text style={styles.deliveryPolicy}>
              R60 delivery · 3-5 working days. Illustrative policy.
            </Text>
          </View>
        </ScrollView>
        {checkoutShortcut}
      </View>
    );
  }

  return (
    <View style={styles.pageWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.catalogHeader}>
          <Text style={styles.topLabel}>EVERYDAY COLLECTION</Text>
          <Text style={styles.mainHeadingTitle}>Wear your support.</Text>
        </View>

        <View style={styles.searchBoxWrapper}>
          <Text style={styles.inputMicroLabel}>Search the collection</Text>
          <TextInput
            style={styles.searchField}
            placeholder="Search products..."
            placeholderTextColor="#888888"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Horizontal Badge Track */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTrackRow}
        >
          {["All", ...categories].map((cat) => {
            const isSelected = activeCategory === cat;
            const countLabel = cat === "All" ? ` (${products.length})` : "";
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catBadgeBtn,
                  isSelected && styles.catBadgeActive,
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text
                  style={[
                    styles.catBadgeText,
                    isSelected && styles.catBadgeTextActive,
                  ]}
                >
                  {cat}
                  {countLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.resultsCountText}>
          {filteredProducts.length} products · Sort: Featured ↓
        </Text>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} color="#111111" />
        ) : loadError ? (
          <View style={styles.loadMessage}>
            <Text style={styles.loadMessageText}>{loadError}</Text>
            <TouchableOpacity onPress={() => setRetryCount((count) => count + 1)}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsGridContainer}>
            {filteredProducts.map((product) => (
              <ProductItem
                key={product.id}
                imageUrl={product.imageUrl}
                name={product.name}
                price={product.price}
                subtitle={product.subtitle}
                onPress={() => openProduct(product)}
              />
            ))}
            {filteredProducts.length === 0 && (
              <Text style={styles.loadMessageText}>No products found.</Text>
            )}
          </View>
        )}

        <Text style={styles.pricingDisclaimer}>
          Prices in ZAR · Delivery calculated at checkout.
        </Text>
      </ScrollView>
      {checkoutShortcut}
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingBottom: 112,
  },
  checkoutShortcut: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: "#0c0c0c",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  checkoutShortcutDisabled: {
    opacity: 0.65,
  },
  checkoutShortcutCopy: {
    flexShrink: 1,
  },
  checkoutShortcutMeta: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#d4d4d4",
    marginBottom: 2,
  },
  checkoutShortcutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  checkoutShortcutTotal: {
    fontSize: 11,
    fontWeight: "500",
    color: "#d4d4d4",
    marginLeft: 8,
  },
  checkoutShortcutPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginLeft: 12,
  },
  catalogHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  topLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#737373",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  mainHeadingTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
  },
  searchBoxWrapper: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  inputMicroLabel: {
    fontSize: 11,
    color: "#888888",
    marginBottom: 4,
  },
  searchField: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "500",
    padding: 0,
  },
  categoryTrackRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  catBadgeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  catBadgeActive: {
    backgroundColor: "#0c0c0c",
    borderColor: "#0c0c0c",
  },
  catBadgeText: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "500",
  },
  catBadgeTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  resultsCountText: {
    fontSize: 13,
    color: "#888888",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  productsGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  loading: {
    marginVertical: 32,
  },
  loadMessage: {
    alignItems: "center",
    paddingHorizontal: 20,
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
  infoCalloutBlock: {
    width: "47%",
    backgroundColor: "#f6f6f6",
    padding: 16,
    height: 190,
    justifyContent: "space-between",
    marginBottom: 24,
  },
  calloutHeader: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000000",
    lineHeight: 22,
  },
  calloutBody: {
    fontSize: 12,
    color: "#666666",
    lineHeight: 16,
  },
  calloutLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
  },
  pricingDisclaimer: {
    fontSize: 12,
    color: "#888888",
    paddingHorizontal: 20,
    marginVertical: 24,
  },
  backBreadcrumb: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  breadcrumbText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888888",
    letterSpacing: 0.5,
  },
  detailImageContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bodyDescription: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
    marginVertical: 16,
  },
  sizeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 8,
  },
  sectionLabelTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  sizeGuideText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000000",
  },
  availabilityText: {
    fontSize: 12,
    color: "#888888",
    marginTop: 12,
    marginBottom: 24,
  },
  quantityContainer: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  qtyLabel: {
    fontSize: 11,
    color: "#888888",
    marginBottom: 6,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  counterBtnText: {
    fontSize: 20,
    color: "#555555",
    fontWeight: "400",
  },
  counterVal: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  bagButton: {
    backgroundColor: "#0c0c0c",
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  bagButtonAdded: {
    backgroundColor: "#e8e8e8",
  },
  bagButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  bagButtonTextAdded: {
    color: "#333333",
  },
  noticeText: {
    fontSize: 11,
    color: "#999999",
    textAlign: "center",
    marginBottom: 24,
  },
  separatorLine: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginBottom: 20,
  },
  careInstructions: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  deliveryPolicy: {
    fontSize: 12,
    color: "#888888",
    lineHeight: 16,
  },
});
