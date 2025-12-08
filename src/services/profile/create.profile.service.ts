import { Profile } from "../../models/Profile";
import { User } from "../../models/User";

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
    avatarUrl: data.avatarUrl ?? "/media/profile/none.jpg",
    address: data.address ?? "",
    referredId: data.referredId ? `${data.referredId}` : "None",
  });
}

export async function deleteProfileByUserId(userId: string) {
  const user = await User.findOne({
    where: { id: userId },
    attributes: [
      "id",
      "username",
      "firstname",
      "lastname",
      "email",
      "phoneNumber",
    ],
  });

  const deletedCount = await Profile.destroy({ where: { userId } });
  return { deletedCount, user };
}
