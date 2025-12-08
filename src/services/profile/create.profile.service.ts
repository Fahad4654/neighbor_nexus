import { Profile } from "../../models/Profile";

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
