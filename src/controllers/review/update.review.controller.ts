import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Review } from "../../models/Review";
import { updateReview } from "../../services/review/update.review.service";

export async function updateReviewController(req: Request, res: Response) {
  try {
    if (!req.body.id) {
      res.status(400).json({ error: "ReviewId is required" });
      return;
    }
    const typedWantUpReview = await findByDynamicId(
      Review,
      { id: req.body.id },
      false
    );
    const wantUpReview = typedWantUpReview as Review | null;

    if (!wantUpReview) {
      res.status(400).json({ error: "Review Not found" });
      return;
    }

    const updatedReview = await updateReview(req.body);

    if (!updatedReview) {
      console.log("No valid fields to update or review not found");
      res
        .status(400)
        .json({ error: "No valid fields to update or review not found" });
      return;
    }

    console.log("Review updated successfully", updatedReview);
    res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Error updating review:", error });
  }
}
