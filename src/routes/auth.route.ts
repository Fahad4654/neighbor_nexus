import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordResetController,
  verifyOtpController,
  resetPasswordController,
} from "../controllers/auth.controller";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/request-reset", requestPasswordResetController);
router.post("/verify-otp", verifyOtpController);
router.post("/reset-password", resetPasswordController);

// Requires valid refresh token
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);

export { router as authRouter };
export { router };
