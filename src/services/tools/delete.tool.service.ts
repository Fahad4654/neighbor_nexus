import { Tool } from "../../models/Tools";
import { ToolImage } from "../../models/ToolsImages";

export async function deleteTool(listing_id: string) {
  if (!listing_id) throw new Error("listing_id is required");

  await ToolImage.destroy({ where: { tool_id: listing_id } });

  return Tool.destroy({ where: { listing_id } });
}

export async function addImagesToTool(listing_id: string, imageUrls: string[]) {
  if (!imageUrls.length) return;

  const toInsert = imageUrls.map((url) => ({
    tool_id: listing_id,
    image_url: url,
  }));

  return ToolImage.bulkCreate(toInsert);
}
