import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { toast } from "sonner-native";

export const baseURL = "http://localhost:3500";
export const imageURL = "http://localhost:3500";
// export const baseURL = "https://pbmsapi.megaerpug.com"
//export const imageURL = "https://pbmsapi.megaerpug.com/storage"
export const legacyBaseURL = "https://pbmslegacyapi.megaerpug.com";
export const system = "PBMS";

let isRefreshing = false;
type FailedQueueItem = {
  resolve: (value: void | PromiseLike<void>) => void;
  reject: (error: unknown) => void;
};

let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(undefined);
    }
  });
  failedQueue = [];
};

export const apiRequest = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  tokenOrData?: unknown, //--- IGNORE TOKEN (cookies are used) ---
  data?: unknown,
  retry = true,
): Promise<T> => {
  const url = `${baseURL}${endpoint}`;

  // Backward compatibility: many call sites pass (endpoint, method, data)
  // even though the signature historically had a `token` param.
  const resolvedData = typeof tokenOrData === "string" ? data : tokenOrData;

  const config: AxiosRequestConfig = {
    url,
    method,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // This sends cookies automatically
    ...(resolvedData !== undefined && { data: resolvedData }),
  };

  try {
    const response: AxiosResponse<T> = await axios.request(config);

    // Only show success toast for non-GET requests that have a message
    const maybeMessage = (response.data as unknown as { message?: unknown })
      ?.message;
    if (method !== "GET" && typeof maybeMessage === "string" && maybeMessage) {
      toast.success(maybeMessage);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as unknown;
      const status = error.response?.status;

      // Auto-refresh token on 401 and retry the request
      if (status === 401 && retry) {
        if (isRefreshing) {
          // Queue the request while token is being refreshed
          return new Promise<void>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() =>
              apiRequest<T>(endpoint, method, tokenOrData, data, false),
            )
            .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          // Attempt to refresh the token
          await axios.post(
            `${baseURL}/api/auth/refresh`,
            {},
            {
              withCredentials: true,
            },
          );

          processQueue(null); // Process queued requests with success
          return apiRequest<T>(endpoint, method, tokenOrData, data, false); // Retry original request
        } catch (refreshError) {
          processQueue(refreshError); // Process queued requests with error

          // Clear any stored user data and redirect to login
          // Note: localStorage/sessionStorage don't exist in React Native
          // Use AsyncStorage if needed for mobile app

          toast.error("Session expired. Please login again.");
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other error cases
      const errorMessage =
        typeof responseData === "object" &&
        responseData !== null &&
        "message" in responseData &&
        typeof (responseData as { message?: unknown }).message === "string"
          ? String((responseData as { message?: unknown }).message)
          : "";

      if (errorMessage) {
        toast.error(errorMessage);
      } else if (status === 403) {
        toast.error("You don't have permission to perform this action");
      } else if (status === 400) {
        toast.error(errorMessage);
      } else if (status === 404) {
        toast.error("Resource not found");
      } else if (typeof status === "number" && status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("An error occurred");
      }

      throw error;
    }

    // Handle non-Axios related errors (network errors, etc.)
    toast.error("Network error. Please check your connection.");
    console.log(error);
    throw new Error("Network error occurred");
  }
};

// Legacy API request function for accessing old system data
export const legacyApiRequest = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  data?: unknown,
): Promise<T> => {
  const url = `${legacyBaseURL}${endpoint}`;

  const config: AxiosRequestConfig = {
    url,
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(data !== undefined ? { data } : {}),
  };

  try {
    const response: AxiosResponse<T> = await axios.request(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as unknown;

      // Handle legacy API errors with toast notifications
      const legacyErrorMessage =
        typeof responseData === "object" &&
        responseData !== null &&
        "message" in responseData &&
        typeof (responseData as { message?: unknown }).message === "string"
          ? String((responseData as { message?: unknown }).message)
          : "";

      if (legacyErrorMessage) {
        toast.error(`Legacy API Error: ${legacyErrorMessage}`);
      } else if (error.response?.status === 404) {
        toast.error(
          "Legacy API endpoint not found. Please check if the legacy API is running.",
        );
      } else if (error.response?.status >= 500) {
        toast.error(
          "Legacy API server error. The legacy system may be unavailable.",
        );
      } else {
        toast.error(
          "Failed to connect to legacy API. Please check your network connection.",
        );
      }

      throw error;
    }

    toast.error("Network error connecting to legacy API.");
    throw new Error("Network error occurred");
  }
};
