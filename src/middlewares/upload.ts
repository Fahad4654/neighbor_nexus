import multer from "multer";
import path from "path";
import fs from "fs";
import { ErrorRequestHandler, Request } from "express";
import { ToolImage } from "../models/ToolsImages";
import { errorResponse, handleUncaughtError } from "../utils/apiResponse";

export function saveFile(
  userId: string,
  buffer: Buffer,
  folder: string,
  original: string
) {
  const ext = path.extname(original);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const random = Math.round(Math.random() * 1e9);

  const filename = `${userId}-${timestamp}-${random}${ext}`;

  const dir = path.join(process.cwd(), "media", folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const full = path.join(dir, filename);
  fs.writeFileSync(full, buffer);

  return `/media/${folder}/${filename}`;
}

const storage = multer.memoryStorage();

const allowedTypes = /jpeg|jpg|png|gif/;

const toolImageFilter: multer.Options["fileFilter"] = async (
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

// Profile uploader (memory)
export const uploadProfilePic = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.test(ext)) return cb(new Error("Invalid file type"));
    cb(null, true);
  },
}).single("profile_pic");

export const uploadToolImages = multer({
  storage,
  fileFilter: toolImageFilter,
  limits: { files: 5, fileSize: 2 * 1024 * 1024 },
}).array("files", 5);

export const multerErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (err instanceof multer.MulterError) {
    let message = err.message;
    let status = 400;
    let errorDetail = "Multer processing error";

    if (err.code === "LIMIT_FILE_COUNT") {
      message = "You can upload a maximum of 5 files.";
      errorDetail = "File count limit exceeded";
    } else if (err.code === "LIMIT_FILE_SIZE") {
      message = "File too large (max 2MB).";
      errorDetail = "File size limit exceeded";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = `Unexpected field: ${err.field}`;
      errorDetail = "Unexpected file field name";
    }

    return errorResponse(res, message, errorDetail, status);
  }

  if (err instanceof Error) {
    return errorResponse(res, err.message, "File filter error", 400);
  }

  if (err) {
    return handleUncaughtError(res, err, "Unexpected error in multer handler");
  }
  next();
};
