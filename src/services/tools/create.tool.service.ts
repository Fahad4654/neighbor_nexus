// create.tool.service.ts
import { User } from "../../models/User";
import { findByDynamicId } from "../global/find.service";
import { Tool } from "../../models/Tools";
import { ToolImage } from "../../models/ToolsImages";
import { saveFile } from "../../middlewares/upload";
import path from "path";

export async function createTool(
  data: {
    owner_id: string;
    listing_type: string;
    title: string;
    description: string;
    hourly_price: number;
    daily_price: number;
    security_deposit: number;
    is_available: boolean;
    useUserLocation?: boolean;
    location?: {
      lat: number;
      lng: number;
    };
  },
  files: Express.Multer.File[] = []
) {
  // 1️⃣ Use user's location if requested
  if (data.useUserLocation) {
    const typedOwner = await findByDynamicId(
      User,
      { id: data.owner_id },
      false
    );
    const owner = typedOwner as User | null;

    if (owner?.geo_location) {
      data.location = {
        lat: owner.geo_location.coordinates[1],
        lng: owner.geo_location.coordinates[0],
      };
    }
  }

  let geoLocationValue;
  if (data.location) {
    geoLocationValue = {
      type: "Point",
      coordinates: [data.location.lng, data.location.lat],
    };
  }

  const newTool = await Tool.create({
    owner_id: data.owner_id,
    listing_type: data.listing_type as "Tool" | "Skill",
    title: data.title,
    description: data.description,
    hourly_price: data.hourly_price,
    daily_price: data.daily_price,
    security_deposit: data.security_deposit,
    is_available: data.is_available ?? true,
    ...(geoLocationValue && { geo_location: geoLocationValue }),
  });

  if (files.length > 0) {
    if (files.length > 5) {
      throw new Error("A tool can have a maximum of 5 images");
    }

    const rootDir = process.cwd();

    for (const [index, file] of files.entries()) {
      const savedUrl = saveFile(
        newTool.listing_id,
        file.buffer,
        "tools",
        file.originalname
      );

      await ToolImage.create({
        tool_id: newTool.listing_id,
        image_url: savedUrl, // relative URL for frontend
        filepath: path.join(rootDir, savedUrl), // absolute path for deletion
        is_primary: index === 0, // first image is primary
      });
    }
  }

  // 5️⃣ Return tool with images
  return Tool.findByPk(newTool.listing_id, {
    include: [
      {
        model: ToolImage,
        as: "images",
        attributes: {
          exclude: ["tool_id", "createdAt", "updatedAt", "filepath"],
        },
      },
    ],
  });
}
