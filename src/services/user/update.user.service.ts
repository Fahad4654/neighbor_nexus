import { User } from "../../models/User";

export async function updateUser(data: Partial<User> & { id: string }) {
  const user = await User.findOne({ where: { id: data.id } });
  if (!user) {
    console.log("User not found for update");
    throw new Error("User not found");
  }

  const allowedFields: Array<keyof User> = [
    "firstname",
    "lastname",
    // "email",
    "isAdmin",
    "isVerified",
    "phoneNumber",
    "updatedBy",
    "geo_location",
  ];
  const updates: Partial<User> = {};

  for (const key of allowedFields) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  if (updates.geo_location) {
    const geo = updates.geo_location as any;

    if (geo.lat !== undefined && geo.lng !== undefined) {
      updates.geo_location = {
        type: "Point",
        coordinates: [geo.lng, geo.lat], // lng first!
      } as any;
    }
  }

  if (Object.keys(updates).length === 0) {
    console.log("No valid fields provided for update");
    throw new Error("No valid fields provided for update");
  }

  await user.update(updates);
  return User.findByPk(user.id, {
    attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  });
}
