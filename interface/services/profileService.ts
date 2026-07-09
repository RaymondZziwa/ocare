import { apiRequest } from "@/libs/apiConfig";

// Types
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type SaleStatus = "PENDING" | "FAILED" | "IN_DELIVERY" | "PACKAGING" | "CANCELLED" | "SUCCESSFUL";
export type PaymentStatus = "FULLY_PAID" | "PARTIALLY_PAID" | "UNPAID";

export interface UserProfile {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  gender: Gender | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string | null;
}

export interface Order {
  id: string;
  saleId: string;
  total: number;
  balance: number;
  paymentStatus: PaymentStatus;
  saleStatus: SaleStatus;
  type: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface UpdateProfileRequest {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  dob?: string | null;
  gender?: Gender | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  profileImage?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

// API Endpoints (placeholders - to be implemented in backend)
const PROFILE_ENDPOINTS = {
  GET_PROFILE: "/api/auth/mobile-profile", // Append user ID
  MOBILE_PROFILE: "/api/auth/mobile-profile",
  UPDATE_PROFILE: "/api/profile",
  CHANGE_PASSWORD: "/api/profile/password",
  UPLOAD_AVATAR: "/api/profile/avatar",
  GET_USER_ORDERS: "/api/orders/user-orders",
  GET_ORDER_BY_ID: "/api/orders",
};

/**
 * Get user profile
 * GET /api/auth/mobile-profile/:id
 */
export const getProfile = async (id: string): Promise<UserProfile> => {
  return apiRequest<UserProfile>(`${PROFILE_ENDPOINTS.GET_PROFILE}/${id}`, "GET");
};

/**
 * Update user profile
 * PUT /api/profile
 */
export const updateProfile = async (
  data: UpdateProfileRequest,
): Promise<UserProfile> => {
  return apiRequest<UserProfile>(
    PROFILE_ENDPOINTS.UPDATE_PROFILE,
    "PUT",
    data,
  );
};

/**
 * Change password
 * PUT /api/profile/password
 */
export const changePassword = async (
  data: ChangePasswordRequest,
): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(
    PROFILE_ENDPOINTS.CHANGE_PASSWORD,
    "PUT",
    data,
  );
};

/**
 * Upload profile avatar
 * POST /api/profile/avatar
 */
export const uploadAvatar = async (file: FormData): Promise<{ imageUrl: string }> => {
  return apiRequest<{ imageUrl: string }>(
    PROFILE_ENDPOINTS.UPLOAD_AVATAR,
    "POST",
    file as unknown,
  );
};

// Raw API response shape (what the server actually sends)
interface RawOrder {
  id: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  notes: string | null;
  paymentMethods?: unknown[];
  saleStatus: SaleStatus;
  status: "UNPAID" | "FULLY_PAID" | "PARTIALLY_PAID";
  storeId: string;
  total: string; // API returns string
  balance: string; // API returns string
  type: string;
  servedBy: string | null;
}

// Map a raw API order to our Order interface
const mapOrder = (raw: RawOrder): Order => ({
  id: raw.id,
  saleId: raw.id, // API uses same id
  total: Number(raw.total),
  balance: Number(raw.balance),
  paymentStatus: raw.status,
  saleStatus: raw.saleStatus,
  type: raw.type,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
  items: raw.items || [],
});

/**
 * Get user orders
 * GET /api/orders/user-orders/:userId
 */
export const getOrders = async (userId: string): Promise<Order[]> => {
  const data = await apiRequest<{ data: RawOrder[] } | RawOrder[]>(
    `${PROFILE_ENDPOINTS.GET_USER_ORDERS}/${userId}`,
    "GET",
  );
  // Handle both wrapped { data: [...] } and direct [...] responses
  const rawOrders: RawOrder[] = Array.isArray(data) ? data : (data as unknown as { data: RawOrder[] }).data;
  return rawOrders.map(mapOrder);
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  const raw = await apiRequest<RawOrder>(`${PROFILE_ENDPOINTS.GET_ORDER_BY_ID}/${orderId}`, "GET");
  return mapOrder(raw);
};

/**
 * Calculate password strength
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Calculate score based on requirements met
  Object.values(requirements).forEach((met) => {
    if (met) score++;
  });

  // Provide feedback based on score
  let feedback = "";
  switch (score) {
    case 0:
    case 1:
      feedback = "Very weak";
      break;
    case 2:
      feedback = "Weak";
      break;
    case 3:
      feedback = "Fair";
      break;
    case 4:
      feedback = "Good";
      break;
    case 5:
      feedback = "Strong";
      break;
  }

  return { score, feedback, requirements };
};

/**
 * Validate profile data
 */
export const validateProfileData = (data: UpdateProfileRequest): string[] => {
  const errors: string[] = [];

  if (data.fullName && data.fullName.length < 2) {
    errors.push("Full name must be at least 2 characters");
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email address");
  }

  if (data.phone && !/^\+?[1-9]\d{1,14}$/.test(data.phone)) {
    errors.push("Invalid phone number format");
  }

  if (data.dob) {
    const dobDate = new Date(data.dob);
    const now = new Date();
    const age = now.getFullYear() - dobDate.getFullYear();
    if (age < 0 || age > 150) {
      errors.push("Invalid date of birth");
    }
  }

  return errors;
};

/**
 * Validate password change
 */
export const validatePasswordChange = (data: ChangePasswordRequest): string[] => {
  const errors: string[] = [];

  if (!data.currentPassword || data.currentPassword.length < 1) {
    errors.push("Current password is required");
  }

  if (!data.newPassword || data.newPassword.length < 8) {
    errors.push("New password must be at least 8 characters");
  }

  if (data.newPassword !== data.confirmPassword) {
    errors.push("Passwords do not match");
  }

  if (data.currentPassword === data.newPassword) {
    errors.push("New password must be different from current password");
  }

  return errors;
};
