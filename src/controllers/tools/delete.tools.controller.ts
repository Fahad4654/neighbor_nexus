import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Tool } from "../../models/Tools";
import { deleteTool } from "../../services/tools/delete.tool.service";

export async function deleteToolController(req: Request, res: Response) {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: "Provide listing_id of the tool" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Login is required" });
    }

    const tool = (await findByDynamicId(
      Tool,
      { listing_id },
      false
    )) as Tool | null;
    if (!tool) {
      return res.status(404).json({ error: "Tool not found" });
    }

    if (!req.user.isAdmin && req.user.id !== tool.owner_id) {
      return res
        .status(403)
        .json({ error: "You are not permitted to delete this tool" });
    }

    const deletedCount = await deleteTool(listing_id);

    res.status(200).json({
      message: "Tool deleted successfully",
      data: tool,
      deletedCount,
      status: "success",
    });
  } catch (error) {
    console.error("Error deleting tool:", error);
    res.status(500).json({ message: "Error deleting tool", error });
  }
}
