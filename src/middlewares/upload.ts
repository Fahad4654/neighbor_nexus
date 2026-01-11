// upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { ErrorRequestHandler, Request } from "express";
import { ToolImage } from "../models/ToolsImages";
import { errorResponse, handleUncaughtError } from "../utils/apiResponse";

/**
 * Save File Utility
 */
export function saveFile(
  id: string,
  buffer: Buffer,
  folder: string,
  original: string
) {
  const ext = path.extname(original);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const random = Math.round(Math.random() * 1e9);

  const filename = `${id}-${timestamp}-${random}${ext}`;

  const dir = path.join(process.cwd(), "media", folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const full = path.join(dir, filename);
  fs.writeFileSync(full, buffer);

  return `/media/${folder}/${filename}`;
}

const storage = multer.memoryStorage();
const allowedTypes = /jpeg|jpg|png|gif/i;

/**
 * 1️⃣ Profile Picture Upload
 */
export const uploadProfilePic = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.test(ext)) return cb(new Error("Invalid file type"));
    cb(null, true);
  },
}).single("profile_pic");

/**
 * 2️⃣ Tool Image Filter (for UPDATE)
 * Requires listing_id
 */
const toolImageFilterUpdate: multer.Options["fileFilter"] = async (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.test(ext)) return cb(new Error("Invalid file type"));

    const listing_id =
      (req.body as any).listing_id || (req.query as any).listing_id;

    if (!listing_id) return cb(new Error("listing_id is required"));

    const count = await ToolImage.count({ where: { tool_id: listing_id } });
    if (count >= 5)
      return cb(new Error("Maximum 5 images allowed for this tool"));

    cb(null, true);
  } catch (err) {
    cb(err as Error);
  }
};

/**
 * 3️⃣ Tool Image Upload (CREATE)
 * No listing_id required yet
 */
export const uploadToolImagesForCreate = multer({
  storage,
  limits: { files: 5, fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.test(ext)) return cb(new Error("Invalid file type"));
    cb(null, true);
  },
}).array("images", 5);

/**
 * 4️⃣ Tool Image Upload (UPDATE)
 * Requires listing_id (validated)
 */
export const uploadToolImages = multer({
  storage,
  fileFilter: toolImageFilterUpdate,
  limits: { files: 5, fileSize: 2 * 1024 * 1024 },
}).array("images", 5);

/**
 * 5️⃣ Multer Error Handler
 */
export const multerErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (err instanceof multer.MulterError) {
    let message = err.message;
    let detail = "Multer error";

    if (err.code === "LIMIT_FILE_COUNT")
      message = "You can upload a maximum of 5 files.";
    else if (err.code === "LIMIT_FILE_SIZE")
      message = "File too large (max 2MB).";
    else if (err.code === "LIMIT_UNEXPECTED_FILE")
      message = `Unexpected file field: ${err.field}`;

    return errorResponse(res, message, detail, 400);
  }

  if (err instanceof Error) {
    return errorResponse(res, err.message, "File upload error", 400);
  }

  return handleUncaughtError(res, err, "Unexpected Multer Error");
};
