import { RequestHandler } from "express";
import { Token } from "../models/Token";
import { User } from "../models/User";
import { Request, Response } from "express";
import { AuthService, resetPassword } from "../services/auth.service";
import { sendOtp, verifyOtp } from "../services/otp.services";

export const register: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, referredId } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      console.log("All fields are required");
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const newUser = await AuthService.registerUser({
      name,
      email,
      password,
      phoneNumber,
      referredId,
    });

    const userResponse = newUser.toJSON();
    delete userResponse.password;

    console.log("User registered successfully", userResponse);
    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
    return;
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Registration failed" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // ✅ Now "identifier" can be email OR phoneNumber

    if (!identifier || !password) {
      console.log("Identifier (email/phone) and password are required");
      res.status(400).json({
        message: "Identifier (email/phone) and password are required",
      });
      return;
    }

    const user = await AuthService.loginUser(identifier, password);
    const tokens = await AuthService.generateTokens(user);

    const userResponse = user.toJSON();
    delete userResponse.password;

    console.log(`${user.email} Logged in successfully`);
    res.json({
      message: "Login successful",
      user: userResponse,
      ...tokens,
    });
    console.log("User:", userResponse);
    return;
  } catch (error: any) {
    res.status(401).json({ message: error.message || "Invalid credentials" });
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      console.log("Refresh token is required");
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }
    const tokenData = await Token.findOne({ where: { token: refreshToken } });

    if (!tokenData) {
      console.log("Token not found or already logged out");
      res
        .status(404)
        .json({ message: "Token not found or already logged out" });
      return;
    }

    // Find the user before deleting token
    const user = await User.findOne({ where: { id: tokenData.userId } });

    // Delete the refresh token

    await AuthService.logoutUser(refreshToken);
    console.log(user?.email || "Unknown user", "Logged out successfully");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Logout failed" });
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      console.log("Refresh token is required");
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }
    const newAccessToken = await AuthService.refreshAccessToken(refreshToken);
    console.log("Token refreshed successfully");
    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
    return;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      console.log("Refresh token expired");
      res.status(403).json({ message: "Refresh token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      console.log("Invalid refresh token");
      res.status(403).json({ message: "Invalid refresh token" });
    }
    console.log("Internal server error", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

//requestPasswordResetController.ts

export async function requestPasswordResetController(
  req: Request,
  res: Response
) {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      res.status(400).json({ error: "Email or phone number is required" });
      return;
    }

    const result = await sendOtp(identifier, "password");
    res.status(200).json({ status: "success", ...result });
  } catch (error: any) {
    console.error("Error requesting password reset:", error);
    res.status(400).json({ status: "failed", error: error.message });
  }
}

export async function verifyOtpController(req: Request, res: Response) {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const result = await verifyOtp(identifier, otp);
    res.status(200).json({ status: "success", ...result });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    res.status(400).json({ status: "failed", error: error.message });
  }
}

//reset Password controller
export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { identifier, newPassword } = req.body;
    const result = await resetPassword(identifier, newPassword);
    res.status(200).json({ status: "success", ...result });
  } catch (error: any) {
    res.status(400).json({ status: "failed", error: error.message });
  }
}
