import { Request, Response } from "express";
import { validateRequiredBody } from "../../services/global/reqBodyValidation.service";
import { createReview } from "../../services/review/create.review.service";

export async function createReviewController(req: Request, res: Response) {
  try {
    const reqBodyValidation = validateRequiredBody(req, res, [
      "userID",
      "transactionID",
      "reviewed_user_id",
      "rating",
      "comment",
    ]);
    if (!reqBodyValidation) return;

    const { userID, transactionID, reviewed_user_id, rating, comment } =
      req.body;

    const newReview = await createReview(
      userID,
      transactionID,
      reviewed_user_id,
      rating,
      comment
    );

    if (!newReview) {
      console.log("Failed to create review");
      res.status(400).json({ error: "Failed to create review" });
      return;
    }
    res.status(201).json({
      message: "Review created successfully",
      user: newReview,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error creating newUser:", error);
    res.status(500).json({ message: "Error creating users:", error });
  }
}
