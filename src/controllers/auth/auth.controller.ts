import { RequestHandler } from "express";
import { Token } from "../../models/Token";
import { User } from "../../models/User";
import { Request, Response } from "express";
import { AuthService, resetPassword } from "../../services/auth/auth.service";
import { Profile } from "../../models/Profile";
import { verifyOtp } from "../../services/otp/verify.otp.service";
import { sendOtp } from "../../services/otp/send.otp.service";
import {
  errorResponse,
  successResponse,
  handleUncaughtError,
} from "../../utils/apiResponse";

// Registration Controller
export const register: RequestHandler = async (req, res) => {
  try {
    const { username, firstname, lastname, email, password, phoneNumber } =
      req.body;

    if (
      !username ||
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !phoneNumber
    ) {
      console.log("All fields are required");
      return errorResponse(
        res,
        "All fields are required",
        "Missing required registration fields",
        400
      );
    }

    const newUser = await AuthService.registerUser({
      username,
      firstname,
      lastname,
      email,
      password,
      phoneNumber,
      location: req.body.location,
    });

    const userResponse = newUser.toJSON();
    delete userResponse.password;

    console.log("User registered successfully", userResponse);
    return successResponse(
      res,
      "User registered successfully",
      { user: userResponse },
      201
    );
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "Registration failed",
      error,
      400
    );
  }
};

// Login Controller
export const login: RequestHandler = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return errorResponse(
        res,
        "Identifier (username/email/phone) and password are required",
        "Missing login fields",
        400
      );
    }

    const user = await AuthService.loginUser(identifier, password);
    const tokens = await AuthService.generateTokens(user);
    const profile = await Profile.findOne({
      where: { userId: user.id },
      attributes: ["id", "bio", "avatarUrl"],
    });

    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.createdBy;
    delete userResponse.updatedBy;
    userResponse.profile = profile;

    console.log(`${user.email} Logged in successfully`);
    return successResponse(res, "Login successful", {
      user: userResponse,
      ...tokens,
    });
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "Invalid credentials",
      error,
      401
    );
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      console.log("Refresh token is required");
      return errorResponse(
        res,
        "Refresh token is required",
        "Missing refresh token",
        400
      );
    }
    const tokenData = await Token.findOne({ where: { token: refreshToken } });

    if (!tokenData) {
      console.log("Token not found or already logged out");
      return errorResponse(
        res,
        "Token not found or already logged out",
        "Invalid or stale refresh token",
        404
      );
    }

    // Find the user before deleting token
    const user = await User.findOne({ where: { id: tokenData.userId } });

    // Delete the refresh token
    await AuthService.logoutUser(refreshToken);
    console.log(user?.email || "Unknown user", "Logged out successfully");

    return successResponse(res, "Logged out successfully");
  } catch (error: any) {
    return errorResponse(res, error.message || "Logout failed", error, 400);
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      console.log("Refresh token is required");
      return errorResponse(
        res,
        "Refresh token is required",
        "Missing refresh token",
        400
      );
    }
    const newAccessToken = await AuthService.refreshAccessToken(refreshToken);
    console.log("Token refreshed successfully");

    return successResponse(res, "Token refreshed successfully", {
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    if (error.username === "TokenExpiredError") {
      console.log("Refresh token expired");
      return errorResponse(
        res,
        "Refresh token expired",
        "TokenExpiredError",
        403
      );
    }
    if (error.username === "JsonWebTokenError") {
      console.log("Invalid refresh token");
      return errorResponse(
        res,
        "Invalid refresh token",
        "JsonWebTokenError",
        403
      );
    }

    console.log("Internal server error", error);
    return handleUncaughtError(
      res,
      error,
      "Internal Server Error during token refresh"
    );
  }
};

// requestPasswordResetController.ts
export async function requestPasswordResetController(
  req: Request,
  res: Response
) {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return errorResponse(
        res,
        "Username, email or phone number is required",
        "Missing identifier",
        400
      );
    }

    const result = await sendOtp(identifier, "password");
    return successResponse(res, "OTP request sent successfully", result);
  } catch (error: any) {
    console.error("Error requesting password reset:", error);
    return errorResponse(
      res,
      error.message || "Failed to request password reset",
      error,
      400
    );
  }
}

export async function verifyOtpController(req: Request, res: Response) {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return errorResponse(
        res,
        "All fields are required",
        "Missing identifier or OTP",
        400
      );
    }

    const result = await verifyOtp(identifier, otp);
    return successResponse(res, "OTP verified successfully", result);
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return errorResponse(
      res,
      error.message || "Failed to verify OTP",
      error,
      400
    );
  }
}

// reset Password controller
export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { identifier, newPassword } = req.body;
    // Assuming validation for identifier/newPassword happens in the service or middleware

    const result = await resetPassword(identifier, newPassword);
    return successResponse(res, "Password reset successfully", result);
  } catch (error: any) {
    return errorResponse(
      res,
      error.message || "Failed to reset password",
      error,
      400
    );
  }
}
