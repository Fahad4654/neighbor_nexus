import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

// Base media folder
const mediaDir = path.join(process.cwd(), "media");

// Ensure folder exists
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created folder: ${dir}`);
  }
};
ensureDir(mediaDir);
ensureDir(path.join(mediaDir, "profile"));
ensureDir(path.join(mediaDir, "tools"));

// Generic storage factory
const storageFactory = (subFolder: "profile" | "tools") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(mediaDir, subFolder));
    },
    filename: (req, file, cb) => {
      const userId = (req.user?.id || "guest").toString();
      const dateTime = new Date().toISOString().replace(/[:.]/g, "-");
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Math.round(Math.random() * 1e9);

      cb(null, `${userId}-${dateTime}-${uniqueSuffix}${ext}`);
    },
  });

// File filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) cb(null, true);
  else cb(new Error("Invalid file type"));
};

// Profile picture upload
export const uploadProfilePic = multer({
  storage: storageFactory("profile"),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("profile_pic");

// Tool images upload (max 5 files)
export const uploadToolImages = multer({
  storage: storageFactory("tools"),
  fileFilter,
  limits: { files: 5, fileSize: 2 * 1024 * 1024 },
}).array("files", 5);

// Multer error handler
export const multerErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ success: false, message: "Too many files uploaded. Maximum is 5 files." });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File too large. Maximum allowed size is 2 MB." });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err) {
    return res.status(500).json({ success: false, message: err.message || "Something went wrong" });
  }

  next();
};
