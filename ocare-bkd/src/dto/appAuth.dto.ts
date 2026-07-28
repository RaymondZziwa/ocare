export class AppLoginDto {
  email!: string;
  password!: string;
}

export class AppPwdResetDto {
  email!: string;
  password!: string;
}

export class AppSendOtpDto {
  email!: string;
}

export class AppVerifyOtpDto {
  email!: string;
  otp!: string;
}

export class AppRegisterDto {
  email!: string;
  password!: string;
  fullName!: string;
  phoneNumber!: string;
}
