import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { ACCESS_TOKEN_SECRET as JWT_SECRET } from "../config";
import { errorResponse, handleUncaughtError } from "../utils/apiResponse";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      username: string;
      firstname: string;
      lastname: string;
      email: string;
      isAdmin: boolean;
    };
  }
}

const SECRET = JWT_SECRET || "your_jwt_secret";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return errorResponse(
        res,
        "Authentication token required",
        "No bearer token provided in Authorization header",
        401
      );
    }

    const payload = jwt.verify(token, SECRET) as {
      id: string;
      username: string;
      firstname: string;
      lastname: string;
      email: string;
      isAdmin: boolean;
    };

    const user = await User.findByPk(payload.id);
    if (!user) {
      return errorResponse(
        res,
        "User not found",
        "Token payload refers to a non-existent user",
        404
      );
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return errorResponse(
        res,
        "Token expired",
        "JWT has passed its expiration time",
        401
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return errorResponse(
        res,
        "Invalid token",
        "JWT signature is invalid or token is malformed",
        403
      );
    }
    return handleUncaughtError(
      res,
      error,
      "Internal server error during authentication"
    );
  }
};
