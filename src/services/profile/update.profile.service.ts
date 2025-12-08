import { Profile } from "../../models/Profile";

export async function updateProfileByUserId(
  userId: string,
  updates: Partial<Profile>
) {
  const profile = await Profile.findOne({ where: { userId } });
  if (!profile) return null;

  const allowedFields: Array<keyof Profile> = ["bio", "address", "avatarUrl"];
  const filteredUpdates: Partial<Profile> = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  if (Object.keys(filteredUpdates).length === 0) return null;

  await profile.update(filteredUpdates);

  return Profile.findByPk(profile.id, {
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
}
