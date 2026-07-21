export class WebRegisterDto {
  fullName!: string;
  email!: string;
  phone!: string;
  password!: string;
}

export class WebLoginDto {
  email!: string;
  password!: string;
}

export class forgotPasswordDto {
  email!: string;
}

export class passwordResetDto {
  newPassword!: string;
}

export class emailUpdateDto {
  id!: string;
  newEmail!: string;
}

export class updateProfileDto {
  id!: string;
  fullName!: string;
  phone!: string;
}
