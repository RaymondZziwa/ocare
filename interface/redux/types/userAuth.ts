import type { IRole } from "./systemSettings";

export interface IUserAuth {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  updatedAt: string;
  createdAt: string;
  // Optional fields that might be added later
  gender?: string;
  hasAccess?: boolean;
  isActive?: boolean;
  profileImage?: string;
  branch?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  token?: {
    accessToken: string;
    refreshToken: string;
  };
  role?: IRole;
}
