import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../../models/User";
import { Token } from "../../models/Token";
import {
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  ADMIN_USERNAME,
  CLIENT_URL,
  ADMIN_MAIL,
  COMPANY_NAME,
} from "../../config";

import { Op } from "sequelize";
import { MailService } from "../mail/mail.service";
import { Otp } from "../../models/Otp";
import { createProfile } from "../profile/create.profile.service";
import { sendOtp } from "../otp/send.otp.service";

const mailService = new MailService();

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // Compare password
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate Access and Refresh Tokens
  static async generateTokens(user: User) {
    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION } as SignOptions
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
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

  // Register User with optional Google Maps location
  static async registerUser(data: {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phoneNumber: string;

    // 👇 Add Google Maps location input
    location?: {
      lat: number;
      lng: number;
    };
  }) {
    const { username, firstname, lastname, email, password, phoneNumber } =
      data;

    // 🔍 Check existing user
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phoneNumber }, { username }],
      },
    });

    if (existingUser) {
      if (
        existingUser.email === email &&
        existingUser.username === username &&
        existingUser.phoneNumber === phoneNumber
      ) {
        throw new Error("User already exists");
      } else if (existingUser.email === email) {
        throw new Error("Email already exists");
      } else if (existingUser.username === username) {
        throw new Error("Username already exists");
      } else if (existingUser.phoneNumber === phoneNumber) {
        throw new Error("Phone number already exists");
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Admin (creator)
    const admin = await User.findOne({
      where: { username: `${ADMIN_USERNAME}` },
    });

    // 🌍 Handle geo-location (Google Maps)
    let geoLocationValue = undefined;

    if (data.location) {
      const { lat, lng } = data.location;

      geoLocationValue = {
        type: "Point",
        coordinates: [lng, lat], // ⚠️ PostGIS requires (lon, lat)
      };
    }

    // 🆕 Create new user
    const newUser = await User.create({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phoneNumber,
      isAdmin: false,
      createdBy: admin?.id,
      updatedBy: admin?.id,

      // ⭐ Only set geo_location if provided
      ...(geoLocationValue && { geo_location: geoLocationValue }),
    });

    // 📧 Send OTP email
    await sendOtp(newUser.email, "register");

    // 🧾 Create profile
    await createProfile({
      userId: newUser.id,
      bio: "Please update your bio",
      address: "Please update your address",
    });

    console.log("Profile created for", newUser.username);

    return newUser;
  }

  // Login User with username, email, or phone number
  static async loginUser(identifier: string, password: string) {
    // identifier can be username OR email OR phone number
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: identifier },
          { email: identifier },
          { phoneNumber: identifier },
        ],
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

  // Logout User by deleting refresh token
  static async logoutUser(refreshToken: string) {
    const tokenData = await Token.findOne({ where: { token: refreshToken } });
    if (!tokenData) {
      throw new Error("Token not found or already logged out");
    }
    await Token.destroy({ where: { token: refreshToken } });
  }

  // Refresh Access Token
  static async refreshAccessToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
        id: string;
      };

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
          username: tokenRecord.user.username,
          firstname: tokenRecord.user.firstname,
          lastname: tokenRecord.user.lastname,
          email: tokenRecord.user.email,
          phoneNumber: tokenRecord.user.phoneNumber,
          isAdmin: tokenRecord.user.isAdmin,
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRATION } as SignOptions
      );

      return newAccessToken;
    } catch (error) {
      throw error;
    }
  }
}

// Reset Password using verified OTP
export async function resetPassword(identifier: string, newPassword: string) {
  // Determine which field to search by
  let whereCondition: any = {};

  if (identifier.includes("@")) {
    whereCondition.email = identifier;
  } else if (/^\+?\d+$/.test(identifier)) {
    // simple regex to check if it's a phone number (digits only)
    whereCondition.phoneNumber = identifier;
  } else {
    whereCondition.username = identifier;
  }

  // Find user
  const user = await User.findOne({ where: whereCondition });
  if (!user) throw new Error("User not found");

  // Find OTP token
  const token = await Otp.findOne({ where: { userId: user.id } });
  if (!token) throw new Error("No OTP verification found");
  if (!token.verified) throw new Error("OTP not verified");
  if (token.expiresAt.getTime() < Date.now()) {
    await token.destroy();
    throw new Error("OTP expired");
  }

  // Reset password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  await token.destroy();

  // Send confirmation email
  await mailService.sendMail(
    user.email,
    "Password Reset Successful",
    "Password Reset Successful.",
    undefined,
    "reset-pass-success",
    {
      name: user.lastname,
      loginUrl: `${CLIENT_URL}/login`,
      companyName: `${COMPANY_NAME}`,
      year: new Date().getFullYear(),
      supportEmail: ADMIN_MAIL,
    }
  );

  return { message: "Password reset successful" };
}
