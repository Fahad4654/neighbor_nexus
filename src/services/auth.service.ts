import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Token } from "../models/Token";
import {
  SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  ADMIN_NAME,
  CLIENT_URL,
  ADMIN_MAIL,
  COMPANY_NAME,
} from "../config";
import { createProfile } from "./profile.service";
import { Op } from "sequelize";
import { Profile } from "../models/Profile";
import { MailService } from "./mail/mail.service";
import { Otp } from "../models/Otp";
import { sendOtp } from "./otp.services";
import { findByDynamicId } from "./find.service";

const mailService = new MailService();

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateTokens(user: User) {
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        isAgent: user.isAgent,
      },
      SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION } as SignOptions
    );

    const refreshToken = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION ? REFRESH_TOKEN_EXPIRATION : "7d",
    } as SignOptions);

    await Token.create({
      token: refreshToken,
      isRefreshToken: true,
      expiresAt: new Date(Date.now() + parseInt(REFRESH_TOKEN_EXPIRATION, 10)),
      userId: user.id,
    });

    return { accessToken, refreshToken };
  }

  static async registerUser(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    referredId?: string;
  }) {
    const { name, email, password, phoneNumber } = data;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phoneNumber }],
      },
    });
    if (existingUser) {
      if (
        existingUser.email === email &&
        existingUser.phoneNumber === phoneNumber
      ) {
        console.log("User already exists");
        throw new Error("User already exists");
      } else if (existingUser.email === email) {
        console.log("Email matched");
        throw new Error("Email already exists");
      } else if (existingUser.phoneNumber === phoneNumber) {
        console.log("Phone number matched");
        throw new Error("Phone number already exists");
      }
    }

    const hashedPassword = await this.hashPassword(password);
    const admin = await User.findOne({ where: { name: `${ADMIN_NAME}` } });
    const adminProfile = await Profile.findOne({
      where: { userId: admin?.id },
    });

    let refferedBy = null;
    if (data.referredId) {
      let typedRefferedBy = await findByDynamicId(
        Profile,
        { playerId: data.referredId },
        false
      );
      refferedBy = typedRefferedBy as Profile | null;
    }

    console.log(refferedBy?.userId);
    let createdBy = null;
    if (refferedBy) {
      createdBy = refferedBy.userId;
    }
    console.log(createdBy);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      isAdmin: false,
      isAgent: false,
      createdBy: createdBy ? createdBy : admin?.id,
      updatedBy: createdBy ? createdBy : admin?.id,
    });

    await sendOtp(newUser.email, "register");

    await createProfile({
      userId: newUser.id,
      bio: "Please Edit",
      address: "Please Edit",
      referredId: data.referredId
        ? data.referredId
        : adminProfile?.playerId,
    });
    console.log("Profile created for", newUser.email);
    return newUser;
  }

  static async loginUser(identifier: string, password: string) {
    // identifier can be email OR phone number
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phoneNumber: identifier }],
      },
    });

    if (!user) {
      throw new Error("User doesn't exist");
    }

    if (!user.isVerified) {
      throw new Error("User is not verfied yet");
    }

    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    return user;
  }

  static async logoutUser(refreshToken: string) {
    const tokenData = await Token.findOne({ where: { token: refreshToken } });
    if (!tokenData) {
      throw new Error("Token not found or already logged out");
    }
    await Token.destroy({ where: { token: refreshToken } });
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, SECRET) as { id: string };

      const tokenRecord = await Token.findOne({
        where: {
          token: refreshToken,
          isRefreshToken: true,
        },
        include: [User],
      });

      if (!tokenRecord) {
        throw new Error("Invalid refresh token");
      }

      const newAccessToken = jwt.sign(
        {
          id: tokenRecord.user.id,
          email: tokenRecord.user.email,
          isAdmin: tokenRecord.user.isAdmin,
          isAgent: tokenRecord.user.isAgent,
        },
        SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRATION } as SignOptions
      );

      return newAccessToken;
    } catch (error) {
      throw error;
    }
  }
}

export async function resetPassword(identifier: string, newPassword: string) {
  const user = await User.findOne({
    where: { [identifier.includes("@") ? "email" : "phoneNumber"]: identifier },
  });
  if (!user) throw new Error("User not found");

  const token = await Otp.findOne({
    where: { userId: user.id },
  });
  if (!token) throw new Error("No OTP verification found");
  if (!token.verified) throw new Error("OTP not verified");
  if (token.expiresAt.getTime() < Date.now()) {
    await token.destroy();
    throw new Error("OTP expired");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  await token.destroy(); // remove after successful reset

  await mailService.sendMail(
    user.email,
    "Password Reset Successful",
    "Password Reset Successful.",
    undefined, // HTML will come from template
    "reset-pass-success", // Handlebars template
    {
      name: user.name,
      loginUrl: `${CLIENT_URL}/login`,
      companyName: `${COMPANY_NAME}`,
      year: new Date().getFullYear(),
      supportEmail: ADMIN_MAIL,
    }
  );

  return { message: "Password reset successful" };
}
