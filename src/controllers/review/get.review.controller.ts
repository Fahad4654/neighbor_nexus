import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Review } from "../../models/Review";

export async function getReviewsByIdController(req: Request, res: Response) {
  try {
    const review_id = req.params.id;
    console.log("Review ID:", review_id);
    if (!review_id) {
      res.status(400).json({
        status: 400,
        error: "Review ID is required",
      });
      return;
    }

    const typedReview = await findByDynamicId(Review, { id: review_id }, false);
    const review = typedReview as Review | null;
    console.log(review);
    if (!review) {
      console.log("Review not found");
      res.status(404).json({ error: "Review not found" });
      return;
    }
    res.status(200).json({ review: review, status: "success" });
    return;
  } catch (error) {
    console.error("Error finding review:", error);
    res.status(500).json({ message: "Error fetching reviews:", error });
  }
}
