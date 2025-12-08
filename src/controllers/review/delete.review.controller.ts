import { Request, Response } from "express";
import { Review } from "../../models/Review";
import { deleteReview } from "../../services/review/delete.review.service";

export async function deleteReviewController(req: Request, res: Response) {
  try {
    const { id } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Login required" });
    }

    if (!id) {
      return res.status(400).json({ error: "Review ID is required" });
    }

    const wantDelReview = await Review.findOne({ where: { review_id: id } });
    if (!wantDelReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    const deletedCount = await deleteReview(id, user.id);

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.status(200).json({
      message: "Review deleted successfully",
      deleted: { id },
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting review", error });
  }
}
