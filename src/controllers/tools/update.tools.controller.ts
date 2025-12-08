import { Request, Response } from "express";
import { findByDynamicId } from "../../services/global/find.service";
import { Tool } from "../../models/Tools";
import { updateTool } from "../../services/tools/update.tool.service";

export async function updateToolInfoController(req: Request, res: Response) {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: "listing_id is required" });
    }

    const tool = (await findByDynamicId(
      Tool,
      { listing_id },
      false
    )) as Tool | null;
    if (!tool) return res.status(404).json({ error: "Tool not found" });

    if (!req.user) return res.status(400).json({ error: "Login required" });
    if (!req.user.isAdmin && req.user.id !== tool.owner_id) {
      return res
        .status(403)
        .json({ error: "Only owner or admin can update this tool" });
    }

    // Update fields
    const updatedTool = await updateTool(req.body);

    res.status(200).json({
      message: "Tool updated successfully",
      data: updatedTool,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating tool info:", error);
    res.status(500).json({ message: "Error updating tool info", error });
  }
}
