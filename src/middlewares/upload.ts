import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

const uploadDir = path.join(process.cwd(), "media");

// Ensure folder exists BEFORE Multer config
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created media folder at: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = (req.user?.id || "guest").toString();
    const dateTime = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = path.extname(file.originalname);

    // Add a random unique suffix
    const uniqueSuffix = Math.round(Math.random() * 1e9);

    cb(null, `${userId}-${dateTime}-${uniqueSuffix}${ext}`);
  },
});

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

// 👇 export for single or multiple
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("file");

// Multiple files upload (max 5 files, each max 2MB)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { files: 5, fileSize: 2 * 1024 * 1024 }, // 5 files, 2MB each
}).array("files", 5);

// upload.ts

export const multerErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_COUNT") {
      res.status(400).json({
        success: false,
        message: "Too many files uploaded. Maximum is 5 files.",
      });
      return; // just return from function, do not return res
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File too large. Maximum allowed size is 2 MB.",
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
    return;
  }

  next();
};
