import multer from "multer";
import path from "path";
import fs from "fs";
import { ErrorRequestHandler, Request } from "express";
import { ToolImage } from "../models/ToolsImages";

// Base media folder
const mediaDir = path.join(process.cwd(), "media");

// Ensure folder exists
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir(mediaDir);
ensureDir(path.join(mediaDir, "profile"));
ensureDir(path.join(mediaDir, "tools"));

// Storage generator
const storageFactory = (sub: "profile" | "tools") =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(mediaDir, sub)),
    filename: (req, file, cb) => {
      const userId = req.user?.id || "guest";
      const ext = path.extname(file.originalname);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const random = Math.round(Math.random() * 1e9);
      cb(null, `${userId}-${timestamp}-${random}${ext}`);
    },
  });

// Allowed file types
const allowedTypes = /jpeg|jpg|png|gif/;

// ------------------------------
// CUSTOM TOOL IMAGE LIMIT CHECK
// ------------------------------
const toolImageFilter: multer.Options["fileFilter"] = async (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  try {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedTypes.test(ext)) return cb(new Error("Invalid file type"));

    // listing_id from formData
    const listing_id =
      (req.body as any).listing_id || (req.query as any).listing_id;

    if (!listing_id) return cb(new Error("listing_id is required"));

    // Count existing images
    const count = await ToolImage.count({ where: { tool_id: listing_id } });

    if (count >= 5) {
      return cb(new Error("Maximum 5 images allowed for this tool"));
    }

    cb(null, true);
  } catch (err) {
    cb(err as Error);
  }
};

// Profile uploader
export const uploadProfilePic = multer({
  storage: storageFactory("profile"),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.test(ext)) return cb(new Error("Invalid file type"));
    cb(null, true);
  },
}).single("profile_pic");

// Tool images uploader
export const uploadToolImages = multer({
  storage: storageFactory("tools"),
  fileFilter: toolImageFilter,
  limits: { files: 5, fileSize: 2 * 1024 * 1024 },
}).array("files", 5);

// Global multer error handler
export const multerErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_COUNT")
      return res
        .status(400)
        .json({
          success: false,
          message: "You can upload a maximum of 5 files.",
        });

    if (err.code === "LIMIT_FILE_SIZE")
      return res
        .status(400)
        .json({ success: false, message: "File too large (max 2MB)." });

    return res.status(400).json({ success: false, message: err.message });
  }

  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  next();
};
