export class AppLoginDto {
  email!: string;
  password!: string;
}

export class AppPwdResetDto {
  email!: string;
  password!: string;
}

export class AppSendOtpDto {
  phone!: string;
}

export class AppVerifyOtpDto {
  phone!: string;
  otp!: string;
}

export class AppRegisterDto {
  email!: string;
  password!: string;
  fullName!: string;
  phoneNumber!: string;
}
