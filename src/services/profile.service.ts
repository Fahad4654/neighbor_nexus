import { Profile } from "../models/Profile";
import { User } from "../models/User";
import { generateToken } from "./user.service";

export async function findAllProfiles(
  order = "id",
  asc = "ASC",
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Profile.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
    nest: true,
    raw: true,
    limit: pageSize,
    offset,
    order: [[order, asc]],
  });
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}
export function playerId(userId: string) {
  return `FK-${generateToken(userId)}`;
}

export async function createProfile(data: {
  userId: string;
  bio?: string;
  avatarUrl?: string;
  address?: string;
  referredId?: string;
}) {
  return Profile.create({
    userId: data.userId,
    bio: data.bio ?? "",
    avatarUrl: data.avatarUrl ?? "/media/none.jpg",
    address: data.address ?? "",
    playerId: playerId(data.userId),
    referredId: data.referredId ? `${data.referredId}` : "None",
  });
}

export async function deleteProfileByUserId(userId: string) {
  const user = await User.findOne({
    where: { id: userId },
    attributes: ["id", "name", "email"],
  });

  const deletedCount = await Profile.destroy({ where: { userId } });
  return { deletedCount, user };
}

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
