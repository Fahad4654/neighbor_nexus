import { Profile } from "../../models/Profile";
import { User } from "../../models/User";

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
