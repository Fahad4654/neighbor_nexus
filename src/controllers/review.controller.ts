import { Request, Response } from "express";
import {
  findAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service";
import { User } from "../models/User";
import { findByDynamicId } from "../services/find.service";
import { validateRequiredBody } from "../services/reqBodyValidation.service";
import { Profile } from "../models/Profile";

import { isAdmin } from "../middlewares/isAdmin.middleware";
import { Op } from "sequelize";
import { ADMIN_USERNAME } from "../config";
import { error } from "console";
import { Review } from "../models/Review";
import {
  createReview,
  deleteReview,
  updateReview,
} from "../services/review.service";

export async function getReviewsByIdController(req: Request, res: Response) {
  try {
    const review_id = req.params.id;
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

export async function createReviewController(req: Request, res: Response) {
  try {
    const reqBodyValidation = validateRequiredBody(req, res, [
      "userID",
      "transactionID",
      "reviewerID",
      "rating",
      "comment",
    ]);
    if (!reqBodyValidation) return;

    const { userID, transactionID, reviewerID, rating, comment } = req.body;

    const newReview = await createReview(
      userID,
      transactionID,
      reviewerID,
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
