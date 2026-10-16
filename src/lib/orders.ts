import { API_ROUTES, ApiError, apiRequest, getResponseData } from "@/lib/api";

export type OrderSummary = {
  orderNumber: string;
  statusLabel: string;
  paymentMethodLabel: string;
  placedAt: string;
  itemCount: number;
  total: string;
  firstItem: {
    name: string;
    size: string;
    imageUrl: string | null;
  } | null;
};

export type OrderPage = {
  orders: OrderSummary[];
  totalPages: number;
};

const PAGE_SIZE = 20;

export async function fetchCustomerOrders(
  token: string,
  page: number,
): Promise<OrderPage> {
  const payload = await apiRequest<unknown>(
    `${API_ROUTES.myOrders}?page=${page}&pageSize=${PAGE_SIZE}`,
    { token },
  );
  const data = getResponseData(payload);

  if (!Array.isArray(data)) {
    throw new ApiError("The order history response was not in the expected format.", 0);
  }

  const metadata =
    typeof payload === "object" && payload !== null && "meta" in payload
      ? payload.meta
      : null;
  const totalPages =
    typeof metadata === "object" &&
    metadata !== null &&
    "totalPages" in metadata &&
    typeof metadata.totalPages === "number" &&
    Number.isInteger(metadata.totalPages) &&
    metadata.totalPages > 0
      ? metadata.totalPages
      : 1;

  return {
    orders: data.map(parseOrderSummary),
    totalPages,
  };
}

function parseOrderSummary(value: unknown): OrderSummary {
  if (
    typeof value !== "object" ||
    value === null ||
    !isRecord(value) ||
    !("orderNumber" in value) ||
    typeof value.orderNumber !== "string" ||
    !("statusLabel" in value) ||
    typeof value.statusLabel !== "string" ||
    !("paymentMethodLabel" in value) ||
    typeof value.paymentMethodLabel !== "string" ||
    !("placedAt" in value) ||
    typeof value.placedAt !== "string" ||
    !("itemCount" in value) ||
    typeof value.itemCount !== "number" ||
    !("total" in value) ||
    typeof value.total !== "string" ||
    !("firstItem" in value)
  ) {
    throw new ApiError("An order from the server was not in the expected format.", 0);
  }

  const firstItem = parseFirstItem(value.firstItem);
  return {
    orderNumber: value.orderNumber,
    statusLabel: value.statusLabel,
    paymentMethodLabel: value.paymentMethodLabel,
    placedAt: value.placedAt,
    itemCount: value.itemCount,
    total: value.total,
    firstItem,
  };
}

function parseFirstItem(
  value: unknown,
): OrderSummary["firstItem"] {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    typeof value.size !== "string" ||
    (value.imageUrl !== null && typeof value.imageUrl !== "string")
  ) {
    throw new ApiError("An order item from the server was not in the expected format.", 0);
  }

  return {
    name: value.name,
    size: value.size,
    imageUrl: value.imageUrl,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
