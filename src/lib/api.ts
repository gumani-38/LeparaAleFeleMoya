export const API_BASE_URL = "https://lepara-api.onrender.com/api/v1/";

export const API_ROUTES = {
  register: "/auth/register",
  login: "/auth/login",
  verifyEmail: "/auth/verify-email",
  resendCode: "/auth/resend-code",
  updateProfile: "/me",
  changePassword: "/me/password",
  myOrders: "/me/orders",
  donations: "/donation-pledges",
  volunteerApplications: "/volunteer-applications",
  products: "/products",
  productCategories: "/product-categories",
  initiatives: "/initiatives",
  initiativeTasks: (initiativeId: number) =>
    `/initiatives/${initiativeId}/tasks`,
  product: (productId: string) => `/products/${productId}`,
  orders: "/orders",
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  route: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    token?: string | null;
    idempotencyKey?: string;
  } = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`,
      {
        method: options.method ?? "GET",
        headers: {
          Accept: "application/json",
          ...(options.idempotencyKey
            ? { "Idempotency-Key": options.idempotencyKey }
            : {}),
          ...(options.body === undefined
            ? {}
            : { "Content-Type": "application/json" }),
        ...(options.token
          ? { Authorization: `Bearer ${options.token}` }
          : {}),
        },
        ...(options.body === undefined
          ? {}
          : { body: JSON.stringify(options.body) }),
      },
    );
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your connection and try again.",
      0,
    );
  }

  const responseText = await response.text();
  let payload: unknown;

  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch {
    const details = responseText
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    throw new ApiError(
      `The server returned a non-JSON response (${response.status})${
        details ? `: ${details}` : ""
      }`,
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.status), response.status);
  }

  if (isRecord(payload) && payload.success === false) {
    throw new ApiError(getErrorMessage(payload, response.status), response.status);
  }

  return payload as T;
}

export function getResponseData(payload: unknown): unknown {
  if (isRecord(payload) && "data" in payload) {
    return payload.data;
  }
  return payload;
}

export function getAccessToken(payload: unknown): string | null {
  const data = getResponseData(payload);
  if (!isRecord(data)) return null;

  const token =
    data.accessToken ??
    data.access_token ??
    data.token ??
    (isRecord(data.tokens)
      ? (data.tokens.accessToken ?? data.tokens.access_token)
      : null);

  return typeof token === "string" && token.length > 0 ? token : null;
}

export function getResponseUser(payload: unknown): Record<string, unknown> | null {
  const data = getResponseData(payload);
  if (!isRecord(data)) return null;

  const user = data.user ?? data.profile ?? data;
  return isRecord(user) ? user : null;
}

function getErrorMessage(payload: unknown, status: number): string {
  const error = isRecord(payload) && isRecord(payload.error) ? payload.error : payload;
  if (isRecord(error)) {
    const messages: string[] = [];
    if (typeof error.message === "string" && error.message.length > 0) {
      messages.push(error.message);
    }

    if (Array.isArray(error.fields)) {
      for (const field of error.fields) {
        if (!isRecord(field) || typeof field.message !== "string") continue;
        const label =
          typeof field.field === "string" && field.field.length > 0
            ? `${field.field}: `
            : "";
        messages.push(`${label}${field.message}`);
      }
    }

    if (Array.isArray(error.errors)) {
      for (const item of error.errors) {
        if (isRecord(item) && typeof item.message === "string") {
          messages.push(item.message);
        } else if (typeof item === "string") {
          messages.push(item);
        }
      }
    }

    if (messages.length > 0) return [...new Set(messages)].join("\n");
  }

  return `The request failed (${status}). Please try again.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
