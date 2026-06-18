export interface IPermission {
  id: string;
  name: string;
  value: string;
  module: string;
}

export interface IUserAuth {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  tel: string;
  salary: any;
  password: string;
  hasAccess: boolean;
  isActive: boolean;
  profileImage: string | null;
  updatedAt: Date;
  createdAt: Date;
  branch: {
    id: string;
    name: string;
  } | null;
  dept: {
    id: string;
    name: string;
  } | null;
  role: {
    id: string;
    name: string;
    permissions: IPermission[];
  } | null;
  token: {
    accessToken: string;
    refreshToken: string;
  };
}

export class RefreshTokenDto {
  // This will be handled via cookies, so no body needed
}

export interface IRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
}

export type IUserAuthWithoutPassword = Omit<IUserAuth, 'password'>;
export type IUserAuthWithoutToken = Omit<IUserAuth, 'token'>;
