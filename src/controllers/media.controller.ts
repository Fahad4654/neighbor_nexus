import { Request, Response } from "express";

export class MediaController {
  // Single file
  static async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }
      res.status(200).json({
        success: true,
        file: {
          filename: req.file.filename,
          path: `/media/${req.file.filename}`,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "File upload failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Multiple files
  static async uploadFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: "No files uploaded" });
        return;
      }

      if (files.length > 5) {
        res
          .status(400)
          .json({ success: false, message: "Too many files uploaded" });
        return;
      }

      res.status(200).json({
        success: true,
        count: files.length,
        files: files.map((file) => ({
          filename: file.filename,
          path: `/media/${file.filename}`,
        })),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Files upload failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
