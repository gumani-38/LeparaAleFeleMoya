import { API_ROUTES, ApiError, apiRequest, getResponseData } from "@/lib/api";

export type ShopProduct = {
  id: string;
  name: string;
  categoryId: number;
  category: string;
  price: string;
  priceCents: number;
  subtitle: string;
  imageUrl: string | null;
  sizes: string[];
  variants: ProductVariant[];
  inStock: boolean;
};

export type ProductVariant = {
  variantId: number;
  size: string;
  availability: string;
};

const PAGE_SIZE = 50;

export async function fetchShopProducts(): Promise<ShopProduct[]> {
  const products: ShopProduct[] = [];
  let totalPages = 1;

  for (let page = 1; page <= totalPages; page += 1) {
    const payload = await apiRequest<unknown>(
      `${API_ROUTES.products}?page=${page}&pageSize=${PAGE_SIZE}`,
    );
    const data = getResponseData(payload);

    if (!Array.isArray(data)) {
      throw new ApiError("The products response was not in the expected format.", 0);
    }

    const listedProducts = data.map(parseShopProduct);
    const productsWithVariants = await Promise.all(
      listedProducts.map(async (product) => {
        const detailPayload = await apiRequest<unknown>(
          API_ROUTES.product(product.id),
        );
        const detail = getResponseData(detailPayload);
        if (!isRecord(detail) || !Array.isArray(detail.variants)) {
          throw new ApiError(
            `Variant details for ${product.name} were not in the expected format.`,
            0,
          );
        }

        const variants = detail.variants.map(parseProductVariant);
        const availableSizes = variants
          .filter((variant) => variant.availability.toLowerCase() === "in stock")
          .map((variant) => variant.size);

        return {
          ...product,
          sizes: availableSizes,
          variants,
          inStock: product.inStock && availableSizes.length > 0,
        };
      }),
    );
    products.push(...productsWithVariants);

    if (isRecord(payload) && isRecord(payload.meta)) {
      const pageCount = payload.meta.totalPages;
      if (typeof pageCount === "number" && Number.isInteger(pageCount) && pageCount > 0) {
        totalPages = pageCount;
      }
    }
  }

  return products;
}

function parseShopProduct(value: unknown): ShopProduct {
  if (
    !isRecord(value) ||
    typeof value.productId !== "number" ||
    typeof value.name !== "string" ||
    typeof value.categoryId !== "number" ||
    typeof value.categoryName !== "string" ||
    typeof value.price !== "string" ||
    typeof value.priceCents !== "number" ||
    typeof value.subtitle !== "string" ||
    (value.imageUrl !== null && typeof value.imageUrl !== "string") ||
    !Array.isArray(value.sizes) ||
    !value.sizes.every((size) => typeof size === "string") ||
    typeof value.inStock !== "boolean"
  ) {
    throw new ApiError("A product from the server was not in the expected format.", 0);
  }

  return {
    id: String(value.productId),
    name: value.name,
    categoryId: value.categoryId,
    category: value.categoryName,
    price: value.price,
    priceCents: value.priceCents,
    subtitle: value.subtitle,
    imageUrl: value.imageUrl,
    sizes: value.sizes,
    variants: [],
    inStock: value.inStock,
  };
}

function parseProductVariant(value: unknown): ProductVariant {
  if (
    !isRecord(value) ||
    typeof value.variantId !== "number" ||
    typeof value.size !== "string" ||
    typeof value.availability !== "string"
  ) {
    throw new ApiError("A product size was not in the expected format.", 0);
  }

  return {
    variantId: value.variantId,
    size: value.size,
    availability: value.availability,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
